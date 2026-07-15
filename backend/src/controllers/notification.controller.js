import {
  fetchNotifications,
  createNotification,
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notification.service.js";

function sendError(res, err) {
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Notification action failed",
  });
}

export async function getNotifications(req, res) {
  try {
    const data = await fetchNotifications(req.user, req.query.limit);
    res.json({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
}

export async function addNotification(req, res) {
  try {
    const data = await createNotification(req.body, req.user);
    req.app.get("io")?.to(`user:${data.user_id}`).emit("notification:new", data);
    res.status(201).json({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
}

export async function markAsRead(req, res) {
  try {
    const data = await markNotificationRead(req.params.id, req.user);
    req.app.get("io")?.to(`user:${data.user_id}`).emit("notification:update", data);
    res.json({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
}

export async function markAllAsRead(req, res) {
  try {
    await markAllNotificationsRead(req.user);
    req.app.get("io")?.to(`user:${req.user.id}`).emit("notification:refresh", {
      user_id: req.user.id,
    });
    res.json({ success: true });
  } catch (err) {
    sendError(res, err);
  }
}

export async function removeNotification(req, res) {
  try {
    await deleteNotification(req.params.id, req.user);
    req.app.get("io")?.to(`user:${req.user.id}`).emit("notification:delete", {
      id: req.params.id,
      user_id: req.user.id,
    });
    res.json({ success: true });
  } catch (err) {
    sendError(res, err);
  }
}
