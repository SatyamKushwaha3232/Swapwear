import jwt from "jsonwebtoken";
import { appConfig } from "../config/app.config.js";

function requireSecret(secret, name) {
  if (!secret) {
    throw new Error(`${name} is missing`);
  }
}

export function signAccessToken(user) {
  requireSecret(appConfig.auth.accessSecret, "JWT_ACCESS_SECRET");

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    appConfig.auth.accessSecret,
    { expiresIn: appConfig.auth.accessExpiresIn }
  );
}

export function signRefreshToken(user) {
  requireSecret(appConfig.auth.refreshSecret, "JWT_REFRESH_SECRET");

  return jwt.sign(
    {
      sub: user.id,
      tokenType: "refresh",
    },
    appConfig.auth.refreshSecret,
    { expiresIn: appConfig.auth.refreshExpiresIn }
  );
}

export function verifyAccessToken(token) {
  requireSecret(appConfig.auth.accessSecret, "JWT_ACCESS_SECRET");
  return jwt.verify(token, appConfig.auth.accessSecret);
}

export function verifyRefreshToken(token) {
  requireSecret(appConfig.auth.refreshSecret, "JWT_REFRESH_SECRET");
  return jwt.verify(token, appConfig.auth.refreshSecret);
}
