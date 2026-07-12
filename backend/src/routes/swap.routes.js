import express from "express";

import {
  acceptSwapRequest,
  archiveSwapItems,
  confirmHandover,
  confirmReceived,
  createDispute,
  getSwapRequest,
  getSwapRequests,
  listOpenDisputes,
  rejectSwapRequest,
  resolveDispute,
  sendSwapRequest,
  setSwapStatus,
  updateDeliveryMethod,
} from "../controllers/swap.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/disputes/open", requireAdmin, listOpenDisputes);
router.patch("/disputes/:disputeId/resolve", requireAdmin, resolveDispute);

router.post("/", sendSwapRequest);
router.get("/", getSwapRequests);
router.get("/:id", getSwapRequest);
router.patch("/:id/status", setSwapStatus);
router.patch("/:id/accept", acceptSwapRequest);
router.patch("/:id/reject", rejectSwapRequest);
router.patch("/:id/delivery-method", updateDeliveryMethod);
router.post("/:id/handover", confirmHandover);
router.post("/:id/received", confirmReceived);
router.post("/:id/dispute", createDispute);
router.post("/:id/archive-items", archiveSwapItems);

export default router;
