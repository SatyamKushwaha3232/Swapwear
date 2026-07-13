import express from "express";

import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import {
  adminPayments,
  createOrder,
  myPayments,
  patchPaymentStatus,
  webhook,
} from "./payments.controller.js";

const router = express.Router();

router.post("/webhook", webhook);

router.use(requireAuth);

router.post("/order", createOrder);
router.get("/me", myPayments);
router.patch("/:id/status", patchPaymentStatus);
router.get("/admin", requireAdmin, adminPayments);

export default router;
