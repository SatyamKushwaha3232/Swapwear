import { appConfig } from "../config/app.config.js";
import { prisma } from "../config/prisma.js";
import { createNotification } from "./notification.service.js";
import { uploadToCloudinary } from "./cloudinary.service.js";

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
  return ["ADMIN", "OWNER", "MODERATOR"].includes(user.role);
}

function formatConversation(conversation = {}, userId = "", usersById = new Map()) {
  const unreadCounts = conversation.unreadCounts || {};
  const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
  const otherUser = usersById.get(otherUserId);
  const otherProfile = otherUser?.profile || {};
  const ownerName =
    otherProfile.fullName ||
    otherProfile.username ||
    otherUser?.email?.split("@")[0] ||
    "SwapWear User";

  return {
    id: String(conversation.id),
    swap_id: conversation.swapId,
    user1_id: conversation.user1Id,
    user2_id: conversation.user2Id,
    owner_id: otherUser?.id || "",
    owner_name: ownerName,
    owner_avatar: otherProfile.avatarUrl || "",
    last_message: conversation.lastMessage || "",
    last_message_at:
      conversation.lastMessageAt?.toISOString?.() || conversation.lastMessageAt,
    created_at: conversation.createdAt?.toISOString?.() || conversation.createdAt,
    unread_count: Number(unreadCounts?.[userId] || 0),
  };
}

async function loadConversationUserMap(conversations = []) {
  const ids = [
    ...new Set(
      conversations
        .flatMap((conversation) => [conversation.user1Id, conversation.user2Id])
        .filter(Boolean)
    ),
  ];

  if (!ids.length) return new Map();

  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    include: { profile: true },
  });

  return new Map(users.map((item) => [item.id, item]));
}

function formatMessage(message = {}) {
  return {
    id: String(message.id),
    conversation_id: String(message.conversationId),
    sender_id: message.senderId,
    message: message.message || "",
    image_url: normalizeUploadUrl(message.imageUrl || ""),
    file_url: normalizeUploadUrl(message.fileUrl || ""),
    file_name: message.fileName || "",
    file_type: message.fileType || "",
    message_type: message.messageType || "text",
    reply_to_id: message.replyToId ? String(message.replyToId) : null,
    reply_to_text: message.replyTo?.message || "",
    reply_to_sender_id: message.replyTo?.senderId || null,
    reactions: message.reactions || {},
    is_deleted: Boolean(message.isDeleted),
    is_pinned: Boolean(message.isPinned),
    is_starred: Boolean(message.isStarred),
    seen: Boolean(message.seen),
    voice_url: normalizeUploadUrl(message.voiceUrl || ""),
    voice_duration: Number(message.voiceDuration || 0),
    edited_at: message.editedAt?.toISOString?.() || message.editedAt || null,
    deleted_at: message.deletedAt?.toISOString?.() || message.deletedAt || null,
    created_at: message.createdAt?.toISOString?.() || message.createdAt,
  };
}

async function attachReplyPreviews(messages = []) {
  const list = Array.isArray(messages) ? messages : [messages];
  const replyIds = [
    ...new Set(list.map((message) => message.replyToId).filter(Boolean)),
  ];

  if (!replyIds.length) return Array.isArray(messages) ? list : list[0];

  const replies = await prisma.chatMessage.findMany({
    where: { id: { in: replyIds } },
    select: { id: true, message: true, senderId: true },
  });
  const repliesById = new Map(replies.map((item) => [String(item.id), item]));
  const hydrated = list.map((message) => ({
    ...message,
    replyTo: repliesById.get(String(message.replyToId)) || null,
  }));

  return Array.isArray(messages) ? hydrated : hydrated[0];
}

function normalizeUploadUrl(url) {
  if (!url) return "";
  const value = String(url);
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/uploads/")) {
    return `${appConfig.publicFileBaseUrl.replace(/\/uploads\/?$/, "/uploads")}${value.slice("/uploads".length)}`;
  }
  return value;
}

function lastMessageLabel(messageType, cleanMessage) {
  if (cleanMessage) return cleanMessage;
  if (messageType === "image") return "Image";
  if (messageType === "voice") return "Voice note";
  return "File";
}

async function assertConversationAccess(conversationId, user, tx = prisma) {
  const conversation = await tx.chatConversation.findUnique({
    where: { id: parseBigInt(conversationId, "conversation id") },
  });

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.status = 404;
    throw error;
  }

  if (conversation.user1Id !== user.id && conversation.user2Id !== user.id && !isAdmin(user)) {
    const error = new Error("You are not part of this conversation");
    error.status = 403;
    throw error;
  }

  return conversation;
}

async function saveChatFile(file, userId) {
  const { url } = await uploadToCloudinary(file, {
    folder: `swapwear/chat/${userId}`,
  });
  return url;
}

export async function uploadChatFile(file, user) {
  if (!file) {
    const error = new Error("File missing");
    error.status = 400;
    throw error;
  }

  const url = await saveChatFile(file, user.id);
  return {
    url,
    name: file.originalname || "file",
    type: file.mimetype || "application/octet-stream",
    message_type: file.mimetype?.startsWith("image/") ? "image" : file.mimetype?.startsWith("audio/") ? "voice" : "file",
  };
}

export async function getOrCreateConversation(payload, user) {
  const swap = await prisma.swap.findUnique({
    where: { id: payload.swapId },
  });

  if (!swap) {
    const error = new Error("Swap not found");
    error.status = 404;
    throw error;
  }

  if (swap.requesterId !== user.id && swap.ownerId !== user.id && !isAdmin(user)) {
    const error = new Error("You are not part of this swap");
    error.status = 403;
    throw error;
  }

  const existing = await prisma.chatConversation.findUnique({
    where: { swapId: swap.id },
  });

  if (existing) {
    const usersById = await loadConversationUserMap([existing]);
    return formatConversation(existing, user.id, usersById);
  }

  const conversation = await prisma.chatConversation.create({
    data: {
      swapId: swap.id,
      user1Id: swap.requesterId,
      user2Id: swap.ownerId,
      lastMessage: "",
      unreadCounts: {},
    },
  });

  const usersById = await loadConversationUserMap([conversation]);
  return formatConversation(conversation, user.id, usersById);
}

export async function getMyConversations(user) {
  const conversations = await prisma.chatConversation.findMany({
    where: { OR: [{ user1Id: user.id }, { user2Id: user.id }] },
    orderBy: { lastMessageAt: "desc" },
  });

  const usersById = await loadConversationUserMap(conversations);
  return conversations.map((conversation) => formatConversation(conversation, user.id, usersById));
}

export async function getMessages(conversationId, user) {
  await assertConversationAccess(conversationId, user);

  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: parseBigInt(conversationId, "conversation id") },
    orderBy: { createdAt: "asc" },
  });

  const hydrated = await attachReplyPreviews(messages);
  return hydrated.map(formatMessage);
}

export async function sendMessage(payload, user) {
  const conversation = await assertConversationAccess(payload.conversationId, user);
  const cleanMessage = String(payload.message || "").trim();
  const messageType = ["text", "image", "file", "voice"].includes(payload.messageType)
    ? payload.messageType
    : "text";

  if (!cleanMessage && !payload.fileUrl && !payload.imageUrl && !payload.voiceUrl) {
    const error = new Error("Message or file is required");
    error.status = 400;
    throw error;
  }

  const recipientId = conversation.user1Id === user.id ? conversation.user2Id : conversation.user1Id;
  const unreadCounts = conversation.unreadCounts || {};
  unreadCounts[recipientId] = Number(unreadCounts[recipientId] || 0) + 1;

  const message = await prisma.chatMessage.create({
    data: {
      conversationId: conversation.id,
      senderId: user.id,
      message: cleanMessage,
      imageUrl: payload.imageUrl || "",
      fileUrl: payload.fileUrl || "",
      fileName: payload.fileName || "",
      fileType: payload.fileType || "",
      messageType,
      voiceUrl: payload.voiceUrl || "",
      voiceDuration: Number(payload.voiceDuration || 0),
      replyToId: payload.replyToId ? parseBigInt(payload.replyToId, "reply id") : null,
      reactions: {},
      seen: false,
    },
  });

  await prisma.chatConversation.update({
    where: { id: conversation.id },
    data: {
      lastMessage: lastMessageLabel(messageType, cleanMessage),
      lastMessageAt: new Date(),
      unreadCounts,
    },
  });

  await createNotification({
    userId: recipientId,
    actorId: user.id,
    type: "message",
    title: "New message",
    message: lastMessageLabel(messageType, cleanMessage),
    link: "/chat",
    data: { conversation_id: String(conversation.id) },
  });

  return formatMessage(await attachReplyPreviews(message));
}

export async function updateMessage(messageId, patch, user) {
  const message = await prisma.chatMessage.findUnique({
    where: { id: parseBigInt(messageId, "message id") },
    include: { conversation: true },
  });

  if (!message) {
    const error = new Error("Message not found");
    error.status = 404;
    throw error;
  }
  await assertConversationAccess(message.conversationId, user);

  if (message.senderId !== user.id && !isAdmin(user)) {
    const error = new Error("You can edit only your own message");
    error.status = 403;
    throw error;
  }

  const updated = await prisma.chatMessage.update({
    where: { id: message.id },
    data: patch,
  });

  return formatMessage(await attachReplyPreviews(updated));
}

export async function reactToMessage(messageId, emoji, user) {
  const message = await prisma.chatMessage.findUnique({
    where: { id: parseBigInt(messageId, "message id") },
  });
  if (!message) {
    const error = new Error("Message not found");
    error.status = 404;
    throw error;
  }
  await assertConversationAccess(message.conversationId, user);

  const reactions = message.reactions || {};
  if (!emoji || String(emoji).length > 12) {
    const error = new Error("Invalid reaction");
    error.status = 400;
    throw error;
  }

  const updated = await prisma.chatMessage.update({
    where: { id: message.id },
    data: { reactions: { ...reactions, [emoji]: Number(reactions[emoji] || 0) + 1 } },
  });

  return formatMessage(await attachReplyPreviews(updated));
}

export async function markConversationSeen(conversationId, user) {
  const conversation = await assertConversationAccess(conversationId, user);
  const unreadCounts = { ...(conversation.unreadCounts || {}), [user.id]: 0 };

  await prisma.chatMessage.updateMany({
    where: { conversationId: conversation.id, senderId: { not: user.id } },
    data: { seen: true },
  });

  await prisma.chatConversation.update({
    where: { id: conversation.id },
    data: { unreadCounts },
  });

  return true;
}

export async function setTyping(conversationId, user, isTyping) {
  await assertConversationAccess(conversationId, user);
  return {
    conversation_id: String(conversationId),
    user_id: user.id,
    is_typing: Boolean(isTyping),
    updated_at: new Date().toISOString(),
  };
}

export async function createCallSession(payload, user) {
  const conversation = await assertConversationAccess(payload.conversationId, user);
  const receiverId = conversation.user1Id === user.id ? conversation.user2Id : conversation.user1Id;

  const call = await prisma.callSession.create({
    data: {
      conversationId: conversation.id,
      callerId: user.id,
      receiverId,
      type: String(payload.type || "AUDIO").toUpperCase() === "VIDEO" ? "VIDEO" : "AUDIO",
      status: "RINGING",
      metadata: payload.metadata || {},
    },
  });

  return formatCall(call);
}

export async function updateCallSession(callId, status, user) {
  const call = await prisma.callSession.findUnique({
    where: { id: callId },
  });

  if (!call) {
    const error = new Error("Call not found");
    error.status = 404;
    throw error;
  }
  if (call.callerId !== user.id && call.receiverId !== user.id && !isAdmin(user)) {
    const error = new Error("You are not part of this call");
    error.status = 403;
    throw error;
  }

  const nextStatus = String(status || "").toUpperCase();
  if (!["ACCEPTED", "REJECTED", "MISSED", "ENDED", "FAILED"].includes(nextStatus)) {
    const error = new Error("Invalid call status");
    error.status = 400;
    throw error;
  }
  const now = new Date();
  const updated = await prisma.callSession.update({
    where: { id: call.id },
    data: {
      status: nextStatus,
      acceptedAt: nextStatus === "ACCEPTED" ? now : call.acceptedAt,
      endedAt: ["ENDED", "REJECTED", "MISSED", "FAILED"].includes(nextStatus) ? now : call.endedAt,
      durationSec:
        nextStatus === "ENDED" && call.acceptedAt
          ? Math.max(0, Math.round((now.getTime() - call.acceptedAt.getTime()) / 1000))
          : call.durationSec,
    },
  });

  return formatCall(updated);
}

function formatCall(call = {}) {
  return {
    id: call.id,
    conversation_id: String(call.conversationId),
    caller_id: call.callerId,
    receiver_id: call.receiverId,
    type: String(call.type || "AUDIO").toLowerCase(),
    status: String(call.status || "RINGING").toLowerCase(),
    started_at: call.startedAt?.toISOString?.() || call.startedAt,
    accepted_at: call.acceptedAt?.toISOString?.() || call.acceptedAt || null,
    ended_at: call.endedAt?.toISOString?.() || call.endedAt || null,
    duration_sec: Number(call.durationSec || 0),
    metadata: call.metadata || {},
  };
}
