import { MessageCircle, Search } from "lucide-react";

export default function ChatSidebar({
  conversations,
  activeConversationId,
  onSelect,
}) {
  return (
    <aside className="w-full border-r border-pink-100 bg-white/85 backdrop-blur-2xl md:w-[360px]">
      <div className="border-b border-pink-100 p-5">
        <h2 className="text-3xl font-black tracking-[-1px]">Messages</h2>
        <p className="mt-1 text-sm font-bold text-slate-500">
          {conversations.length} conversation(s)
        </p>

        <div className="mt-5 flex h-12 items-center rounded-full bg-pink-50 px-4">
          <Search size={18} className="text-pink-500" />
          <input
            placeholder="Search chats..."
            className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold outline-none"
          />
        </div>
      </div>

      <div className="h-full max-h-[calc(100vh-360px)] overflow-y-auto p-3">
        {conversations.length === 0 ? (
          <div className="rounded-[28px] bg-pink-50 p-8 text-center">
            <MessageCircle className="mx-auto mb-3 text-pink-500" size={42} />
            <h3 className="font-black">No chats yet</h3>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Accepted swaps will appear here.
            </p>
          </div>
        ) : (
          conversations.map((chat) => {
            const active = String(activeConversationId) === String(chat.id);

            return (
              <button
                key={chat.id}
                onClick={() => onSelect(chat)}
                className={`mb-3 flex w-full items-center gap-4 rounded-[26px] p-4 text-left transition ${
                  active
                    ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-[0_16px_36px_rgba(255,79,163,0.25)]"
                    : "bg-white hover:bg-pink-50"
                }`}
              >
                <div
                  className={`relative flex h-13 w-13 shrink-0 items-center justify-center rounded-full font-black ${
                    active ? "bg-white/25 text-white" : "bg-pink-100 text-pink-500"
                  }`}
                >
                  S
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-black">
                    Swap #{String(chat.swap_id || "").slice(0, 6)}
                  </h3>

                  <p
                    className={`mt-1 truncate text-sm font-semibold ${
                      active ? "text-white/80" : "text-slate-500"
                    }`}
                  >
                    {chat.last_message || "Start chatting"}
                  </p>
                </div>

                <p
                  className={`shrink-0 text-[11px] font-black ${
                    active ? "text-white/70" : "text-slate-400"
                  }`}
                >
                  {chat.last_message_at
                    ? new Date(chat.last_message_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </p>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}