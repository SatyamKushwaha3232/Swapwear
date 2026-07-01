import { supabase } from "../lib/supabase";

function formatConversation(item = {}) {
  return {
    id: item.id,
    swap_id: item.swap_id,
    user1_id: item.user1_id,
    user2_id: item.user2_id,
    last_message: item.last_message || "",
    last_message_at: item.last_message_at,
    created_at: item.created_at,
  };
}

function formatMessage(item = {}) {
  return {
    id: item.id,
    conversation_id: item.conversation_id,
    sender_id: item.sender_id,
    message: item.message || "",
    image_url: item.image_url || "",
    seen: Boolean(item.seen),
    created_at: item.created_at,
  };
}

export async function getOrCreateConversation({ swapId, user1Id, user2Id }) {
  try {
    const { data: existing, error: findError } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("swap_id", swapId)
      .maybeSingle();

    if (findError) throw findError;
    if (existing) return { success: true, data: formatConversation(existing) };

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert([
        {
          swap_id: swapId,
          user1_id: user1Id,
          user2_id: user2Id,
          last_message: "",
          last_message_at: new Date().toISOString(),
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    return { success: true, data: formatConversation(data) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getMyConversations(userId) {
  try {
    if (!userId) return { success: true, data: [] };

    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: (data || []).map(formatConversation) };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function getMessages(conversationId) {
  try {
    if (!conversationId) return { success: true, data: [] };

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return { success: true, data: (data || []).map(formatMessage) };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function sendMessage({ conversationId, senderId, message }) {
  try {
    const cleanMessage = String(message || "").trim();

    if (!conversationId) return { success: false, error: "Conversation missing" };
    if (!senderId) return { success: false, error: "Sender missing" };
    if (!cleanMessage) return { success: false, error: "Message is required" };

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        {
          conversation_id: conversationId,
          sender_id: senderId,
          message: cleanMessage,
          seen: false,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    await supabase
      .from("chat_conversations")
      .update({
        last_message: cleanMessage,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    return { success: true, data: formatMessage(data) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function subscribeToConversationMessages(conversationId, callback) {
  if (!conversationId) return null;

  return supabase
    .channel(`chat_messages_${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => callback(formatMessage(payload.new))
    )
    .subscribe();
}

export function subscribeToMyConversations(userId, callback) {
  if (!userId) return null;

  return supabase
    .channel(`chat_conversations_${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_conversations",
      },
      () => callback()
    )
    .subscribe();
}