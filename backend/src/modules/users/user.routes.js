import express from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { appConfig } from "../../config/app.config.js";
import { currentProfile, updateProfile, uploadAvatar } from "./user.controller.js";

const router = express.Router();
const avatarDir = path.resolve(appConfig.uploadDir, "avatars");

fs.mkdirSync(avatarDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      cb(new Error("Please upload an image file"));
      return;
    }

    cb(null, true);
  },
});

router.get("/me/profile", requireAuth, currentProfile);
router.patch("/me/profile", requireAuth, updateProfile);
router.post("/me/avatar", requireAuth, upload.single("avatar"), uploadAvatar);

export default router;
