import { MessageCircle, Search, ShieldCheck, Sparkles } from "lucide-react";

import Avatar from "../../common/Avatar";
import ChatHeader from "../shared/ChatHeader";
import ChatInput from "../shared/ChatInput";
import ChatMessages from "../shared/ChatMessages";
import ChatMessageToolbar from "../shared/ChatMessageToolbar";

export default function ChatDesktop({
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
  return (
    <section className="min-h-[calc(100vh-90px)] px-4 py-5">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-5 flex items-center justify-between rounded-[32px] border border-white/70 bg-white/75 p-5 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-sm font-black text-pink-500">
              <Sparkles size={15} />
              SwapWear Messages
            </div>

            <h1 className="mt-3 text-4xl font-black tracking-[-2px]">Chat Center</h1>
            <p className="mt-1 font-semibold text-slate-500">{headerText}</p>
          </div>

          <div className="hidden items-center gap-3 rounded-[24px] bg-pink-50 px-5 py-4 lg:flex">
            <ShieldCheck size={22} className="text-pink-500" />
            <div>
              <p className="font-black">Safe Swap Chat</p>
              <p className="text-sm font-semibold text-slate-500">
                Confirm item, place and timing
              </p>
            </div>
          </div>
        </div>

        <div className="grid h-[calc(100vh-215px)] min-h-[650px] grid-cols-[390px_minmax(0,1fr)] overflow-hidden rounded-[36px] border border-pink-100 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.09)]">
          <aside className="min-w-0 border-r border-pink-100 bg-white/95">
            <div className="border-b border-pink-100 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black tracking-[-1px]">Messages</h2>
                  <p className="text-sm font-bold text-slate-500">
                    {totalConversations} active chat{totalConversations !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-pink-500">
                  <MessageCircle size={21} />
                </div>
              </div>

              <SearchField
                value={conversationSearch}
                onChange={onConversationSearchChange}
                placeholder="Search conversations..."
                className="mt-5"
              />
            </div>

            <div className="h-[calc(100%-145px)] overflow-y-auto p-3">
              {conversations.length === 0 ? (
                <EmptyChatList searching={Boolean(conversationSearch.trim())} />
              ) : (
                conversations.map((chat) => (
                  <ConversationCard
                    key={chat.id}
                    chat={chat}
                    active={String(activeConversationId) === String(chat.id)}
                    onClick={() => onSelectConversation(chat)}
                  />
                ))
              )}
            </div>
          </aside>

          <main className="flex min-h-0 min-w-0 flex-col bg-white">
            {activeConversation ? (
              <>
                <ChatHeader
                  conversation={activeConversation}
                  statusText={typingUsers.length > 0 ? "Typing..." : "Online"}
                  onCall={onCall}
                  onVideo={onVideo}
                  onMenu={onHeaderMenu}
                />

                <ChatMessageToolbar
                  searchValue={messageSearch}
                  onSearchChange={onMessageSearchChange}
                  activeFilter={messageView}
                  onFilterChange={onMessageViewChange}
                  counts={messageCounts}
                />

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
              </>
            ) : (
              <EmptyConversation />
            )}
          </main>
        </div>
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

function ConversationCard({ chat, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-3 flex w-full min-w-0 items-center gap-4 rounded-[26px] p-4 text-left transition ${
        active
          ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-[0_16px_36px_rgba(255,79,163,0.25)]"
          : "bg-white hover:bg-pink-50"
      }`}
    >
      <Avatar name="Swap" size="h-13 w-13" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-black">Swap #{String(chat.swap_id || "").slice(0, 6)}</h3>
          {chat.unread_count > 0 && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${active ? "bg-white text-pink-500" : "bg-pink-500 text-white"}`}>
              {chat.unread_count}
            </span>
          )}
        </div>

        <p className={`mt-1 truncate text-sm font-semibold ${active ? "text-white/80" : "text-slate-500"}`}>
          {chat.last_message || "Start chatting"}
        </p>
      </div>

      <p className={`shrink-0 text-[11px] font-black ${active ? "text-white/70" : "text-slate-400"}`}>
        {chat.last_message_at
          ? new Date(chat.last_message_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""}
      </p>
    </button>
  );
}

function EmptyChatList({ searching }) {
  return (
    <div className="rounded-[28px] bg-pink-50 p-8 text-center">
      <MessageCircle className="mx-auto mb-3 text-pink-500" size={42} />
      <h3 className="font-black">{searching ? "No matching chats" : "No chats yet"}</h3>
      <p className="mt-2 text-sm font-semibold text-slate-500">
        {searching ? "Try another search term." : "Accepted swaps will appear here."}
      </p>
    </div>
  );
}

function EmptyConversation() {
  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-white to-pink-50">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] bg-pink-50 text-pink-500">
          <MessageCircle size={46} />
        </div>

        <h2 className="mt-6 text-3xl font-black tracking-[-1px]">Select a conversation</h2>
        <p className="mt-3 font-semibold leading-relaxed text-slate-500">
          Choose an accepted swap chat from the left sidebar.
        </p>
      </div>
    </div>
  );
}
