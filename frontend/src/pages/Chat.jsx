import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { MessageCircle, Repeat2, Sparkles } from "lucide-react";

import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import { useAuth } from "../context/AuthContext";
import {
  getMessages,
  getMyConversations,
  sendMessage,
  subscribeToConversationMessages,
  subscribeToMyConversations,
} from "../services/chat";

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const activeId = activeConversation?.id || conversationId || "";

  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  useEffect(() => {
    if (!conversationId || conversations.length === 0) return;

    const found = conversations.find(
      (chat) => String(chat.id) === String(conversationId)
    );

    if (found) {
      setActiveConversation(found);
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }

    loadMessages(activeId);

    const channel = subscribeToConversationMessages(activeId, (newMessage) => {
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      loadConversations(false);
    });

    return () => {
      channel?.unsubscribe?.();
    };
  }, [activeId]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = subscribeToMyConversations(user.id, () => {
      loadConversations(false);
    });

    return () => {
      channel?.unsubscribe?.();
    };
  }, [user?.id]);

  async function loadConversations(showLoader = true) {
    if (!user?.id) {
      setConversations([]);
      setLoadingChats(false);
      return;
    }

    if (showLoader) setLoadingChats(true);

    const response = await getMyConversations(user.id);

    if (!response.success) {
      toast.error(response.error || "Unable to load chats");
      setLoadingChats(false);
      return;
    }

    setConversations(response.data || []);

    if (!conversationId && !activeConversation && response.data?.[0]) {
      setActiveConversation(response.data[0]);
      navigate(`/chat/${response.data[0].id}`, { replace: true });
    }

    setLoadingChats(false);
  }

  async function loadMessages(id) {
    setLoadingMessages(true);

    const response = await getMessages(id);

    if (!response.success) {
      toast.error(response.error || "Unable to load messages");
      setLoadingMessages(false);
      return;
    }

    setMessages(response.data || []);
    setLoadingMessages(false);
  }

  async function handleSelectConversation(chat) {
    setActiveConversation(chat);
    navigate(`/chat/${chat.id}`);
  }

  async function handleSendMessage() {
    if (!input.trim()) return;

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

    const response = await sendMessage({
      conversationId: activeId,
      senderId: user.id,
      message: text,
    });

    if (!response.success) {
      toast.error(response.error || "Unable to send message");
      setInput(text);
      setSending(false);
      return;
    }

    setMessages((prev) => {
      if (prev.some((msg) => msg.id === response.data.id)) return prev;
      return [...prev, response.data];
    });

    setSending(false);


  }

  const headerText = useMemo(() => {
    if (loadingChats) return "Loading conversations...";
    if (conversations.length === 0) return "No chats yet";
    return `${conversations.length} active conversation${
      conversations.length > 1 ? "s" : ""
    }`;
  }, [loadingChats, conversations.length]);

  return (
    <section className="pt-5 pb-8">
      <div className="container-main">
        <div className="mb-6 rounded-[34px] border border-white/70 bg-white/75 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-5 py-2 font-black text-pink-500">
            <Sparkles size={17} />
            Realtime Chat
          </div>

          <h1 className="mt-5 text-[clamp(42px,6vw,76px)] font-black leading-[0.96] tracking-[-3px]">
            Chat before you swap.
          </h1>

          <p className="mt-5 flex items-center gap-2 font-semibold text-[var(--muted)] md:text-lg">
            <Repeat2 size={20} className="text-pink-500" />
            {headerText}
          </p>
        </div>

        <div className="flex h-[calc(100vh-225px)] min-h-[620px] flex-col overflow-hidden rounded-[34px] border border-pink-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:flex-row">
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeId}
            onSelect={handleSelectConversation}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            {loadingMessages ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="font-black text-pink-500">Loading messages...</p>
              </div>
            ) : (
              <ChatWindow
                user={user}
                conversation={activeConversation}
                messages={messages}
                input={input}
                onInputChange={setInput}
                onSend={handleSendMessage}
                sending={sending}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}