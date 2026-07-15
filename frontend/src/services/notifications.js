import { io } from "socket.io-client";
import { API_BASE_URL, backendRequest, getBackendAccessToken } from "../lib/backendApi";

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");
let notificationSocket = null;

function getNotificationSocket() {
  if (!notificationSocket) {
    notificationSocket = io(SOCKET_URL, { autoConnect: true, transports: ["websocket", "polling"], auth: { token: getBackendAccessToken() } });
  }
  return notificationSocket;
}

function formatNotification(row = {}) {
  return {
    id: String(row.id),
    user_id: row.user_id || row.userId,
    actor_id: row.actor_id || row.actorId || null,
    type: row.type || "general",
    title: row.title || "Notification",
    message: row.message || "",
    link: row.link || "",
    data: row.data || {},
    is_read: Boolean(row.is_read ?? row.isRead),
    read_at: row.read_at || row.readAt || null,
    created_at: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

export async function getNotifications(_userId, limit = 30) {
  try {
    const data = await backendRequest(`/notifications?limit=${encodeURIComponent(limit)}`);
    return { success: true, data: (data || []).map(formatNotification) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to load notifications", data: [] };
  }
}

export async function createNotification(payload = {}) {
  try {
    const data = await backendRequest("/notifications", { method: "POST", body: JSON.stringify(payload) });
    return { success: true, data: formatNotification(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to create notification" };
  }
}

export async function markNotificationRead(id) {
  try {
    const data = await backendRequest(`/notifications/${id}/read`, { method: "PATCH" });
    return { success: true, data: formatNotification(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to mark notification read" };
  }
}

export async function markAllNotificationsRead() {
  try {
    await backendRequest("/notifications/read-all", { method: "PATCH" });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Unable to mark all read" };
  }
}

export async function deleteNotification(id) {
  try {
    await backendRequest(`/notifications/${id}`, { method: "DELETE" });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Unable to delete notification" };
  }
}

export function subscribeToNotifications(userId, callback) {
  const socket = getNotificationSocket();
  socket.emit("user:join", userId);

  const onInsert = (payload) => callback(formatNotification(payload), "INSERT");
  const onUpdate = (payload) => callback(formatNotification(payload), "UPDATE");
  const onDelete = (payload) => callback(formatNotification(payload), "DELETE");
  const onRefresh = () => callback(null, "REFRESH");

  socket.on("notification:new", onInsert);
  socket.on("notification:update", onUpdate);
  socket.on("notification:delete", onDelete);
  socket.on("notification:refresh", onRefresh);

  return {
    unsubscribe() {
      socket.off("notification:new", onInsert);
      socket.off("notification:update", onUpdate);
      socket.off("notification:delete", onDelete);
      socket.off("notification:refresh", onRefresh);
      socket.emit("user:leave", userId);
    },
  };
}

export async function notifySwapRequest({ ownerId, requesterId, requesterName, ownerItem, swapId }) {
  return createNotification({
    userId: ownerId,
    actorId: requesterId,
    type: "swap_request",
    title: "New swap request",
    message: `${requesterName || "Someone"} wants to swap for ${ownerItem?.title || "your item"}.`,
    link: "/swaps",
    data: { swap_id: swapId },
  });
}

export async function notifySwapStatus({ userId, actorId, status, itemTitle, swapId }) {
  return createNotification({
    userId,
    actorId,
    type: `swap_${status}`,
    title: "Swap updated",
    message: `${itemTitle || "Your swap"} is now ${status}.`,
    link: "/swaps",
    data: { swap_id: swapId },
  });
}

export async function notifyNewMessage({ userId, actorId, conversationId, preview }) {
  return createNotification({
    userId,
    actorId,
    type: "message",
    title: "New message",
    message: preview || "You have a new message.",
    link: `/chat/${conversationId}`,
    data: { conversation_id: conversationId },
  });
}
