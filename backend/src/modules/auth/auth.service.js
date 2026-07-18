import { prisma } from "../../config/prisma.js";
import { assertStrongPassword, hashPassword, verifyPassword } from "../../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/tokens.js";
import { appConfig } from "../../config/app.config.js";
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

function normalizePhone(phone) {
  return String(phone || "").replace(/[^\d+]/g, "").trim();
}

function hashOtp(phone, code) {
  return crypto.createHash("sha256").update(`${phone}:${code}:${appConfig.auth.refreshSecret}`).digest("hex");
}

function providerConfig(provider) {
  const key = provider === "azure" ? "microsoft" : provider;
  const config = {
    google: {
      key: "google",
      clientId: appConfig.oauth.google.clientId,
      clientSecret: appConfig.oauth.google.clientSecret,
      scope: "openid email profile",
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userUrl: "https://openidconnect.googleapis.com/v1/userinfo",
    },
    github: {
      key: "github",
      clientId: appConfig.oauth.github.clientId,
      clientSecret: appConfig.oauth.github.clientSecret,
      scope: "read:user user:email",
      authUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      userUrl: "https://api.github.com/user",
      emailsUrl: "https://api.github.com/user/emails",
    },
    microsoft: {
      key: "microsoft",
      clientId: appConfig.oauth.microsoft.clientId,
      clientSecret: appConfig.oauth.microsoft.clientSecret,
      scope: "openid email profile User.Read",
      authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      userUrl: "https://graph.microsoft.com/v1.0/me",
    },
  }[key];

  if (!config) throw authError("Unsupported auth provider", 404);
  if (!config.clientId || !config.clientSecret) {
    throw authError(`${config.key} OAuth is not configured`, 503);
  }
  return config;
}

export function createOAuthStart(provider, state) {
  const config = providerConfig(provider);
  const callbackUrl = `${appConfig.oauth.callbackBaseUrl}/${config.key}/callback`;
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: config.scope,
    state,
  });

  if (config.key === "google") params.set("prompt", "select_account");
  return { provider: config.key, url: `${config.authUrl}?${params.toString()}` };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw authError(data.error_description || data.error || "OAuth provider request failed", 502);
  }
  return data;
}

async function exchangeOAuthCode(config, code) {
  const callbackUrl = `${appConfig.oauth.callbackBaseUrl}/${config.key}/callback`;
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: callbackUrl,
    grant_type: "authorization_code",
  });

  return fetchJson(config.tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
}

async function loadOAuthProfile(config, accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}`, Accept: "application/json" };
  const profile = await fetchJson(config.userUrl, { headers });

  if (config.key === "github") {
    let email = profile.email || "";
    if (!email && config.emailsUrl) {
      const emails = await fetchJson(config.emailsUrl, { headers });
      email = emails.find((item) => item.primary && item.verified)?.email || emails[0]?.email || "";
    }
    return {
      accountId: String(profile.id),
      email: normalizeEmail(email),
      fullName: profile.name || profile.login || "GitHub user",
      avatarUrl: profile.avatar_url || "",
      rawProfile: profile,
    };
  }

  if (config.key === "microsoft") {
    return {
      accountId: String(profile.id),
      email: normalizeEmail(profile.mail || profile.userPrincipalName),
      fullName: profile.displayName || "Microsoft user",
      avatarUrl: "",
      rawProfile: profile,
    };
  }

  return {
    accountId: String(profile.sub),
    email: normalizeEmail(profile.email),
    fullName: profile.name || profile.given_name || "Google user",
    avatarUrl: profile.picture || "",
    rawProfile: profile,
  };
}

export async function completeOAuthLogin({ provider, code }) {
  if (!code) throw authError("OAuth code is missing");

  const config = providerConfig(provider);
  const token = await exchangeOAuthCode(config, code);
  const profile = await loadOAuthProfile(config, token.access_token);

  if (!profile.accountId) throw authError("OAuth profile id missing", 502);
  if (!profile.email) throw authError("OAuth provider did not return an email", 400);

  const user = await prisma.$transaction(async (tx) => {
    const identity = await tx.authIdentity.findUnique({
      where: {
        provider_providerAccountId: {
          provider: config.key,
          providerAccountId: profile.accountId,
        },
      },
      include: { user: { include: { profile: true } } },
    });

    if (identity?.user) {
      return tx.user.update({
        where: { id: identity.userId },
        data: { emailVerified: true },
        include: { profile: true },
      });
    }

    const existingUser = await tx.user.findUnique({
      where: { email: profile.email },
      include: { profile: true },
    });

    const userRecord = existingUser || await tx.user.create({
      data: {
        email: profile.email,
        passwordHash: await hashPassword(crypto.randomBytes(24).toString("hex")),
        emailVerified: true,
        profile: {
          create: {
            fullName: profile.fullName,
            avatarUrl: profile.avatarUrl || null,
            provider: config.key,
          },
        },
      },
      include: { profile: true },
    });

    await tx.authIdentity.create({
      data: {
        userId: userRecord.id,
        provider: config.key,
        providerAccountId: profile.accountId,
        email: profile.email,
        displayName: profile.fullName,
        avatarUrl: profile.avatarUrl || null,
        rawProfile: profile.rawProfile || {},
      },
    });

    return tx.user.findUnique({ where: { id: userRecord.id }, include: { profile: true } });
  });

  if (!user || user.status !== "ACTIVE") throw authError("Account unavailable", 401);
  return createAuthPayload(user);
}

export async function requestPhoneOtp({ phone }) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone || cleanPhone.length < 10) throw authError("Valid phone number is required");

  await prisma.phoneOtp.updateMany({
    where: { phone: cleanPhone, purpose: "login", usedAt: null },
    data: { usedAt: new Date() },
  });

  const code = String(crypto.randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.phoneOtp.create({
    data: {
      phone: cleanPhone,
      codeHash: hashOtp(cleanPhone, code),
      expiresAt,
    },
  });

  return {
    sent: true,
    expiresAt,
    devOtp: appConfig.env === "production" ? null : code,
  };
}

export async function verifyPhoneOtp({ phone, code, fullName }) {
  const cleanPhone = normalizePhone(phone);
  const cleanCode = String(code || "").trim();
  if (!cleanPhone || !cleanCode) throw authError("Phone and OTP are required");

  const otp = await prisma.phoneOtp.findFirst({
    where: {
      phone: cleanPhone,
      purpose: "login",
      codeHash: hashOtp(cleanPhone, cleanCode),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) throw authError("OTP is invalid or expired", 400);

  const user = await prisma.$transaction(async (tx) => {
    await tx.phoneOtp.update({ where: { id: otp.id }, data: { usedAt: new Date() } });

    const identity = await tx.authIdentity.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "phone",
          providerAccountId: cleanPhone,
        },
      },
      include: { user: { include: { profile: true } } },
    });

    if (identity?.user) return identity.user;

    const profileOwner = await tx.profile.findFirst({
      where: { phone: cleanPhone },
      include: { user: { include: { profile: true } } },
    });

    if (profileOwner?.user) {
      await tx.authIdentity.create({
        data: {
          userId: profileOwner.userId,
          provider: "phone",
          providerAccountId: cleanPhone,
          displayName: profileOwner.fullName || "Phone user",
        },
      });

      return profileOwner.user;
    }

    const email = `phone-${crypto.createHash("sha1").update(cleanPhone).digest("hex").slice(0, 12)}@swapwear.phone`;
    const created = await tx.user.create({
      data: {
        email,
        passwordHash: await hashPassword(crypto.randomBytes(24).toString("hex")),
        emailVerified: true,
        profile: {
          create: {
            fullName: String(fullName || "Phone user").trim(),
            phone: cleanPhone,
            provider: "phone",
          },
        },
      },
      include: { profile: true },
    });

    await tx.authIdentity.create({
      data: {
        userId: created.id,
        provider: "phone",
        providerAccountId: cleanPhone,
        displayName: created.profile?.fullName || "Phone user",
      },
    });

    return created;
  });

  return createAuthPayload(user);
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
