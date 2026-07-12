import { prisma } from "../config/prisma.js";
import { verifyAccessToken } from "../utils/tokens.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({ success: false, error: "Account unavailable" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}

export function requireAdmin(req, res, next) {
  const role = req.user?.role;

  if (!["ADMIN", "OWNER", "MODERATOR"].includes(role)) {
    return res.status(403).json({ success: false, error: "Admin access required" });
  }

  next();
}
