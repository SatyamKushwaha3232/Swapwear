import { useEffect, useMemo, useRef } from "react";
import { MessageCircle, SearchX } from "lucide-react";

import ChatBubble from "./ChatBubble";

export default function ChatMessages({
  user,
  messages = [],
  allMessagesCount = messages.length,
  typingUsers = [],
  searchQuery = "",
  loading = false,
  onReply,
  onDeleteMessage,
  onEditMessage,
  onCopyMessage,
  onForwardMessage,
  onPinMessage,
  onStarMessage,
  onReactToMessage,
}) {
  const bottomRef = useRef(null);

  const groupedMessages = useMemo(() => {
    return messages.map((message, index) => {
      const currentDate = formatDateKey(message.created_at);
      const previousDate = formatDateKey(messages[index - 1]?.created_at);

      return {
        message,
        showDate: currentDate && currentDate !== previousDate,
        dateLabel: currentDate ? formatDateLabel(message.created_at) : "",
      };
    });
  }, [messages]);

  useEffect(() => {
    if (searchQuery.trim()) return;

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, typingUsers.length, searchQuery]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-white via-pink-50/25 to-pink-50/70 p-4 md:p-6">
      {loading ? (
        <div className="flex h-full min-h-[320px] items-center justify-center">
          <div className="rounded-full bg-white px-5 py-3 text-sm font-black text-pink-500 shadow-sm ring-1 ring-pink-100">
            Loading messages...
          </div>
        </div>
      ) : messages.length === 0 ? (
        searchQuery.trim() && allMessagesCount > 0 ? (
          <div className="mx-auto mt-16 max-w-md rounded-[30px] border border-pink-100 bg-white p-8 text-center shadow-lg">
            <SearchX className="mx-auto text-pink-500" size={44} />
            <h3 className="mt-5 text-2xl font-black">No matching messages</h3>
            <p className="mt-2 font-semibold text-slate-500">
              Try a different word or clear search.
            </p>
          </div>
        ) : (
          <div className="mx-auto mt-16 max-w-md rounded-[30px] border border-pink-100 bg-white p-8 text-center shadow-lg">
            <MessageCircle className="mx-auto text-pink-500" size={44} />
            <h3 className="mt-5 text-2xl font-black">No messages yet</h3>
            <p className="mt-2 font-semibold text-slate-500">
              Start the conversation and discuss swap details.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {groupedMessages.map(({ message, showDate, dateLabel }) => (
            <div key={message.id}>
              {showDate && <DateSeparator label={dateLabel} />}
              <ChatBubble
                message={message}
                mine={String(message.sender_id) === String(user?.id)}
                onReply={() => onReply?.(message)}
                onDelete={() => onDeleteMessage?.(message)}
                onEdit={() => onEditMessage?.(message)}
                onCopy={() => onCopyMessage?.(message)}
                onForward={() => onForwardMessage?.(message)}
                onPin={() => onPinMessage?.(message)}
                onStar={() => onStarMessage?.(message)}
                onReact={(emoji) => onReactToMessage?.(message, emoji)}
              />
            </div>
          ))}
        </div>
      )}

      {typingUsers.length > 0 && !searchQuery.trim() && (
        <div className="mt-4 flex justify-start">
          <div className="rounded-[22px] bg-white px-4 py-3 text-sm font-black text-pink-500 shadow-sm ring-1 ring-pink-50">
            Typing...
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function DateSeparator({ label }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-pink-100" />
      <span className="rounded-full bg-white px-4 py-1.5 text-xs font-black uppercase tracking-wide text-slate-400 shadow-sm ring-1 ring-pink-100">
        {label}
      </span>
      <div className="h-px flex-1 bg-pink-100" />
    </div>
  );
}

function formatDateKey(value) {
  if (!value) return "";
  return new Date(value).toDateString();
}

function formatDateLabel(value) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}