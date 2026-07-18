import express from "express";
import multer from "multer";
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listing.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 60 * 1024 * 1024,
    files: 6,
  },
  fileFilter(_req, file, cb) {
    if (file.fieldname === "images" && !file.mimetype?.startsWith("image/")) {
      cb(new Error("Only image files are allowed for product photos"));
      return;
    }

    if (file.fieldname === "video" && !file.mimetype?.startsWith("video/")) {
      cb(new Error("Only video files are allowed for product preview"));
      return;
    }

    cb(null, true);
  },
});

router.get("/", getListings);
router.get("/:id", getListingById);

router.post(
  "/",
  requireAuth,
  upload.fields([
    { name: "images", maxCount: 6 },
    { name: "video", maxCount: 1 },
  ]),
  createListing
);

router.patch(
  "/:id",
  requireAuth,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  updateListing
);

router.delete("/:id", requireAuth, deleteListing);

export default router;
