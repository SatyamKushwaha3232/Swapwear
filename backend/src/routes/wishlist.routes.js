import express from "express";

import {
  fetchWishlist,
  createWishlist,
  deleteWishlist,
} from "../controllers/wishlist.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", fetchWishlist);
router.post("/", createWishlist);
router.delete("/:id", deleteWishlist);

export default router;
