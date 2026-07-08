import { MessageCircle, Search, ShieldCheck, Sparkles } from "lucide-react";

import Avatar from "../../common/Avatar";
import ChatHeader from "../shared/ChatHeader";
import ChatInput from "../shared/ChatInput";
import ChatMessages from "../shared/ChatMessages";
import ChatMessageToolbar from "../shared/ChatMessageToolbar";

export default function ChatTablet({
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
      <div className="container-main">
        <div className="mb-5 rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-sm font-black text-pink-500">
            <Sparkles size={15} />
            SwapWear Messages
          </div>

          <h1 className="mt-3 text-4xl font-black tracking-[-2px]">Chats</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">{headerText}</p>
        </div>

        <div className="grid h-[calc(100vh-210px)] min-h-[620px] grid-cols-[310px_minmax(0,1fr)] overflow-hidden rounded-[32px] border border-pink-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <aside className="min-w-0 border-r border-pink-100 bg-white/95">
            <div className="border-b border-pink-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">Messages</h2>
                  <p className="text-xs font-bold text-slate-500">
                    {totalConversations} chat{totalConversations !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-500">
                  <MessageCircle size={18} />
                </div>
              </div>

              <SearchField
                value={conversationSearch}
                onChange={onConversationSearchChange}
                placeholder="Search..."
                className="mt-4"
              />
            </div>

            <div className="h-[calc(100%-124px)] overflow-y-auto p-2">
              {conversations.length === 0 ? (
                <div className="rounded-[24px] bg-pink-50 p-6 text-center">
                  <MessageCircle className="mx-auto mb-3 text-pink-500" size={36} />
                  <h3 className="font-black">
                    {conversationSearch.trim() ? "No matches" : "No chats"}
                  </h3>
                </div>
              ) : (
                conversations.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => onSelectConversation(chat)}
                    className={`mb-2 flex w-full min-w-0 items-center gap-3 rounded-[22px] p-3 text-left transition ${
                      String(activeConversationId) === String(chat.id)
                        ? "bg-pink-500 text-white"
                        : "bg-white hover:bg-pink-50"
                    }`}
                  >
                    <Avatar name="Swap" size="h-11 w-11" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-black">
                          Swap #{String(chat.swap_id || "").slice(0, 6)}
                        </h3>
                        {chat.unread_count > 0 && (
                          <span className="shrink-0 rounded-full bg-pink-600 px-2 py-0.5 text-[10px] font-black text-white ring-1 ring-white/60">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-xs font-semibold opacity-75">
                        {chat.last_message || "Start chatting"}
                      </p>
                    </div>
                  </button>
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
              <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-white to-pink-50">
                <div className="max-w-xs text-center">
                  <ShieldCheck className="mx-auto text-pink-500" size={54} />
                  <h2 className="mt-5 text-2xl font-black">Select a conversation</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Choose a swap chat to continue.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}

function SearchField({ value, onChange, placeholder, className = "" }) {
  return (
    <div className={`flex h-11 items-center rounded-full bg-pink-50 px-3 ${className}`}>
      <Search size={17} className="shrink-0 text-pink-500" />
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent px-2 text-sm font-bold outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
