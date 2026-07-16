import { prisma } from "../../config/prisma.js";
import { assertStrongPassword, hashPassword, verifyPassword } from "../../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/tokens.js";
import crypto from "node:crypto";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function authError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function registerUser({ fullName, email, password }) {
  const cleanEmail = normalizeEmail(email);
  const cleanName = String(fullName || "").trim();

  if (!cleanName) throw authError("Full name is required");
  if (!cleanEmail) throw authError("Email is required");
  assertStrongPassword(password);

  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) throw authError("Email is already registered", 409);

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: cleanEmail,
      passwordHash,
      profile: {
        create: {
          fullName: cleanName,
          provider: "email",
        },
      },
    },
    include: { profile: true },
  });

  return createAuthPayload(user);
}

export async function loginUser({ email, password }) {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail || !password) throw authError("Email and password are required");

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    include: { profile: true },
  });

  if (!user || user.status !== "ACTIVE") {
    throw authError("Invalid email or password", 401);
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw authError("Invalid email or password", 401);

  return createAuthPayload(user);
}

export async function refreshAuth(refreshToken) {
  if (!refreshToken) throw authError("Refresh token missing", 401);

  const payload = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { profile: true },
  });

  if (!user || user.status !== "ACTIVE") {
    throw authError("Account unavailable", 401);
  }

  return createAuthPayload(user);
}

export async function requestPasswordReset({ email }, { clientUrl } = {}) {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) throw authError("Email is required");

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

  // Keep response generic so registered emails cannot be enumerated.
  if (!user || user.status !== "ACTIVE") {
    return { sent: true };
  }

  await prisma.$executeRaw`
    update "PasswordResetToken"
    set "usedAt" = now()
    where "userId" = ${user.id}
      and "usedAt" is null
  `;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.$executeRaw`
    insert into "PasswordResetToken" ("id", "userId", "tokenHash", "expiresAt", "createdAt")
    values (${crypto.randomUUID()}, ${user.id}, ${hashResetToken(token)}, ${expiresAt}, now())
  `;

  const resetUrl = `${clientUrl || process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${token}`;

  return {
    sent: true,
    resetUrl,
    expiresAt,
  };
}

export async function resetPassword({ token, password }) {
  if (!token) throw authError("Reset token is required");
  assertStrongPassword(password);

  const tokenHash = hashResetToken(token);
  const [resetRecord] = await prisma.$queryRaw`
    select
      prt."id",
      prt."userId",
      prt."expiresAt",
      prt."usedAt",
      u."status" as "userStatus"
    from "PasswordResetToken" prt
    join "User" u on u."id" = prt."userId"
    where prt."tokenHash" = ${tokenHash}
    limit 1
  `;

  if (
    !resetRecord ||
    resetRecord.usedAt ||
    resetRecord.expiresAt < new Date() ||
    resetRecord.userStatus !== "ACTIVE"
  ) {
    throw authError("Reset link is invalid or expired", 400);
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    }),
    prisma.$executeRaw`
      update "PasswordResetToken"
      set "usedAt" = now()
      where "id" = ${resetRecord.id}
    `,
    prisma.$executeRaw`
      update "PasswordResetToken"
      set "usedAt" = now()
      where "userId" = ${resetRecord.userId}
        and "usedAt" is null
        and "id" <> ${resetRecord.id}
    `,
  ]);

  return { reset: true };
}

export function createAuthPayload(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    user,
    session: {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "bearer",
    },
  };
}
