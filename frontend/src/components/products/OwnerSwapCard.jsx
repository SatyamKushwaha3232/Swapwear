import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Heart,
  MapPin,
  MessageCircle,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  UserRound,
} from "lucide-react";

export default function OwnerSwapCard({
  item,
  user,
  requesting,
  onRequestSwap,
}) {
  const isOwnListing =
    user?.id && item?.ownerId && String(user.id) === String(item.ownerId);

  const ownerName = item?.owner || item?.owner_name || "SwapWear User";

  return (
    <aside className="min-w-0 rounded-[36px] border border-pink-100 bg-white/90 p-6 shadow-[0_24px_75px_rgba(15,23,42,0.07)] backdrop-blur-2xl md:p-7 xl:sticky xl:top-32 xl:h-fit">
      <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-pink-50 px-5 py-2 font-black text-pink-500">
        <Sparkles size={16} className="shrink-0" />
        <span className="truncate">Swap Ready Item</span>
      </div>

      <div className="mt-5 min-w-0">
        <p className="truncate text-sm font-black uppercase tracking-[1.8px] text-pink-500">
          {item?.brand || "Brand"}
        </p>

        <h1 className="mt-2 text-[clamp(32px,4vw,52px)] font-black leading-[0.98] tracking-[-2px] text-slate-950">
          {item?.title || "Untitled Item"}
        </h1>

        <p className="mt-4 text-base font-semibold leading-relaxed text-slate-500">
          {item?.description ||
            "Premium pre-loved fashion item available for sustainable swapping."}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <InfoPill icon={Tag} label="Points" value={`${item?.points || 0}`} />
        <InfoPill icon={Repeat2} label="Condition" value={item?.condition || "Good"} />
        <InfoPill icon={MapPin} label="Location" value={item?.location || "India"} />
        <InfoPill icon={Star} label="Rating" value="4.8" />
      </div>

      <div className="mt-6 rounded-[28px] border border-pink-100 bg-pink-50/65 p-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-2xl font-black text-white shadow-lg">
            {ownerName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1">
              <h3 className="truncate text-xl font-black">{ownerName}</h3>
              <BadgeCheck size={18} className="shrink-0 text-pink-500" />
            </div>

            <p className="mt-1 truncate text-sm font-bold text-slate-500">
              Verified SwapWear member
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <MiniStat value="12" label="Swaps" />
          <MiniStat value="4.8" label="Rating" />
          <MiniStat value="98%" label="Trust" />
        </div>
      </div>

      {isOwnListing && (
        <div className="mt-5 rounded-[24px] border border-yellow-100 bg-yellow-50 p-4">
          <p className="font-black text-yellow-700">This is your listing</p>
          <p className="mt-1 text-sm font-semibold text-yellow-700/80">
            You can manage it from your dashboard.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <button
          type="button"
          disabled={requesting || isOwnListing}
          onClick={onRequestSwap}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 font-black text-white shadow-[0_16px_38px_rgba(255,79,163,0.32)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Repeat2 size={19} />
          {requesting
            ? "Sending Request..."
            : isOwnListing
            ? "Own Listing"
            : "Request Swap"}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/chat"
            className="flex h-13 items-center justify-center gap-2 rounded-full border border-pink-100 bg-white font-black text-pink-500 transition hover:bg-pink-50"
          >
            <MessageCircle size={18} />
            Chat
          </Link>

          <button
            type="button"
            className="flex h-13 items-center justify-center gap-2 rounded-full border border-pink-100 bg-white font-black text-pink-500 transition hover:bg-pink-50"
          >
            <Heart size={18} />
            Save
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck size={21} className="mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-black text-emerald-700">Safe swap tip</p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-emerald-700/80">
              Chat first, verify item details, and choose a safe public place
              for exchange.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-[22px] border border-pink-100 bg-white p-4">
      <Icon size={18} className="text-pink-500" />

      <p className="mt-3 truncate text-[11px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-base font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="min-w-0 rounded-[18px] bg-white/75 p-3 text-center">
      <h4 className="truncate text-lg font-black text-slate-950">{value}</h4>
      <p className="truncate text-[11px] font-bold text-slate-500">{label}</p>
    </div>
  );
}