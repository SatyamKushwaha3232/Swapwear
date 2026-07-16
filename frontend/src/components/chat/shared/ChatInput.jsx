import { ImagePlus, Mic, Paperclip, Send, Smile, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const emojis = [
  "\ud83d\ude00",
  "\ud83d\ude02",
  "\ud83d\ude0d",
  "\ud83e\udd70",
  "\ud83d\ude0e",
  "\ud83d\udc4d",
  "\ud83d\udd25",
  "\u2764\ufe0f",
  "\ud83d\udcaf",
  "\ud83d\ude4f",
  "\ud83d\ude05",
  "\u2728",
];

export default function ChatInput({
  value,
  onChange,
  onSend,
  sending,
  disabled,
  replyTo,
  onCancelReply,
}) {
  const fileRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordSecondsRef = useRef(0);

  const [selectedFile, setSelectedFile] = useState(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  useEffect(() => {
    if (!recording) return undefined;

    const timer = setInterval(() => {
      setRecordSeconds((prev) => {
        const next = prev + 1;
        recordSecondsRef.current = next;
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [recording]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    if (sending || disabled) return;
    onSend(selectedFile, 0);
    setSelectedFile(null);
    setEmojiOpen(false);
  }

  function addEmoji(emoji) {
    onChange(`${value}${emoji}`);
    setEmojiOpen(false);
  }

  async function startRecording() {
    try {
      if (disabled || sending) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];
      recordSecondsRef.current = 0;
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
        setRecordSeconds(0);

        onSend(file, recordSecondsRef.current);
      };

      recorder.start();
      setRecording(true);
      setRecordSeconds(0);
    } catch {
      toast.error("Microphone permission is required for voice notes.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
  }

  function cancelRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }

    setRecording(false);
    setRecordSeconds(0);
  }

  const canSend = value.trim() || selectedFile;

  return (
    <div className="relative border-t border-pink-100 bg-white p-4">
      {replyTo && (
        <div className="mb-3 flex min-w-0 items-center justify-between gap-3 rounded-2xl border-l-4 border-pink-500 bg-pink-50 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-pink-500">
              Replying to
            </p>
            <p className="truncate text-sm font-bold text-slate-700">
              {replyTo.message || replyTo.file_name || "Media message"}
            </p>
          </div>

          <button type="button" onClick={onCancelReply} className="shrink-0 text-pink-500">
            <X size={18} />
          </button>
        </div>
      )}

      {selectedFile && (
        <div className="mb-3 flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-pink-50 px-4 py-3">
          <p className="truncate text-sm font-black text-pink-500">{selectedFile.name}</p>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="shrink-0 text-pink-500"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {recording && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3">
          <p className="text-sm font-black text-red-500">Recording voice... {recordSeconds}s</p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="rounded-full bg-white px-4 py-2 text-sm font-black text-red-500"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={stopRecording}
              className="rounded-full bg-red-500 px-4 py-2 text-sm font-black text-white"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {emojiOpen && (
        <div className="absolute bottom-[88px] left-5 z-30 grid grid-cols-6 gap-2 rounded-3xl border border-pink-100 bg-white p-4 shadow-2xl">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-xl hover:bg-pink-100"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        hidden
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />

      <div className="flex min-w-0 items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-3 py-2 shadow-sm sm:gap-3">
        <button
          type="button"
          disabled={disabled || recording}
          onClick={() => fileRef.current?.click()}
          className="shrink-0 text-pink-500 disabled:opacity-50"
          title="Attach file"
        >
          <Paperclip size={19} />
        </button>

        <button
          type="button"
          disabled={disabled || recording}
          onClick={() => fileRef.current?.click()}
          className="shrink-0 text-pink-500 disabled:opacity-50"
          title="Send image"
        >
          <ImagePlus size={19} />
        </button>

        <button
          type="button"
          disabled={disabled || recording}
          onClick={() => setEmojiOpen((prev) => !prev)}
          className="shrink-0 text-pink-500 disabled:opacity-50"
          title="Emoji"
        >
          <Smile size={19} />
        </button>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || recording}
          placeholder="Type a message..."
          className="min-w-0 flex-1 bg-transparent px-1 font-semibold outline-none sm:px-2"
        />

        {!canSend && !recording ? (
          <button
            type="button"
            disabled={disabled || sending}
            onClick={startRecording}
            className="shrink-0 text-pink-500 disabled:opacity-50"
            title="Voice note"
          >
            <Mic size={19} />
          </button>
        ) : recording ? (
          <button type="button" onClick={stopRecording} className="shrink-0 text-red-500" title="Stop recording">
            <Square size={19} />
          </button>
        ) : (
          <button
            type="button"
            disabled={sending || disabled}
            onClick={handleSend}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white transition hover:scale-105 disabled:opacity-60"
          >
            <Send size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
