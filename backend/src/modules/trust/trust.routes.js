import express from "express";

import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.js";
import {
  adminDashboard,
  createReport,
  listUserReviews,
  resolveReport,
  submitReview,
} from "./trust.controller.js";

const router = express.Router();

router.get("/reviews/:userId", listUserReviews);

router.use(requireAuth);

router.post("/reports", createReport);
router.post("/reviews", submitReview);
router.get("/admin/dashboard", requireAdmin, adminDashboard);
router.patch("/admin/reports/:id", requireAdmin, resolveReport);

export default router;
