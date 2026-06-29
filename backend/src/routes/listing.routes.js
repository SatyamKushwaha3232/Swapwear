import express from "express";
import multer from "multer";
import {
  getListings,
  getListingById,
  createListing,
  deleteListing,
} from "../controllers/listing.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", getListings);
router.get("/:id", getListingById);

router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 6 },
    { name: "video", maxCount: 1 },
  ]),
  createListing
);

router.delete("/:id", deleteListing);

export default router;