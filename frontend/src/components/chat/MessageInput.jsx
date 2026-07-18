import { useRef } from "react";
import { ImagePlus, Paperclip, Send, Smile } from "lucide-react";

export default function MessageInput({
  value,
  onChange,
  onSend,
  sending,
  disabled,
  onAttach,
}) {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      onSend();
    }
  }

  return (
    <div className="border-t border-pink-50 bg-white/85 p-4 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-2 rounded-[28px] border border-pink-100 bg-pink-50/70 px-3 py-3 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
        <button
          type="button"
          disabled={disabled || sending}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-pink-500 transition hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
          title="Attach file"
        >
          <Paperclip size={19} />
        </button>

        <button
          type="button"
          disabled={disabled || sending}
          onClick={() => imageInputRef.current?.click()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-pink-500 transition hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
          title="Attach image"
        >
          <ImagePlus size={19} />
        </button>

        <button
          type="button"
          disabled
          className="flex h-11 w-11 shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-white text-pink-500 opacity-70"
          title="Emoji reactions are available from message actions"
        >
          <Smile size={19} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept=".pdf,.txt,.doc,.docx,audio/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onAttach?.(file);
            event.target.value = "";
          }}
        />

        <input
          ref={imageInputRef}
          type="file"
          hidden
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onAttach?.(file);
            event.target.value = "";
          }}
        />

        <input
          type="text"
          placeholder={disabled ? "Select a conversation..." : "Type your message..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent px-2 font-semibold outline-none disabled:cursor-not-allowed"
        />

        <button
          type="button"
          disabled={sending || disabled || !value.trim()}
          onClick={onSend}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-[0_12px_30px_rgba(255,79,163,0.25)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
