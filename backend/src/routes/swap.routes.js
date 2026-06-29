import express from "express";
import {
  sendSwapRequest,
  getSwapRequests,
  acceptSwapRequest,
  rejectSwapRequest,
} from "../controllers/swap.controller.js";

const router = express.Router();

router.post("/", sendSwapRequest);
router.get("/", getSwapRequests);
router.patch("/:id/accept", acceptSwapRequest);
router.patch("/:id/reject", rejectSwapRequest);

export default router;