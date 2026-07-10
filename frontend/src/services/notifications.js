import { supabase } from "../lib/supabase";

const MISSING_TABLE_CODES = new Set(["42P01", "42703"]);

function isMissingNotificationTable(error) {
  return MISSING_TABLE_CODES.has(error?.code) || /notifications/i.test(error?.message || "");
}

function formatNotification(item = {}) {
  return {
    id: item.id,
    user_id: item.user_id,
    actor_id: item.actor_id || null,
    type: item.type || "general",
    title: item.title || "SwapWear update",
    message: item.message || "",
    link: item.link || "",
    data: item.data || {},
    is_read: Boolean(item.is_read),
    read_at: item.read_at || null,
    created_at: item.created_at,
  };
}

export async function getNotifications(userId, limit = 30) {
  try {
    if (!userId) return { success: true, data: [] };

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: (data || []).map(formatNotification) };
  } catch (error) {
    if (isMissingNotificationTable(error)) return { success: true, data: [] };
    return { success: false, error: error.message || "Unable to fetch notifications", data: [] };
  }
}

export async function createNotification(payload = {}) {
  try {
    const userId = payload.userId || payload.user_id;
    if (!userId) return { success: false, error: "Notification user missing" };

    const body = {
      user_id: userId,
      actor_id: payload.actorId || payload.actor_id || null,
      type: payload.type || "general",
      title: payload.title || "SwapWear update",
      message: payload.message || "",
      link: payload.link || "",
      data: payload.data || {},
      is_read: false,
    };

    const { data, error } = await supabase
      .from("notifications")
      .insert([body])
      .select("*")
      .single();

    if (error) throw error;

    return { success: true, data: formatNotification(data) };
  } catch (error) {
    if (isMissingNotificationTable(error)) return { success: false, error: "Notifications table missing" };
    return { success: false, error: error.message || "Unable to create notification" };
  }
}

export async function markNotificationRead(id) {
  try {
    if (!id) return { success: false, error: "Notification missing" };

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return { success: true, data: formatNotification(data) };
  } catch (error) {
    if (isMissingNotificationTable(error)) return { success: true };
    return { success: false, error: error.message || "Unable to mark notification read" };
  }
}

export async function markAllNotificationsRead(userId) {
  try {
    if (!userId) return { success: false, error: "User missing" };

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    if (isMissingNotificationTable(error)) return { success: true };
    return { success: false, error: error.message || "Unable to mark notifications read" };
  }
}

export async function deleteNotification(id) {
  try {
    if (!id) return { success: false, error: "Notification missing" };

    const { error } = await supabase.from("notifications").delete().eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    if (isMissingNotificationTable(error)) return { success: true };
    return { success: false, error: error.message || "Unable to delete notification" };
  }
}

export function subscribeToNotifications(userId, callback) {
  if (!userId) return null;

  const channelId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  return supabase
    .channel(`notifications_${userId}_${channelId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const row = payload.new?.id ? payload.new : payload.old;
        if (row) callback(formatNotification(row), payload.eventType);
      }
    )
    .subscribe();
}

export async function notifySwapRequest({ ownerId, requesterId, requesterName, ownerItem, swapId }) {
  if (!ownerId || String(ownerId) === String(requesterId)) return { success: true };

  return createNotification({
    userId: ownerId,
    actorId: requesterId,
    type: "swap_request",
    title: "New swap request",
    message: `${requesterName || "Someone"} wants to swap for ${ownerItem?.title || "your item"}.`,
    link: "/swaps",
    data: { swap_id: swapId, listing_id: ownerItem?.id || null },
  });
}

export async function notifySwapStatus({ userId, actorId, status, itemTitle, swapId }) {
  if (!userId || String(userId) === String(actorId)) return { success: true };

  const titles = {
    accepted: "Swap accepted",
    rejected: "Swap rejected",
    cancelled: "Swap cancelled",
    shipped: "Swap handover confirmed",
    delivered: "Swap received",
    completed: "Swap completed",
  };

  return createNotification({
    userId,
    actorId,
    type: `swap_${status}`,
    title: titles[status] || "Swap updated",
    message: `Your swap${itemTitle ? ` for ${itemTitle}` : ""} is now ${status}.`,
    link: "/swaps",
    data: { swap_id: swapId },
  });
}

export async function notifyNewMessage({ userId, actorId, conversationId, preview }) {
  if (!userId || String(userId) === String(actorId)) return { success: true };

  return createNotification({
    userId,
    actorId,
    type: "message",
    title: "New message",
    message: preview || "You have a new chat message.",
    link: "/chat",
    data: { conversation_id: conversationId },
  });
}
