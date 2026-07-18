import dotenv from "dotenv";

dotenv.config();

function splitCsv(value, fallback = []) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .concat(fallback)
    .filter((item, index, list) => list.indexOf(item) === index);
}

export const appConfig = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  clientUrls: splitCsv(process.env.CLIENT_URLS, [process.env.CLIENT_URL || "http://localhost:5173"]),
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  publicFileBaseUrl:
    process.env.PUBLIC_FILE_BASE_URL || "http://localhost:5000/uploads",
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  oauth: {
    callbackBaseUrl: process.env.OAUTH_CALLBACK_BASE_URL || "http://localhost:5000/api/auth/oauth",
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
    },
  },
  payments: {
    provider: process.env.PAYMENT_PROVIDER || "manual",
  },
  courier: {
    provider: process.env.COURIER_PROVIDER || "manual",
  },
  turn: {
    url: process.env.TURN_URL || "",
    username: process.env.TURN_USERNAME || "",
    credential: process.env.TURN_CREDENTIAL || "",
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || (process.env.NODE_ENV === "production" ? 300 : 3000)),
  },
};

export function validateProductionConfig() {
  if (appConfig.env !== "production") return;

  const missing = [];
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!appConfig.auth.accessSecret || appConfig.auth.accessSecret.includes("replace-with")) {
    missing.push("JWT_ACCESS_SECRET");
  }
  if (!appConfig.auth.refreshSecret || appConfig.auth.refreshSecret.includes("replace-with")) {
    missing.push("JWT_REFRESH_SECRET");
  }
  if (!appConfig.clientUrl || appConfig.clientUrl.includes("localhost")) {
    missing.push("CLIENT_URL");
  }
  if (!appConfig.publicFileBaseUrl || appConfig.publicFileBaseUrl.includes("localhost")) {
    missing.push("PUBLIC_FILE_BASE_URL");
  }

  if (missing.length) {
    throw new Error(`Production env missing/unsafe: ${missing.join(", ")}`);
  }
}
