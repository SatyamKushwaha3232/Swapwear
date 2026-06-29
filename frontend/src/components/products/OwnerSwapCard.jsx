import { Link } from "react-router-dom";
import { BadgeCheck, Heart, MapPin, MessageCircle, Repeat2, ShieldCheck, Sparkles } from "lucide-react";

export default function OwnerSwapCard({ item, user, requesting, onRequestSwap }) {
  const ownerName = item?.owner || item?.owner_name || "SwapWear User";

  return (
    <div className="sticky top-32 space-y-5">
      <div className="rounded-[40px] border border-pink-100 bg-white/90 p-7 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
        <div className="flex items-center gap-2 text-pink-500 font-black">
          <Sparkles size={18} /> Premium Swap Item
        </div>

        <h1 className="mt-5 text-[46px] font-black leading-[0.95] tracking-[-2.5px] text-slate-950 md:text-[58px]">
          {item?.title || "Untitled Item"}
        </h1>

        <p className="mt-4 text-lg font-bold text-slate-500">
          {item?.brand || "Unknown Brand"} • Size {item?.size || "Free"} • {item?.category || "Fashion"}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Chip>{item?.condition || "Good"}</Chip>
          <Chip><MapPin size={15} /> {item?.location || "India"}</Chip>
          <Chip><ShieldCheck size={15} /> Verified</Chip>
        </div>

        <div className="mt-7 rounded-[30px] bg-gradient-to-r from-pink-50 to-fuchsia-50 p-6">
          <p className="text-sm font-black uppercase tracking-[2px] text-slate-400">Swap Value</p>
          <div className="mt-2 flex items-end gap-3">
            <h2 className="text-6xl font-black text-pink-500">{item?.points || 0}</h2>
            <span className="pb-2 font-black text-slate-500">points</span>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onRequestSwap}
            disabled={requesting}
            className="col-span-2 flex h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 font-black text-white shadow-[0_18px_42px_rgba(255,79,163,0.32)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            <Repeat2 size={20} /> {requesting ? "Sending..." : user ? "Request Swap" : "Login to Swap"}
          </button>

          <button className="flex h-13 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 font-black text-white">
            <Heart size={18} /> Save
          </button>
          <Link to="/chat" className="flex h-13 items-center justify-center gap-2 rounded-full border border-pink-100 bg-white px-5 font-black text-slate-900">
            <MessageCircle size={18} /> Chat
          </Link>
        </div>
      </div>

      <div className="rounded-[36px] border border-pink-100 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
        <p className="text-sm font-black uppercase tracking-[2px] text-slate-400">Listed by</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-2xl font-black text-white shadow-lg">
            {ownerName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 truncate text-2xl font-black">{ownerName}<BadgeCheck size={19} className="text-pink-500" /></h3>
            <p className="mt-1 font-semibold text-slate-500">Verified community swapper</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ children }) {
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">{children}</span>;
}
