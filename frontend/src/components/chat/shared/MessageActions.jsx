import {
  Copy,
  Edit3,
  Forward,
  Pin,
  Reply,
  Star,
  Trash2,
  X,
} from "lucide-react";

const reactions = ["\u2764\ufe0f", "\ud83d\ude02", "\ud83d\udd25", "\ud83d\udc4d", "\ud83d\ude2e", "\ud83d\ude4f"];

export default function MessageActions({
  open,
  mine,
  onClose,
  onReply,
  onDelete,
  onEdit,
  onCopy,
  onForward,
  onPin,
  onStar,
  onReact,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-950/20 p-3 backdrop-blur-[1px] sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close message actions"
      />

      <div className="relative max-h-[80vh] w-full max-w-[330px] overflow-y-auto rounded-[24px] border border-pink-100 bg-white p-3 text-sm font-bold text-slate-700 shadow-2xl sm:max-w-[260px]">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-black uppercase tracking-widest text-pink-500">
            Actions
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-slate-400 transition hover:text-pink-500"
            aria-label="Close message actions"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-6 gap-1 rounded-xl bg-pink-50 p-2">
          {reactions.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact?.(emoji)}
              className="flex h-9 w-full items-center justify-center rounded-full bg-white text-lg transition hover:bg-pink-100"
            >
              {emoji}
            </button>
          ))}
        </div>

        <Action icon={Reply} label="Reply" onClick={onReply} />
        <Action icon={Copy} label="Copy" onClick={onCopy} />
        <Action icon={Forward} label="Forward" onClick={onForward} />
        <Action icon={Pin} label="Pin" onClick={onPin} />
        <Action icon={Star} label="Star" onClick={onStar} />

        {mine && <Action icon={Edit3} label="Edit" onClick={onEdit} />}
        {mine && <Action icon={Trash2} label="Delete" onClick={onDelete} danger />}
      </div>
    </div>
  );
}

function Action({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition hover:bg-pink-50 ${
        danger ? "text-red-500 hover:bg-red-50" : ""
      }`}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}