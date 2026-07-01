export default function ChatBubble({ message, mine }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-[28px] px-5 py-3 shadow-sm ${
          mine
            ? "rounded-br-md bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white"
            : "rounded-bl-md bg-white text-slate-800 ring-1 ring-pink-50"
        }`}
      >
        <p className="font-semibold leading-relaxed">{message.message}</p>

        <p
          className={`mt-2 text-[11px] font-bold ${
            mine ? "text-white/75" : "text-slate-400"
          }`}
        >
          {message.created_at
            ? new Date(message.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </p>
      </div>
    </div>
  );
}