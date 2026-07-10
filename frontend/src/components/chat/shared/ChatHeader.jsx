import { useRef, useState } from "react";
import {
  BadgeCheck,
  Circle,
  MoreVertical,
  Phone,
  Pin,
  Search,
  Star,
  Video,
  X,
} from "lucide-react";
import Avatar from "../../common/Avatar";
import useClickOutside from "../../../hooks/useClickOutside";

export default function ChatHeader({
  conversation,
  statusText = "Online",
  onCall,
  onVideo,
  onMenu,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  function chooseView(view) {
    onMenu?.(view);
    setMenuOpen(false);
  }

  return (
    <div className="sticky top-0 z-30 border-b border-pink-100 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 p-4 md:p-5">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <Avatar name={conversation?.owner_name || "Swap"} size="h-12 w-12 md:h-14 md:w-14" />

          <div className="min-w-0">
            <h2 className="flex items-center gap-2 truncate text-base font-black md:text-xl">
              {conversation?.owner_name || "SwapWear User"}
              <BadgeCheck size={18} className="shrink-0 text-pink-500" />
            </h2>

            <p className="mt-1 flex items-center gap-2 text-xs font-bold text-emerald-600 md:text-sm">
              <Circle size={8} fill="currentColor" />
              {statusText}
            </p>
          </div>
        </div>

        <div ref={menuRef} className="relative flex shrink-0 items-center gap-2">
          <HeaderButton label="Audio call" onClick={onCall} icon={Phone} />
          <HeaderButton label="Video call" onClick={onVideo} icon={Video} />
          <HeaderButton
            label="Chat menu"
            onClick={() => setMenuOpen((prev) => !prev)}
            icon={menuOpen ? X : MoreVertical}
          />

          {menuOpen && (
            <div className="absolute right-0 top-[52px] z-50 w-56 rounded-2xl border border-pink-100 bg-white p-2 text-sm font-bold text-slate-700 shadow-2xl">
              <p className="px-3 py-2 text-xs font-black uppercase tracking-widest text-pink-500">
                Chat menu
              </p>
              <MenuAction icon={Search} label="All messages" onClick={() => chooseView("all")} />
              <MenuAction icon={Pin} label="Pinned messages" onClick={() => chooseView("pinned")} />
              <MenuAction icon={Star} label="Starred messages" onClick={() => chooseView("starred")} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeaderButton({ label, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-pink-500 transition hover:bg-pink-100 md:h-11 md:w-11"
      aria-label={label}
    >
      <Icon size={18} />
    </button>
  );
}

function MenuAction({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition hover:bg-pink-50 hover:text-pink-500"
    >
      <Icon size={17} />
      {label}
    </button>
  );
}
