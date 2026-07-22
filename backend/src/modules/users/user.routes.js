import express from "express";
import multer from "multer";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { currentProfile, updateProfile, uploadAvatar } from "./user.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
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
