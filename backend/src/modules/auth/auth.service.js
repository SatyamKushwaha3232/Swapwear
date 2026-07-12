import { prisma } from "../../config/prisma.js";
import { assertStrongPassword, hashPassword, verifyPassword } from "../../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/tokens.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function registerUser({ fullName, email, password }) {
  const cleanEmail = normalizeEmail(email);
  const cleanName = String(fullName || "").trim();

  if (!cleanName) throw new Error("Full name is required");
  if (!cleanEmail) throw new Error("Email is required");
  assertStrongPassword(password);

  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) throw new Error("Email is already registered");

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: cleanEmail,
      passwordHash,
      profile: {
        create: {
          fullName: cleanName,
          email: cleanEmail,
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
  if (!cleanEmail || !password) throw new Error("Email and password are required");

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    include: { profile: true },
  });

  if (!user || user.status !== "ACTIVE") {
    throw new Error("Invalid email or password");
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new Error("Invalid email or password");

  return createAuthPayload(user);
}

export async function refreshAuth(refreshToken) {
  if (!refreshToken) throw new Error("Refresh token missing");

  const payload = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { profile: true },
  });

  if (!user || user.status !== "ACTIVE") {
    throw new Error("Account unavailable");
  }

  return createAuthPayload(user);
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
