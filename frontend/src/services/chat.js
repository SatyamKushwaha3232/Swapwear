import { io } from "socket.io-client";
import { API_BASE_URL, backendRequest, getBackendAccessToken } from "../lib/backendApi";

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");
let socketInstance = null;

function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, { autoConnect: true, transports: ["websocket", "polling"], auth: { token: getBackendAccessToken() } });
  }
  return socketInstance;
}

function formatConversation(item = {}) {
  return {
    id: item.id,
    swap_id: item.swap_id,
    user1_id: item.user1_id,
    user2_id: item.user2_id,
    owner_id: item.owner_id || "",
    owner_name: item.owner_name || "SwapWear User",
    owner_avatar: item.owner_avatar || "",
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

export async function uploadChatFile(file) {
  try {
    if (!file) return { success: false, error: "File missing" };
    if (file.size > 25 * 1024 * 1024) return { success: false, error: "Attachment must be under 25MB" };
    const formData = new FormData();
    formData.append("file", file);
    const data = await backendRequest("/chat/upload", { method: "POST", body: formData });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "File upload failed" };
  }
}

export async function getOrCreateConversation({ swapId, user1Id, user2Id }) {
  try {
    const data = await backendRequest("/chat/conversations", { method: "POST", body: JSON.stringify({ swapId, user1Id, user2Id }) });
    return { success: true, data: formatConversation(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to open chat" };
  }
}

export async function getMyConversations() {
  try {
    const data = await backendRequest("/chat/conversations");
    return { success: true, data: (data || []).map(formatConversation) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to load chats", data: [] };
  }
}

export async function getMessages(conversationId) {
  try {
    const data = await backendRequest(`/chat/conversations/${conversationId}/messages`);
    return { success: true, data: (data || []).map(formatMessage) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to load messages", data: [] };
  }
}

export async function sendMessage(payload) {
  try {
    const data = await backendRequest("/chat/messages", { method: "POST", body: JSON.stringify(payload) });
    return { success: true, data: formatMessage(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to send message" };
  }
}

export async function forwardMessage({ sourceMessage, targetConversationId, senderId }) {
  return sendMessage({
    conversationId: targetConversationId,
    senderId,
    message: sourceMessage.message || "",
    imageUrl: sourceMessage.image_url || "",
    fileUrl: sourceMessage.file_url || "",
    fileName: sourceMessage.file_name || "",
    fileType: sourceMessage.file_type || "",
    voiceUrl: sourceMessage.voice_url || "",
    voiceDuration: sourceMessage.voice_duration || 0,
    messageType: sourceMessage.message_type || "text",
    replyToId: null,
  });
}

export async function editMessage(messageId, nextMessage) {
  try {
    const data = await backendRequest(`/chat/messages/${messageId}`, { method: "PATCH", body: JSON.stringify({ message: nextMessage }) });
    return { success: true, data: formatMessage(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to edit message" };
  }
}

export async function deleteMessage(messageId) {
  try {
    const data = await backendRequest(`/chat/messages/${messageId}`, { method: "PATCH", body: JSON.stringify({ is_deleted: true }) });
    return { success: true, data: formatMessage(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to delete message" };
  }
}

export async function reactToMessage(message, emoji) {
  try {
    const data = await backendRequest(`/chat/messages/${message.id}/reactions`, { method: "POST", body: JSON.stringify({ emoji }) });
    return { success: true, data: formatMessage(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to react" };
  }
}

export async function toggleMessagePin(message) {
  try {
    const data = await backendRequest(`/chat/messages/${message.id}`, { method: "PATCH", body: JSON.stringify({ is_pinned: !message.is_pinned }) });
    return { success: true, data: formatMessage(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to pin message" };
  }
}

export async function toggleMessageStar(message) {
  try {
    const data = await backendRequest(`/chat/messages/${message.id}`, { method: "PATCH", body: JSON.stringify({ is_starred: !message.is_starred }) });
    return { success: true, data: formatMessage(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to star message" };
  }
}

export async function markConversationSeen(conversationId) {
  try {
    await backendRequest(`/chat/conversations/${conversationId}/seen`, { method: "POST" });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Unable to mark seen" };
  }
}

export async function setTyping(conversationId, userId, isTyping) {
  try {
    const data = await backendRequest(`/chat/conversations/${conversationId}/typing`, { method: "POST", body: JSON.stringify({ userId, isTyping }) });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to set typing" };
  }
}

function subscription(unsubscribe) {
  return { unsubscribe };
}

export function subscribeToConversationMessages(conversationId, callback) {
  const socket = getSocket();
  socket.emit("conversation:join", conversationId);
  const handler = (payload) => callback(formatMessage(payload));
  socket.on("chat:message", handler);
  return subscription(() => { socket.off("chat:message", handler); socket.emit("conversation:leave", conversationId); });
}

export function subscribeToMyConversations(_userId, callback) {
  const socket = getSocket();
  const handler = (payload) => callback(formatConversation(payload));
  socket.on("chat:conversation", handler);
  return subscription(() => socket.off("chat:conversation", handler));
}

export function subscribeToTyping(conversationId, callback) {
  const socket = getSocket();
  socket.emit("conversation:join", conversationId);
  const handler = (payload) => callback(payload);
  socket.on("chat:typing", handler);
  return subscription(() => { socket.off("chat:typing", handler); socket.emit("conversation:leave", conversationId); });
}

export async function startCallSession(conversationId, type = "audio") {
  try {
    const data = await backendRequest("/chat/calls", { method: "POST", body: JSON.stringify({ conversationId, type }) });
    getSocket().emit("call:start", data);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to start call" };
  }
}

export async function updateCallSession(callId, status) {
  try {
    const data = await backendRequest(`/chat/calls/${callId}`, { method: "PATCH", body: JSON.stringify({ status }) });
    getSocket().emit(`call:${status}`, data);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to update call" };
  }
}
