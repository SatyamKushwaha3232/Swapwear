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
    unread_count: Number(item.unread_count || 0),
  };
}

function formatMessage(item = {}) {
  return {
    id: item.id,
    conversation_id: item.conversation_id,
    sender_id: item.sender_id,
    message: item.message || "",
    image_url: item.image_url || "",
    file_url: item.file_url || "",
    file_name: item.file_name || "",
    file_type: item.file_type || "",
    message_type: item.message_type || "text",
    reply_to_id: item.reply_to_id || null,
    reply_to_text: item.reply_to_text || "",
    reply_to_sender_id: item.reply_to_sender_id || null,
    reactions: item.reactions || {},
    is_deleted: Boolean(item.is_deleted),
    is_pinned: Boolean(item.is_pinned),
    is_starred: Boolean(item.is_starred),
    seen: Boolean(item.seen),
    voice_url: item.voice_url || "",
    voice_duration: Number(item.voice_duration || 0),
    edited_at: item.edited_at || null,
    deleted_at: item.deleted_at || null,
    created_at: item.created_at,
  };
}

function lastMessageLabel(messageType, cleanMessage) {
  if (cleanMessage) return cleanMessage;
  if (messageType === "image") return "Image";
  if (messageType === "voice") return "Voice note";
  return "File";
}

async function updateMessageRow(messageId, patch) {
  const { data, error } = await supabase
    .from("chat_messages")
    .update(patch)
    .eq("id", messageId)
    .select("*")
    .single();

  if (error) throw error;
  return formatMessage(data);
}

export async function uploadChatFile(file, userId) {
  try {
    if (!file) return { success: false, error: "File missing" };

    const ext = file.name.split(".").pop() || "file";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from("chat-files").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

    if (error) throw error;

    const { data } = supabase.storage.from("chat-files").getPublicUrl(path);

    return {
      success: true,
      data: {
        url: data.publicUrl,
        name: file.name,
        type: file.type || "application/octet-stream",
      },
    };
  } catch (error) {
    return { success: false, error: error.message || "File upload failed" };
  }
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
    return { success: false, error: error.message || "Unable to create conversation" };
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

    const conversations = (data || []).map(formatConversation);
    const ids = conversations.map((chat) => chat.id);

    if (ids.length === 0) return { success: true, data: conversations };

    const { data: unreadRows, error: unreadError } = await supabase
      .from("chat_messages")
      .select("conversation_id")
      .in("conversation_id", ids)
      .eq("seen", false)
      .neq("sender_id", userId)
      .eq("is_deleted", false);

    if (unreadError) throw unreadError;

    const unreadByConversation = (unreadRows || []).reduce((acc, row) => {
      acc[row.conversation_id] = (acc[row.conversation_id] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: conversations.map((chat) => ({
        ...chat,
        unread_count: unreadByConversation[chat.id] || 0,
      })),
    };
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

export async function sendMessage({
  conversationId,
  senderId,
  message = "",
  file = null,
  replyTo = null,
  voiceDuration = 0,
}) {
  try {
    let fileData = null;
    let messageType = "text";

    if (!conversationId) return { success: false, error: "Conversation missing" };
    if (!senderId) return { success: false, error: "Sender missing" };

    if (file) {
      const upload = await uploadChatFile(file, senderId);
      if (!upload.success) throw new Error(upload.error);

      fileData = upload.data;

      if (file.type?.startsWith("image/")) messageType = "image";
      else if (file.type?.startsWith("audio/")) messageType = "voice";
      else messageType = "file";
    }

    const cleanMessage = String(message || "").trim();

    if (!cleanMessage && !fileData) {
      return { success: false, error: "Message or file is required" };
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        {
          conversation_id: conversationId,
          sender_id: senderId,
          message: cleanMessage,
          image_url: messageType === "image" ? fileData?.url || "" : "",
          file_url: messageType === "file" ? fileData?.url || "" : "",
          file_name: fileData?.name || "",
          file_type: fileData?.type || "",
          message_type: messageType,
          voice_url: messageType === "voice" ? fileData?.url || "" : "",
          voice_duration: messageType === "voice" ? voiceDuration || 0 : 0,
          reply_to_id: replyTo?.id || null,
          reply_to_text:
            replyTo?.message ||
            replyTo?.file_name ||
            (replyTo?.message_type === "voice" ? "Voice note" : ""),
          reply_to_sender_id: replyTo?.sender_id || null,
          reactions: {},
          seen: false,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    await supabase
      .from("chat_conversations")
      .update({
        last_message: lastMessageLabel(messageType, cleanMessage),
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    return { success: true, data: formatMessage(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to send message" };
  }
}

export async function forwardMessage({ sourceMessage, targetConversationId, senderId }) {
  try {
    if (!sourceMessage?.id) return { success: false, error: "Message missing" };
    if (!targetConversationId) return { success: false, error: "Conversation missing" };
    if (!senderId) return { success: false, error: "Sender missing" };

    const messageType = sourceMessage.message_type || "text";
    const cleanMessage = sourceMessage.message || "";

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        {
          conversation_id: targetConversationId,
          sender_id: senderId,
          message: cleanMessage,
          image_url: sourceMessage.image_url || "",
          file_url: sourceMessage.file_url || "",
          file_name: sourceMessage.file_name || "",
          file_type: sourceMessage.file_type || "",
          message_type: messageType,
          voice_url: sourceMessage.voice_url || "",
          voice_duration: sourceMessage.voice_duration || 0,
          reply_to_text: "Forwarded message",
          reply_to_sender_id: sourceMessage.sender_id || null,
          reactions: {},
          seen: false,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    await supabase
      .from("chat_conversations")
      .update({
        last_message: `Forwarded: ${lastMessageLabel(messageType, cleanMessage)}`,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", targetConversationId);

    return { success: true, data: formatMessage(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to forward message" };
  }
}
export async function editMessage(messageId, nextMessage) {
  try {
    const cleanMessage = String(nextMessage || "").trim();
    if (!messageId) return { success: false, error: "Message missing" };
    if (!cleanMessage) return { success: false, error: "Message cannot be empty" };

    const data = await updateMessageRow(messageId, {
      message: cleanMessage,
      edited_at: new Date().toISOString(),
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to edit message" };
  }
}

export async function deleteMessage(messageId) {
  try {
    const data = await updateMessageRow(messageId, {
      is_deleted: true,
      message: "",
      image_url: "",
      file_url: "",
      file_name: "",
      voice_url: "",
      reactions: {},
      deleted_at: new Date().toISOString(),
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to delete message" };
  }
}

export async function reactToMessage(message, emoji) {
  try {
    if (!message?.id || !emoji) return { success: false, error: "Reaction missing" };

    const current = message.reactions || {};
    const data = await updateMessageRow(message.id, {
      reactions: {
        ...current,
        [emoji]: Number(current[emoji] || 0) + 1,
      },
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to react" };
  }
}

export async function toggleMessagePin(message) {
  try {
    if (!message?.id) return { success: false, error: "Message missing" };
    const data = await updateMessageRow(message.id, {
      is_pinned: !message.is_pinned,
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to pin message" };
  }
}

export async function toggleMessageStar(message) {
  try {
    if (!message?.id) return { success: false, error: "Message missing" };
    const data = await updateMessageRow(message.id, {
      is_starred: !message.is_starred,
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to star message" };
  }
}

export async function markConversationSeen(conversationId, userId) {
  try {
    if (!conversationId || !userId) return { success: false };

    const { error } = await supabase
      .from("chat_messages")
      .update({ seen: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function setTyping(conversationId, userId, isTyping) {
  try {
    if (!conversationId || !userId) return { success: false };

    const { error } = await supabase.from("chat_typing").upsert(
      {
        conversation_id: conversationId,
        user_id: userId,
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "conversation_id,user_id" }
    );

    if (error) throw error;

    return { success: true };
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
        event: "*",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const row = payload.new?.id ? payload.new : payload.old;
        if (row) callback(formatMessage(row));
      }
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
      callback
    )
    .subscribe();
}

export function subscribeToTyping(conversationId, callback) {
  if (!conversationId) return null;

  return supabase
    .channel(`chat_typing_${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_typing",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}
