import express from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  createSwapDelivery,
  getAddresses,
  getSwapDeliveryOrders,
  makeDefaultAddress,
  patchDeliveryStatus,
  patchDeliveryTracking,
  postAddress,
  postDeliveryProof,
} from "./delivery.controller.js";

const router = express.Router();

router.use(requireAuth);

router.get("/addresses", getAddresses);
router.post("/addresses", postAddress);
router.patch("/addresses/:id/default", makeDefaultAddress);

router.get("/swaps/:swapId", getSwapDeliveryOrders);
router.post("/swaps/:swapId", createSwapDelivery);

router.patch("/:id/status", patchDeliveryStatus);
router.patch("/:id/tracking", patchDeliveryTracking);
router.post("/:id/proof", postDeliveryProof);

export default router;
