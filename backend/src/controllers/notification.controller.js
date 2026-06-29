import {
  fetchNotifications,
  createNotification,
  markNotificationRead,
} from "../services/notification.service.js";

export async function getNotifications(req, res) {
  try {
    const data = await fetchNotifications(req.query.userId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function addNotification(req, res) {
  try {
    const data = await createNotification(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function markAsRead(req, res) {
  try {
    const data = await markNotificationRead(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}