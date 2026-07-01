import { useEffect, useRef } from "react";
import {
  BadgeCheck,
  Circle,
  MoreHorizontal,
  Phone,
  ShieldCheck,
  Video,
} from "lucide-react";

import ChatBubble from "./ChatBubble";
import MessageInput from "./MessageInput";

export default function ChatWindow({
  user,
  conversation,
  messages,
  input,
  onInputChange,
  onSend,
  sending,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "nearest" });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-gradient-to-br from-white to-pink-50">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] bg-pink-50 text-pink-500">
            <ShieldCheck size={42} />
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-[-1px]">
            Select a conversation
          </h2>

          <p className="mt-3 font-semibold leading-relaxed text-slate-500">
            Choose an accepted swap chat from the left sidebar to start
            negotiating safely.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-white">
      <div className="shrink-0 border-b border-pink-100 bg-white/90 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-lg font-black text-white">
              S
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className="min-w-0">
              <h2 className="flex min-w-0 items-center gap-1 truncate text-2xl font-black tracking-[-1px]">
                <span className="truncate">
                  Swap #{String(conversation.swap_id || "").slice(0, 6)}
                </span>
                <BadgeCheck size={18} className="shrink-0 text-pink-500" />
              </h2>

              <p className="mt-1 flex items-center gap-2 text-sm font-bold text-emerald-600">
                <Circle size={8} fill="currentColor" />
                Online now
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            {[Phone, Video, MoreHorizontal].map((Icon, index) => (
              <button
                key={index}
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-pink-500 transition hover:bg-pink-100"
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-pink-100 bg-pink-50/70 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-pink-500" />
            <div className="min-w-0">
              <p className="font-black text-slate-900">Safe swap reminder</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                Confirm item condition, pickup place, and timing before
                finalizing the exchange.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-white via-pink-50/25 to-pink-50/60 p-5 md:p-6">
        {messages.length === 0 ? (
          <div className="mx-auto mt-16 max-w-md rounded-[30px] border border-pink-100 bg-white p-8 text-center shadow-lg">
            <h3 className="text-2xl font-black">No messages yet</h3>
            <p className="mt-2 font-semibold text-slate-500">
              Start the conversation and discuss swap details.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                mine={String(message.sender_id) === String(user?.id)}
              />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0">
        <MessageInput
          value={input}
          onChange={onInputChange}
          onSend={onSend}
          sending={sending}
          disabled={!conversation}
        />
      </div>
    </div>
  );
}