import express from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  confirmPasswordReset,
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  register,
} from "./auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", confirmPasswordReset);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
