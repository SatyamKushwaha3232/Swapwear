import express from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { currentProfile, updateProfile } from "./user.controller.js";

const router = express.Router();

router.get("/me/profile", requireAuth, currentProfile);
router.patch("/me/profile", requireAuth, updateProfile);

export default router;
