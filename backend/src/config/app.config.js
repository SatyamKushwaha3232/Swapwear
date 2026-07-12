import dotenv from "dotenv";

dotenv.config();

export const appConfig = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  publicFileBaseUrl:
    process.env.PUBLIC_FILE_BASE_URL || "http://localhost:5000/uploads",
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
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
};
