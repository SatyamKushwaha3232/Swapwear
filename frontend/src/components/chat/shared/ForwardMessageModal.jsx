import { Forward, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import Avatar from "../../common/Avatar";

export default function ForwardMessageModal({
  open,
  message,
  conversations = [],
  activeConversationId,
  forwarding,
  onClose,
  onForward,
}) {
  const [query, setQuery] = useState("");

  const filteredConversations = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return conversations.filter((chat) => {
      if (String(chat.id) === String(activeConversationId)) return false;
      if (!cleanQuery) return true;

      const label = `swap #${String(chat.swap_id || "").slice(0, 6)}`;
      return `${label} ${chat.last_message || ""}`.toLowerCase().includes(cleanQuery);
    });
  }, [activeConversationId, conversations, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="max-h-[86vh] w-full max-w-lg overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]">
        <div className="flex items-center justify-between border-b border-pink-100 p-5">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <Forward size={20} className="text-pink-500" />
              Forward message
            </h2>
            <p className="mt-1 truncate text-sm font-semibold text-slate-500">
              {messagePreview(message)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-pink-100 p-4">
          <div className="flex h-12 items-center rounded-full bg-pink-50 px-4">
            <Search size={18} className="shrink-0 text-pink-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search conversation..."
              className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-3">
          {filteredConversations.length === 0 ? (
            <div className="rounded-[24px] bg-pink-50 p-6 text-center">
              <p className="font-black text-slate-800">No other chats found</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Start another swap chat to forward messages.
              </p>
            </div>
          ) : (
            filteredConversations.map((chat) => (
              <button
                key={chat.id}
                type="button"
                disabled={forwarding}
                onClick={() => onForward?.(chat)}
                className="mb-2 flex w-full min-w-0 items-center gap-3 rounded-[22px] p-3 text-left transition hover:bg-pink-50 disabled:opacity-60"
              >
                <Avatar name="Swap" size="h-11 w-11" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-black">
                    Swap #{String(chat.swap_id || "").slice(0, 6)}
                  </h3>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                    {chat.last_message || "Start chatting"}
                  </p>
                </div>
                <Forward size={17} className="shrink-0 text-pink-500" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function messagePreview(message) {
  if (!message) return "Select a destination chat";
  if (message.message) return message.message;
  if (message.file_name) return message.file_name;
  if (message.message_type === "image") return "Image";
  if (message.message_type === "voice") return "Voice note";
  return "Media message";
}