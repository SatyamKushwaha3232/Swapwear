import express from "express";
import {
  getNotifications,
  addNotification,
  markAllAsRead,
  markAsRead,
  removeNotification,
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getNotifications);
router.post("/", addNotification);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.delete("/:id", removeNotification);

export default router;
