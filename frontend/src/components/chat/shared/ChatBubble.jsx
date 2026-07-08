import { useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  Download,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Pause,
  Play,
  Pin,
  Star,
  Volume2,
} from "lucide-react";

import MessageActions from "./MessageActions";

export default function ChatBubble({
  message,
  mine,
  onReply,
  onDelete,
  onEdit,
  onCopy,
  onForward,
  onPin,
  onStar,
  onReact,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  const pressTimerRef = useRef(null);

  const isDeleted = Boolean(message.is_deleted);
  const isImage = message.message_type === "image" && message.image_url;
  const isFile = message.message_type === "file" && message.file_url;
  const isVoice = message.message_type === "voice" && message.voice_url;
  const hasBody = Boolean(message.message || isImage || isFile || isVoice || isDeleted);

  function closeAfter(callback) {
    callback?.();
    setMenuOpen(false);
  }

  function openMenu() {
    if (isDeleted) return;
    setMenuOpen(true);
  }

  function handleContextMenu(e) {
    e.preventDefault();
    openMenu();
  }

  function handleTouchStart() {
    pressTimerRef.current = setTimeout(openMenu, 550);
  }

  function handleTouchEnd() {
    clearTimeout(pressTimerRef.current);
  }

  return (
    <>
      <div
        className={`flex ${mine ? "justify-end" : "justify-start"}`}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`relative max-w-[86%] overflow-visible rounded-[24px] shadow-[0_10px_28px_rgba(15,23,42,0.08)] sm:max-w-[74%] ${
            mine
              ? "rounded-br-md bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white"
              : "rounded-bl-md bg-white text-slate-900 ring-1 ring-pink-100"
          }`}
        >
          <MessageActions
            open={menuOpen}
            mine={mine}
            onClose={() => setMenuOpen(false)}
            onReply={() => closeAfter(onReply)}
            onDelete={() => closeAfter(onDelete)}
            onEdit={() => closeAfter(onEdit)}
            onCopy={() => closeAfter(onCopy)}
            onForward={() => closeAfter(onForward)}
            onPin={() => closeAfter(onPin)}
            onStar={() => closeAfter(onStar)}
            onReact={(emoji) => closeAfter(() => onReact?.(emoji))}
          />

          <StatusBadges message={message} mine={mine} />

          {message.reply_to_text && !isDeleted && (
            <ReplyPreview mine={mine} text={message.reply_to_text} />
          )}

          {isDeleted ? (
            <DeletedMessage />
          ) : (
            <>
              {isImage && (
                <ImageMessage
                  src={message.image_url}
                  fileName={message.file_name}
                  mine={mine}
                  onOpen={() => setImageOpen(true)}
                />
              )}

              {isFile && (
                <FileMessage
                  url={message.file_url}
                  name={message.file_name}
                  type={message.file_type}
                  mine={mine}
                />
              )}

              {isVoice && (
                <VoiceMessage
                  url={message.voice_url}
                  duration={message.voice_duration}
                  mine={mine}
                />
              )}

              {message.message && (
                <div className={`${isImage ? "px-4 pt-3" : "px-5 pt-4"}`}>
                  <p className="whitespace-pre-wrap break-words text-[15px] font-semibold leading-relaxed">
                    {message.message}
                  </p>
                </div>
              )}
            </>
          )}

          <ReactionRow reactions={message.reactions} mine={mine} />
          <BubbleFooter
            message={message}
            mine={mine}
            onMenu={openMenu}
            compact={!hasBody}
          />
        </div>
      </div>

      {imageOpen && (
        <ImageViewer
          src={message.image_url}
          fileName={message.file_name}
          onClose={() => setImageOpen(false)}
        />
      )}
    </>
  );
}

function StatusBadges({ message, mine }) {
  if (!message.is_pinned && !message.is_starred) return null;

  return (
    <div className={`flex gap-1 px-4 pt-3 ${mine ? "justify-end" : "justify-start"}`}>
      {message.is_pinned && (
        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[10px] font-black uppercase tracking-wide">
          <Pin size={11} /> Pinned
        </span>
      )}
      {message.is_starred && (
        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[10px] font-black uppercase tracking-wide">
          <Star size={11} /> Starred
        </span>
      )}
    </div>
  );
}

function ReplyPreview({ mine, text }) {
  return (
    <div
      className={`m-3 rounded-2xl border-l-4 p-3 ${
        mine ? "border-white bg-white/15" : "border-pink-500 bg-pink-50"
      }`}
    >
      <p
        className={`text-xs font-black uppercase tracking-widest ${
          mine ? "text-white/80" : "text-pink-500"
        }`}
      >
        Replying to
      </p>
      <p className="line-clamp-2 break-words text-sm font-bold opacity-90">{text}</p>
    </div>
  );
}

function DeletedMessage() {
  return <div className="px-5 py-4 italic opacity-70">This message was deleted</div>;
}

function ImageMessage({ src, fileName, mine, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full overflow-hidden rounded-t-[24px] text-left"
    >
      <img
        src={src}
        alt={fileName || "Chat image"}
        className="max-h-[280px] w-full object-cover"
      />

      <div
        className={`flex min-w-0 items-center gap-2 px-4 py-2 text-xs font-bold ${
          mine ? "bg-white/10 text-white/80" : "bg-pink-50 text-slate-500"
        }`}
      >
        <ImageIcon size={14} className="shrink-0" />
        <span className="truncate">{fileName || "Image"}</span>
      </div>
    </button>
  );
}

function FileMessage({ url, name, type, mine }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`m-3 flex min-w-0 items-center gap-3 rounded-2xl p-4 transition hover:scale-[1.01] ${
        mine ? "bg-white/15" : "bg-pink-50"
      }`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-500 text-white">
        <FileText size={24} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black">{name || "Document"}</p>
        <p className={`truncate text-xs ${mine ? "text-white/70" : "text-slate-500"}`}>
          {type || "File"}
        </p>
      </div>

      <Download size={18} className="shrink-0" />
    </a>
  );
}

function VoiceMessage({ url, duration, mine }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const end = () => setPlaying(false);
    audio.addEventListener("ended", end);

    return () => {
      audio.removeEventListener("ended", end);
    };
  }, []);

  function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  return (
    <div
      className={`m-3 flex min-w-[230px] items-center gap-3 rounded-2xl p-3 ${
        mine ? "bg-white/15" : "bg-pink-50"
      }`}
    >
      <button
        type="button"
        onClick={toggleAudio}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-500 text-white"
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className={`mb-2 h-2 rounded-full ${mine ? "bg-white/30" : "bg-pink-200"}`} />
        <div className="flex items-center justify-between gap-3 text-xs font-bold opacity-80">
          <span className="flex min-w-0 items-center gap-1 truncate">
            <Volume2 size={13} className="shrink-0" />
            Voice Note
          </span>
          <span className="shrink-0">{duration || 0}s</span>
        </div>
      </div>

      <audio ref={audioRef} src={url} />
    </div>
  );
}

function ReactionRow({ reactions, mine }) {
  const entries = Object.entries(reactions || {}).filter(([, count]) => Number(count) > 0);
  if (entries.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 px-4 pt-2 ${mine ? "justify-end" : "justify-start"}`}>
      {entries.map(([emoji, count]) => (
        <span
          key={emoji}
          className={`rounded-full px-2 py-1 text-xs font-black shadow-sm ${
            mine ? "bg-white/20 text-white" : "bg-pink-50 text-slate-700"
          }`}
        >
          {emoji} {count}
        </span>
      ))}
    </div>
  );
}

function BubbleFooter({ message, mine, onMenu, compact }) {
  return (
    <div
      className={`flex items-center justify-end gap-2 px-5 pb-3 text-[11px] font-bold ${
        compact ? "pt-3" : "pt-2"
      } ${mine ? "text-white/75" : "text-slate-400"}`}
    >
      {message.edited_at && <span>Edited</span>}
      {message.created_at &&
        new Date(message.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}

      {mine &&
        (message.seen ? (
          <CheckCheck size={15} className="text-cyan-300" />
        ) : (
          <Check size={15} />
        ))}

      <button
        type="button"
        onClick={onMenu}
        className="rounded-full p-1 transition hover:bg-black/5"
        aria-label="Open message actions"
      >
        <MoreVertical size={15} />
      </button>
    </div>
  );
}

function ImageViewer({ src, fileName, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-6"
      onClick={onClose}
    >
      <div className="relative max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-xl"
          aria-label="Close image viewer"
        >
          X
        </button>

        <img
          src={src}
          alt={fileName || "Image"}
          className="max-h-[88vh] rounded-3xl object-contain"
        />
      </div>
    </div>
  );
}
