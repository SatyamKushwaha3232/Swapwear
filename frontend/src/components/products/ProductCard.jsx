import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  MessageCircle,
  Repeat2,
  Sparkles,
  Star,
} from "lucide-react";

export default function ProductCard({ item }) {
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const images = useMemo(() => {
    if (Array.isArray(item?.images) && item.images.length) return item.images;
    if (item?.image) return [item.image];
    return ["/icons.svg"];
  }, [item]);

  const hasVideo = Boolean(item?.video);

  useEffect(() => {
    if (hasVideo || images.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImage((prev) =>
        hovered
          ? (prev + 1) % images.length
          : Math.floor(Math.random() * images.length)
      );
    }, hovered ? 850 : 2400);

    return () => clearInterval(interval);
  }, [hovered, hasVideo, images.length]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (hovered && hasVideo) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [hovered, hasVideo]);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group w-full min-w-0 overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(255,79,163,0.15)]"
    >
      <Link to={`/item/${item.id}`} className="block min-w-0">
        <div className="relative m-3 h-[250px] overflow-hidden rounded-[22px] bg-pink-50 sm:h-[265px] 2xl:h-[280px]">
          {hovered && hasVideo ? (
            <video
              ref={videoRef}
              src={item.video}
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={images[activeImage] || "/icons.svg"}
              alt={item.title || "Product"}
              onError={(e) => {
                e.currentTarget.src = "/icons.svg";
              }}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          )}

          <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black text-pink-500 shadow">
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Sparkles size={12} /> Featured
            </span>
          </div>

          <button
            type="button"
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow hover:text-pink-500"
          >
            <Heart size={19} />
          </button>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="max-w-[48%] truncate rounded-full bg-white/95 px-3 py-2 text-xs font-black shadow">
              {item.category || "Fashion"}
            </span>

            <span className="inline-flex max-w-[52%] items-center gap-1 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-600 shadow">
              <Repeat2 size={13} />
              <span className="truncate">Swap Ready</span>
            </span>
          </div>
        </div>
      </Link>

      <div className="px-5 pb-5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-black uppercase tracking-[1.2px] text-pink-500">
              {item.brand || "Brand"}
            </p>

            <Link to={`/item/${item.id}`}>
              <h3 className="mt-1 truncate text-[20px] font-black leading-tight text-slate-950 hover:text-pink-500">
                {item.title || "Untitled Item"}
              </h3>
            </Link>
          </div>

          <div className="shrink-0 rounded-[16px] bg-pink-50 px-3 py-2 text-center">
            <p className="text-[9px] font-black uppercase text-slate-400">
              Points
            </p>
            <p className="text-base font-black text-pink-500">
              {item.points || 0}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Chip label={`Size ${item.size || "Free"}`} />
          <Chip label={item.condition || "Good"} />
          <Chip label={item.location || "India"} icon={MapPin} />
        </div>

        <div className="mt-4 flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-500 font-black text-white">
              {(item.owner || item.owner_name || "S").charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-400">Listed by</p>
              <p className="truncate text-sm font-black">
                {item.owner || item.owner_name || "SwapWear User"}
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-yellow-50 px-3 py-2 text-sm font-black">
            <Star size={14} fill="currentColor" className="text-yellow-400" />
            4.8
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            to={`/item/${item.id}`}
            className="flex h-11 items-center justify-center rounded-full border border-slate-300 text-sm font-black hover:border-pink-400 hover:text-pink-500"
          >
            View Item
          </Link>

          <Link
            to={`/item/${item.id}`}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-pink-500 text-sm font-black text-white hover:bg-pink-600"
          >
            <MessageCircle size={16} />
            Swap
          </Link>
        </div>
      </div>
    </article>
  );
}

function Chip({ label, icon: Icon }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-600">
      {Icon && <Icon size={12} className="shrink-0" />}
      <span className="truncate">{label}</span>
    </span>
  );
}