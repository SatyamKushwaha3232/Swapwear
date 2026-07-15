import {
  createCallSession,
  getMessages,
  getMyConversations,
  getOrCreateConversation,
  markConversationSeen,
  reactToMessage,
  sendMessage,
  setTyping,
  updateCallSession,
  updateMessage,
  uploadChatFile,
} from "../services/chat.service.js";

function sendError(res, err) {
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Chat action failed",
  });
}

export async function createConversation(req, res) {
  try {
    res.status(201).json({
      success: true,
      data: await getOrCreateConversation(req.body, req.user),
    });
  } catch (err) {
    sendError(res, err);
  }
}

export async function fetchConversations(req, res) {
  try {
    res.json({ success: true, data: await getMyConversations(req.user) });
  } catch (err) {
    sendError(res, err);
  }
}

export async function createMessage(req, res) {
  try {
    const payload = {
      ...req.body,
      conversationId: req.body.conversationId || req.body.conversation_id,
      replyToId: req.body.replyToId || req.body.reply_to_id,
    };

    const message = await sendMessage(payload, req.user);
    req.app.get("io")?.to(`conversation:${message.conversation_id}`).emit("chat:message", message);

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    sendError(res, err);
  }
}

export async function fetchMessages(req, res) {
  try {
    res.json({
      success: true,
      data: await getMessages(req.params.conversationId, req.user),
    });
  } catch (err) {
    sendError(res, err);
  }
}

export async function uploadFile(req, res) {
  try {
    res.status(201).json({
      success: true,
      data: await uploadChatFile(req.file, req.user),
    });
  } catch (err) {
    sendError(res, err);
  }
}

export async function patchMessage(req, res) {
  try {
    const patch = {};
    if (req.body.message !== undefined) {
      patch.message = String(req.body.message || "").trim();
      patch.editedAt = new Date();
    }
    if (req.body.is_deleted !== undefined || req.body.isDeleted !== undefined) {
      patch.isDeleted = Boolean(req.body.is_deleted ?? req.body.isDeleted);
      patch.deletedAt = patch.isDeleted ? new Date() : null;
      if (patch.isDeleted) {
        patch.message = "";
        patch.imageUrl = "";
        patch.fileUrl = "";
        patch.fileName = "";
        patch.voiceUrl = "";
        patch.reactions = {};
      }
    }
    if (req.body.is_pinned !== undefined) patch.isPinned = Boolean(req.body.is_pinned);
    if (req.body.is_starred !== undefined) patch.isStarred = Boolean(req.body.is_starred);

    const message = await updateMessage(req.params.id, patch, req.user);
    req.app.get("io")?.to(`conversation:${message.conversation_id}`).emit("chat:message", message);

    res.json({ success: true, data: message });
  } catch (err) {
    sendError(res, err);
  }
}

export async function addReaction(req, res) {
  try {
    const message = await reactToMessage(req.params.id, req.body.emoji, req.user);
    req.app.get("io")?.to(`conversation:${message.conversation_id}`).emit("chat:message", message);
    res.json({ success: true, data: message });
  } catch (err) {
    sendError(res, err);
  }
}

export async function seenConversation(req, res) {
  try {
    await markConversationSeen(req.params.conversationId, req.user);
    res.json({ success: true });
  } catch (err) {
    sendError(res, err);
  }
}

export async function typing(req, res) {
  try {
    const data = await setTyping(req.params.conversationId, req.user, req.body.isTyping);
    req.app.get("io")?.to(`conversation:${data.conversation_id}`).emit("chat:typing", data);
    res.json({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
}

export async function startCall(req, res) {
  try {
    const call = await createCallSession(req.body, req.user);
    req.app.get("io")?.to(`conversation:${call.conversation_id}`).emit("call:ringing", call);
    res.status(201).json({ success: true, data: call });
  } catch (err) {
    sendError(res, err);
  }
}

export async function patchCall(req, res) {
  try {
    const call = await updateCallSession(req.params.id, req.body.status, req.user);
    req.app.get("io")?.to(`conversation:${call.conversation_id}`).emit("call:update", call);
    res.json({ success: true, data: call });
  } catch (err) {
    sendError(res, err);
  }
}
