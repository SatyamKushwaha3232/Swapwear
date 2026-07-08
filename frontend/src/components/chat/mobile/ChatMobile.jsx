import { ArrowLeft, MessageCircle, Phone, Search, ShieldCheck, Sparkles, Video } from "lucide-react";
import { useState } from "react";

import Avatar from "../../common/Avatar";
import ChatInput from "../shared/ChatInput";
import ChatMessages from "../shared/ChatMessages";
import ChatMessageToolbar from "../shared/ChatMessageToolbar";

export default function ChatMobile({
  user,
  conversations = [],
  totalConversations = conversations.length,
  conversationSearch = "",
  messageSearch = "",
  messageView = "all",
  messageCounts = {},
  activeConversationId,
  activeConversation,
  messages = [],
  allMessagesCount = messages.length,
  typingUsers = [],
  input,
  replyTo,
  loadingMessages,
  onConversationSearchChange,
  onMessageSearchChange,
  onMessageViewChange,
  onInputChange,
  onSelectConversation,
  onSend,
  onReply,
  onCancelReply,
  onDeleteMessage,
  onEditMessage,
  onCopyMessage,
  onForwardMessage,
  onPinMessage,
  onStarMessage,
  onReactToMessage,
  onCall,
  onVideo,
  onHeaderMenu,
  sending,
  headerText,
}) {
  const [showChat, setShowChat] = useState(false);

  function openChat(chat) {
    onSelectConversation(chat);
    setShowChat(true);
  }

  function goBackToList() {
    setShowChat(false);
  }

  if (showChat && activeConversation) {
    return (
      <section className="fixed inset-0 z-[999] flex flex-col bg-white">
        <div className="flex shrink-0 items-center gap-3 border-b border-pink-100 bg-white px-4 py-3 shadow-sm">
          <button
            type="button"
            onClick={goBackToList}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-50 text-pink-500"
          >
            <ArrowLeft size={22} />
          </button>

          <Avatar name="Swap" size="h-11 w-11" />

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-black">
              Swap #{String(activeConversation.swap_id || "").slice(0, 6)}
            </h2>
            <p className="truncate text-xs font-bold text-emerald-600">
              {typingUsers.length > 0 ? "Typing..." : "Online now"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onCall}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-500"
              aria-label="Audio call"
            >
              <Phone size={17} />
            </button>
            <button
              type="button"
              onClick={onVideo}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-500"
              aria-label="Video call"
            >
              <Video size={17} />
            </button>
          </div>
        </div>

        <ChatMessageToolbar
                  searchValue={messageSearch}
                  onSearchChange={onMessageSearchChange}
                  activeFilter={messageView}
                  onFilterChange={onMessageViewChange}
                  counts={messageCounts}
                />

        <div className="flex min-h-0 flex-1 flex-col">
          <ChatMessages
            user={user}
            messages={messages}
            allMessagesCount={allMessagesCount}
            searchQuery={messageSearch}
            loading={loadingMessages}
            typingUsers={typingUsers}
            onReply={onReply}
            onDeleteMessage={onDeleteMessage}
            onEditMessage={onEditMessage}
            onCopyMessage={onCopyMessage}
            onForwardMessage={onForwardMessage}
            onPinMessage={onPinMessage}
            onStarMessage={onStarMessage}
            onReactToMessage={onReactToMessage}
          />

          <ChatInput
            value={input}
            onChange={onInputChange}
            onSend={onSend}
            sending={sending}
            disabled={!activeConversation}
            replyTo={replyTo}
            onCancelReply={onCancelReply}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#fff7fb]">
      <div className="sticky top-0 z-20 border-b border-pink-100 bg-white/90 px-5 py-4 backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-pink-500">
          <Sparkles size={14} />
          SwapWear Chat
        </div>

        <h1 className="mt-3 text-3xl font-black tracking-[-1px]">Messages</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">{headerText}</p>
        <p className="mt-1 text-xs font-bold text-slate-400">
          {totalConversations} total chat{totalConversations !== 1 ? "s" : ""}
        </p>

        <SearchField
          value={conversationSearch}
          onChange={onConversationSearchChange}
          placeholder="Search conversations..."
          className="mt-5"
        />
      </div>

      <div className="space-y-3 p-4">
        {conversations.length === 0 ? (
          <div className="mt-16 rounded-[30px] bg-white p-8 text-center shadow-lg">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-50 text-pink-500">
              <MessageCircle size={42} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              {conversationSearch.trim() ? "No Matching Chats" : "No Chats Yet"}
            </h2>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              {conversationSearch.trim()
                ? "Try another search term."
                : "Accepted swaps will appear here."}
            </p>
          </div>
        ) : (
          conversations.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => openChat(chat)}
              className={`flex w-full min-w-0 items-center gap-4 rounded-[28px] p-4 text-left shadow-sm transition ${
                String(activeConversationId) === String(chat.id)
                  ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white"
                  : "bg-white"
              }`}
            >
              <Avatar name="Swap" size="h-14 w-14" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="truncate text-base font-black">
                      Swap #{String(chat.swap_id || "").slice(0, 6)}
                    </h3>
                    {chat.unread_count > 0 && (
                      <span className="shrink-0 rounded-full bg-pink-600 px-2 py-0.5 text-[10px] font-black text-white ring-1 ring-white/60">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>

                  <span
                    className={`shrink-0 text-[11px] font-bold ${
                      String(activeConversationId) === String(chat.id)
                        ? "text-white/70"
                        : "text-slate-400"
                    }`}
                  >
                    {chat.last_message_at
                      ? new Date(chat.last_message_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>

                <p
                  className={`mt-1 truncate text-sm font-semibold ${
                    String(activeConversationId) === String(chat.id)
                      ? "text-white/80"
                      : "text-slate-500"
                  }`}
                >
                  {chat.last_message || "Start chatting..."}
                </p>
              </div>
            </button>
          ))
        )}

        <div className="mt-6 rounded-[30px] bg-gradient-to-r from-pink-500 to-fuchsia-500 p-5 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <ShieldCheck size={28} />
            <div>
              <h3 className="font-black">Safe Swapping</h3>
              <p className="mt-1 text-sm text-white/80">
                Never share OTP, passwords or payment details in chat.
              </p>
            </div>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </section>
  );
}

function SearchField({ value, onChange, placeholder, className = "" }) {
  return (
    <div className={`flex h-12 items-center rounded-full bg-pink-50 px-4 ${className}`}>
      <Search size={18} className="shrink-0 text-pink-500" />
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
