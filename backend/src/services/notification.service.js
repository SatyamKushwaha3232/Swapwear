import { prisma } from "../config/prisma.js";

function parseBigInt(id, label = "id") {
  try {
    return BigInt(id);
  } catch {
    const error = new Error(`Invalid ${label}`);
    error.status = 400;
    throw error;
  }
}

function isAdmin(user) {
  return ["ADMIN", "OWNER", "MODERATOR"].includes(user?.role);
}

function formatNotification(item = {}) {
  return {
    id: String(item.id),
    user_id: item.userId,
    actor_id: item.actorId || null,
    type: item.type || "general",
    title: item.title || "SwapWear update",
    message: item.message || "",
    link: item.link || "",
    data: item.data || {},
    is_read: Boolean(item.isRead),
    read_at: item.readAt?.toISOString?.() || item.readAt || null,
    created_at: item.createdAt?.toISOString?.() || item.createdAt,
  };
}

export async function fetchNotifications(user, limit = 30) {
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: Math.min(Number(limit) || 30, 100),
  });

  return notifications.map(formatNotification);
}

export async function createNotification(payload, actor = null) {
  const userId = payload.userId || payload.user_id;
  if (!userId) {
    const error = new Error("Notification user missing");
    error.status = 400;
    throw error;
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      actorId: payload.actorId || payload.actor_id || actor?.id || null,
      type: payload.type || "general",
      title: payload.title || "SwapWear update",
      message: payload.message || "",
      link: payload.link || "",
      data: payload.data || {},
      isRead: false,
    },
  });

  return formatNotification(notification);
}

export async function markNotificationRead(id, user) {
  const notification = await prisma.notification.findUnique({
    where: { id: parseBigInt(id, "notification id") },
  });

  if (!notification) {
    const error = new Error("Notification not found");
    error.status = 404;
    throw error;
  }

  if (notification.userId !== user.id && !isAdmin(user)) {
    const error = new Error("You can only update your own notification");
    error.status = 403;
    throw error;
  }

  const updated = await prisma.notification.update({
    where: { id: notification.id },
    data: { isRead: true, readAt: new Date() },
  });

  return formatNotification(updated);
}

export async function markAllNotificationsRead(user) {
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  return true;
}

export async function deleteNotification(id, user) {
  const notification = await prisma.notification.findUnique({
    where: { id: parseBigInt(id, "notification id") },
  });

  if (!notification) return true;

  if (notification.userId !== user.id && !isAdmin(user)) {
    const error = new Error("You can only delete your own notification");
    error.status = 403;
    throw error;
  }

  await prisma.notification.delete({ where: { id: notification.id } });
  return true;
}
