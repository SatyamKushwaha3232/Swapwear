import express from "express";

import {
  fetchWishlist,
  createWishlist,
  deleteWishlist,
} from "../controllers/wishlist.controller.js";

const router = express.Router();

router.get("/", fetchWishlist);

router.post("/", createWishlist);

router.delete("/:id", deleteWishlist);

export default router;