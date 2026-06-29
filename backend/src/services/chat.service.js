import { supabase } from "../config/supabase.js";

export async function sendMessage(payload) {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert([
      {
        swap_id: payload.swap_id,
        sender_id: payload.sender_id,
        receiver_id: payload.receiver_id,
        sender_name: payload.sender_name || "User",
        receiver_name: payload.receiver_name || "User",
        message: payload.message,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMessages(swapId) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("swap_id", swapId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}