import { supabase } from "../config/supabase.js";

export async function fetchNotifications(userId) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createNotification(payload) {
  const { data, error } = await supabase
    .from("notifications")
    .insert([
      {
        user_id: payload.user_id,
        title: payload.title,
        message: payload.message || "",
        type: payload.type || "general",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markNotificationRead(id) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}