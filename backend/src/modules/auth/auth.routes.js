import express from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  confirmPasswordReset,
  forgotPassword,
  confirmPhoneOtp,
  login,
  logout,
  me,
  oauthCallback,
  oauthStart,
  refresh,
  register,
  sendPhoneOtp,
} from "./auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", confirmPasswordReset);
router.post("/phone/request-otp", sendPhoneOtp);
router.post("/phone/verify-otp", confirmPhoneOtp);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/oauth/:provider/start", oauthStart);
router.get("/oauth/:provider/callback", oauthCallback);
router.get("/me", requireAuth, me);

export default router;
