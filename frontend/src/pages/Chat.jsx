import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import useDevice from "../hooks/useDevice";
import ChatDesktop from "../components/chat/desktop/ChatDesktop";
import ChatTablet from "../components/chat/tablet/ChatTablet";
import ChatMobile from "../components/chat/mobile/ChatMobile";
import ForwardMessageModal from "../components/chat/shared/ForwardMessageModal";
import ActionDialog from "../components/common/ActionDialog";
import { useAuth } from "../context/AuthContext";

import {
  deleteMessage,
  editMessage,
  forwardMessage,
  getMessages,
  getMyConversations,
  markConversationSeen,
  reactToMessage,
  sendMessage,
  setTyping,
  startCallSession,
  subscribeToConversationMessages,
  subscribeToMyConversations,
  subscribeToTyping,
  toggleMessagePin,
  toggleMessageStar,
  uploadChatFile,
} from "../services/chat";

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDesktop, isTablet } = useDevice();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [conversationSearch, setConversationSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [messageView, setMessageView] = useState("all");
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [forwarding, setForwarding] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");

  const typingTimerRef = useRef(null);
  const lastChatErrorRef = useRef({ message: "", time: 0 });
  const activeId = activeConversation?.id || conversationId || "";

  const notifyChatError = useCallback((message) => {
    const cleanMessage =
      message || "Server connection failed. Please check that the backend is running.";
    const now = Date.now();
    setChatError(cleanMessage);

    if (
      lastChatErrorRef.current.message === cleanMessage &&
      now - lastChatErrorRef.current.time < 8000
    ) {
      return;
    }

    lastChatErrorRef.current = { message: cleanMessage, time: now };
    toast.error(cleanMessage, { id: "chat-connection-error" });
  }, []);

  const loadConversations = useCallback(
    async (showLoader = true) => {
      if (!user?.id) {
        setConversations([]);
        setLoadingChats(false);
        return;
      }

      if (showLoader) setLoadingChats(true);

      const response = await getMyConversations(user.id);

      if (!response.success) {
        notifyChatError(response.error || "Unable to load chats");
        setLoadingChats(false);
        return;
      }

      const list = response.data || [];
      setConversations(list);
      setChatError("");

      if (!conversationId && list[0]) {
        setActiveConversation((current) => current || list[0]);
        navigate(`/chat/${list[0].id}`, { replace: true });
      }

      setLoadingChats(false);
    },
    [conversationId, navigate, notifyChatError, user?.id]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;

    const found = conversations.find(
      (chat) => String(chat.id) === String(conversationId)
    );

    if (found) setActiveConversation(found);
  }, [conversationId, conversations]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return undefined;
    }

    loadMessagesById(activeId);

    const messageChannel = subscribeToConversationMessages(
      activeId,
      (changedMessage) => {
        upsertMessage(changedMessage);
        loadConversations(false);
      }
    );

    if (user?.id) {
      markConversationSeen(activeId, user.id).catch(() => {});
      setConversations((prev) =>
        prev.map((chat) =>
          String(chat.id) === String(activeId) ? { ...chat, unread_count: 0 } : chat
        )
      );
    }

    return () => {
      messageChannel?.unsubscribe?.();
    };
  }, [activeId, loadConversations, user?.id]);

  useEffect(() => {
    if (!user?.id) return undefined;

    const channel = subscribeToMyConversations(user.id, () => {
      loadConversations(false);
    });

    return () => {
      channel?.unsubscribe?.();
    };
  }, [loadConversations, user?.id]);

  useEffect(() => {
    if (!activeId || !user?.id) return undefined;

    const channel = subscribeToTyping(activeId, (typingRow) => {
      if (!typingRow || typingRow.user_id === user.id) return;

      setTypingUsers((prev) => {
        const filtered = prev.filter((id) => id !== typingRow.user_id);
        return typingRow.is_typing ? [...filtered, typingRow.user_id] : filtered;
      });
    });

    return () => {
      channel?.unsubscribe?.();
    };
  }, [activeId, user?.id]);

  function upsertMessage(nextMessage) {
    setMessages((prev) => {
      const exists = prev.some((msg) => msg.id === nextMessage.id);

      if (exists) {
        return prev.map((msg) => (msg.id === nextMessage.id ? nextMessage : msg));
      }

      return [...prev, nextMessage];
    });
  }

  async function loadMessagesById(id) {
    setLoadingMessages(true);

    const response = await getMessages(id);

    if (!response.success) {
      notifyChatError(response.error || "Unable to load messages");
      setLoadingMessages(false);
      return;
    }

    setMessages(response.data || []);
    setChatError("");
    setLoadingMessages(false);
  }

  function handleSelectConversation(chat) {
    setActiveConversation(chat);
    setReplyTo(null);
    setTypingUsers([]);
    setMessageSearch("");
    setMessageView("all");

    if (user?.id) markConversationSeen(chat.id, user.id).catch(() => {});

    setConversations((prev) =>
      prev.map((item) =>
        String(item.id) === String(chat.id) ? { ...item, unread_count: 0 } : item
      )
    );

    navigate(`/chat/${chat.id}`);
  }

  function handleInputChange(value) {
    setInput(value);

    if (!activeId || !user?.id) return;

    setTyping(activeId, user.id, true);

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setTyping(activeId, user.id, false);
    }, 1200);
  }

  async function handleSendMessage(file = null, voiceDuration = 0) {
    if (!input.trim() && !file) return;

    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    if (!activeId) {
      toast.error("Please select a conversation");
      return;
    }

    const text = input.trim();
    setInput("");
    setSending(true);

    await setTyping(activeId, user.id, false);

    let attachment = null;
    if (file) {
      const upload = await uploadChatFile(file);

      if (!upload.success) {
        toast.error(upload.error || "Unable to upload file");
        setInput(text);
        setSending(false);
        return;
      }

      attachment = upload.data;
    }

    const messageType =
      attachment?.message_type ||
      (file?.type?.startsWith("image/")
        ? "image"
        : file?.type?.startsWith("audio/")
        ? "voice"
        : file
        ? "file"
        : "text");

    const response = await sendMessage({
      conversationId: activeId,
      senderId: user.id,
      message: text,
      messageType,
      imageUrl: messageType === "image" ? attachment?.url || "" : "",
      fileUrl: messageType === "file" ? attachment?.url || "" : "",
      fileName: attachment?.name || "",
      fileType: attachment?.type || "",
      voiceUrl: messageType === "voice" ? attachment?.url || "" : "",
      replyToId: replyTo?.id || null,
      voiceDuration,
    });

    if (!response.success) {
      toast.error(response.error || "Unable to send message");
      setInput(text);
      setSending(false);
      return;
    }

    upsertMessage(response.data);
    setReplyTo(null);
    setSending(false);
    loadConversations(false);
  }

  async function handleDeleteMessage(message) {
    if (!message?.id) return;

    if (String(message.sender_id) !== String(user?.id)) {
      toast.error("You can delete only your own message");
      return;
    }

    const response = await deleteMessage(message.id);

    if (!response.success) {
      toast.error(response.error || "Unable to delete message");
      return;
    }

    upsertMessage(response.data);
    toast.success("Message deleted");
  }

  async function handleEditMessage(message) {
    if (!message?.id || String(message.sender_id) !== String(user?.id)) return;
    setEditingMessage(message);
  }

  async function confirmEditMessage(values) {
    if (!editingMessage?.id) return;

    const nextMessage = String(values.message || "").trim();
    if (!nextMessage || nextMessage === editingMessage.message) {
      setEditingMessage(null);
      return;
    }

    const response = await editMessage(editingMessage.id, nextMessage);

    if (!response.success) {
      toast.error(response.error || "Unable to edit message");
      return;
    }

    upsertMessage(response.data);
    setEditingMessage(null);
    toast.success("Message edited");
  }

  async function handleReactToMessage(message, emoji) {
    const response = await reactToMessage(message, emoji);

    if (!response.success) {
      toast.error(response.error || "Unable to react");
      return;
    }

    upsertMessage(response.data);
  }

  async function handlePinMessage(message) {
    const response = await toggleMessagePin(message);

    if (!response.success) {
      toast.error(response.error || "Unable to pin message");
      return;
    }

    upsertMessage(response.data);
  }

  async function handleStarMessage(message) {
    const response = await toggleMessageStar(message);

    if (!response.success) {
      toast.error(response.error || "Unable to star message");
      return;
    }

    upsertMessage(response.data);
  }

  async function handleCopyMessage(message) {
    const text = message.message || message.file_name || message.image_url || message.file_url || "";

    if (!text) {
      toast.error("Nothing to copy");
      return;
    }

    await navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  function handleForwardMessage(message) {
    if (!message?.id) return;
    setForwardingMessage(message);
  }

  async function handleForwardToConversation(chat) {
    if (!forwardingMessage || !chat?.id || !user?.id) return;

    setForwarding(true);

    const response = await forwardMessage({
      sourceMessage: forwardingMessage,
      targetConversationId: chat.id,
      senderId: user.id,
    });

    setForwarding(false);

    if (!response.success) {
      toast.error(response.error || "Unable to forward message");
      return;
    }

    setForwardingMessage(null);
    toast.success("Message forwarded");
    loadConversations(false);
  }

  async function handleCallAction(type) {
    if (!activeId) {
      toast.error("Select a conversation first");
      return;
    }

    const response = await startCallSession(activeId, type.toLowerCase());
    if (response.success) {
      toast.success(`${type} call started`);
    } else {
      toast.error(response.error || "Unable to start call");
    }
  }

  function handleHeaderMenu(view = "all") {
    setMessageView(view);
  }

  const filteredConversations = useMemo(() => {
    const query = conversationSearch.trim().toLowerCase();
    if (!query) return conversations;

    return conversations.filter((chat) => {
      const swapLabel = `swap #${String(chat.swap_id || "").slice(0, 6)}`;
      return `${swapLabel} ${chat.last_message || ""}`.toLowerCase().includes(query);
    });
  }, [conversationSearch, conversations]);

  const messageCounts = useMemo(
    () => ({
      all: messages.length,
      pinned: messages.filter((message) => message.is_pinned && !message.is_deleted).length,
      starred: messages.filter((message) => message.is_starred && !message.is_deleted).length,
    }),
    [messages]
  );

  const visibleMessages = useMemo(() => {
    const query = messageSearch.trim().toLowerCase();

    return messages.filter((message) => {
      if (messageView === "pinned" && !message.is_pinned) return false;
      if (messageView === "starred" && !message.is_starred) return false;
      if (!query) return true;

      return [message.message, message.file_name, message.reply_to_text]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [messageSearch, messageView, messages]);

  const headerText = useMemo(() => {
    if (loadingChats) return "Loading conversations...";
    if (conversations.length === 0) return "No chats yet";
    return `${conversations.length} active conversation${
      conversations.length > 1 ? "s" : ""
    }`;
  }, [loadingChats, conversations.length]);

  const chatProps = {
    user,
    conversations: filteredConversations,
    allConversations: conversations,
    totalConversations: conversations.length,
    conversationSearch,
    messageSearch,
    messageView,
    messageCounts,
    onConversationSearchChange: setConversationSearch,
    onMessageSearchChange: setMessageSearch,
    onMessageViewChange: setMessageView,
    activeConversationId: activeId,
    activeConversation,
    messages: visibleMessages,
    allMessagesCount: messages.length,
    typingUsers,
    input,
    replyTo,
    loadingMessages,
    onInputChange: handleInputChange,
    onSelectConversation: handleSelectConversation,
    onSend: handleSendMessage,
    onReply: setReplyTo,
    onCancelReply: () => setReplyTo(null),
    onDeleteMessage: handleDeleteMessage,
    onEditMessage: handleEditMessage,
    onCopyMessage: handleCopyMessage,
    onForwardMessage: handleForwardMessage,
    onPinMessage: handlePinMessage,
    onStarMessage: handleStarMessage,
    onReactToMessage: handleReactToMessage,
    onCall: () => handleCallAction("Audio"),
    onVideo: () => handleCallAction("Video"),
    onHeaderMenu: handleHeaderMenu,
    sending,
    headerText,
    chatError,
  };

  const content = isDesktop ? (
    <ChatDesktop {...chatProps} />
  ) : isTablet ? (
    <ChatTablet {...chatProps} />
  ) : (
    <ChatMobile {...chatProps} />
  );

  return (
    <>
      {content}
      <ForwardMessageModal
        open={Boolean(forwardingMessage)}
        message={forwardingMessage}
        conversations={conversations}
        activeConversationId={activeId}
        forwarding={forwarding}
        onClose={() => setForwardingMessage(null)}
        onForward={handleForwardToConversation}
      />
      <ActionDialog
        open={Boolean(editingMessage)}
        title="Edit message"
        text="Update the text and save it back into the conversation."
        confirmLabel="Save Message"
        fields={[
          {
            name: "message",
            label: "Message",
            type: "textarea",
            rows: 5,
            placeholder: "Write your updated message...",
          },
        ]}
        initialValues={{ message: editingMessage?.message || "" }}
        onClose={() => setEditingMessage(null)}
        onConfirm={confirmEditMessage}
      />
    </>
  );
}
