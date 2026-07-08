import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  Heart,
  MapPin,
  MessageCircle,
  Play,
  Repeat2,
  Sparkles,
  Star,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
  addWishlist,
  getWishlist,
  removeWishlist,
} from "../../services/wishlist";

export default function ProductCard({ item }) {
  const { user } = useAuth();
  const videoRef = useRef(null);

  const [hovered, setHovered] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  const [saving, setSaving] = useState(false);

  const images = useMemo(() => {
    if (Array.isArray(item?.images) && item.images.length > 0) {
      return item.images.slice(0, 5);
    }

    if (item?.image) return [item.image];

    return ["/icons.svg"];
  }, [item]);

  const hasVideo = Boolean(item?.video);
  const currentImage = images[activeImage] || "/icons.svg";
  const availableForSwap = item?.is_available_for_swap !== false;
  const availabilityLabel = item?.swap_status === "completed" ? "Swapped" : item?.swap_status === "locked" ? "Reserved" : "Swap Ready";

  useEffect(() => {
    if (hasVideo || images.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImage((prev) =>
        hovered
          ? (prev + 1) % images.length
          : Math.floor(Math.random() * images.length)
      );
    }, hovered ? 850 : 2600);

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

  useEffect(() => {
    async function checkWishlist() {
      if (!user?.id || !item?.id) {
        setLiked(false);
        setWishlistId(null);
        return;
      }

      const wishlist = await getWishlist(user.id);

      const list = Array.isArray(wishlist)
        ? wishlist
        : Array.isArray(wishlist?.data)
        ? wishlist.data
        : [];

      const found = list.find(
        (wish) =>
          String(wish.listing_id) === String(item.id) ||
          String(wish.listing?.id) === String(item.id)
      );

      if (found) {
        setLiked(true);
        setWishlistId(found.id);
      } else {
        setLiked(false);
        setWishlistId(null);
      }
    }

    checkWishlist();
  }, [user?.id, item?.id]);

  async function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      toast.error("Please login to save wishlist");
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      if (liked && wishlistId) {
        const response = await removeWishlist(wishlistId);

        if (response?.success === false) {
          throw new Error(response.error || "Unable to remove wishlist");
        }

        setLiked(false);
        setWishlistId(null);
        toast.success("Removed from wishlist");
      } else {
        const response = await addWishlist(user.id, item.id);

        if (response?.success === false) {
          throw new Error(response.error || "Unable to save wishlist");
        }

        setLiked(true);
        setWishlistId(response?.data?.id || response?.id || null);
        toast.success("Saved to wishlist");
      }
    } catch (error) {
      toast.error(error.message || "Wishlist action failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group min-w-0 overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(255,79,163,0.15)]"
    >
      <Link to={`/item/${item.id}`} className="block min-w-0">
        <div className="relative m-3 h-[252px] overflow-hidden rounded-[22px] bg-pink-50 sm:h-[270px] xl:h-[285px]">
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
              src={currentImage}
              alt={item.title || "SwapWear product"}
              onError={(e) => {
                e.currentTarget.src = "/icons.svg";
              }}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

          <div className="absolute left-3 top-3 flex max-w-[calc(100%-64px)] flex-wrap gap-2">
            <span className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black text-pink-500 shadow">
              <Sparkles size={12} className="shrink-0" />
              <span className="truncate">Featured</span>
            </span>

            {hasVideo && (
              <span className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-slate-950/75 px-3 py-1.5 text-[11px] font-black text-white shadow">
                <Play size={12} className="shrink-0" />
                <span className="truncate">Video</span>
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleWishlist}
            className={`absolute right-3 top-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow transition disabled:opacity-60 ${
              liked
                ? "bg-pink-500 text-white"
                : "bg-white/95 text-slate-700 hover:text-pink-500"
            }`}
          >
            <Heart size={19} fill={liked ? "currentColor" : "none"} />
          </button>

          <div className="absolute bottom-3 left-3 right-3 flex min-w-0 items-center justify-between gap-2">
            <span className="max-w-[48%] truncate rounded-full bg-white/95 px-3 py-2 text-xs font-black shadow">
              {item.category || "Fashion"}
            </span>

            <span
              className={`inline-flex max-w-[52%] items-center gap-1 truncate rounded-full px-3 py-2 text-xs font-black shadow ${
                availableForSwap
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-950/80 text-white"
              }`}
            >
              <Repeat2 size={13} className="shrink-0" />
              <span className="truncate">{availabilityLabel}</span>
            </span>
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-[54px] left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-white/75 px-2 py-1.5 backdrop-blur-xl">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    activeImage === index ? "w-5 bg-pink-500" : "w-1.5 bg-slate-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="min-w-0 px-5 pb-5">
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

        <div className="mt-3 flex min-w-0 flex-wrap gap-2">
          <Chip label={`Size ${item.size || "Free"}`} />
          <Chip label={item.condition || "Good"} />
          <Chip label={item.location || "India"} icon={MapPin} />
        </div>

        <div className="mt-4 flex min-w-0 items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 font-black text-white">
              {(item.owner || item.owner_name || "S").charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-400">
                Listed by
              </p>

              <p className="flex min-w-0 items-center gap-1 truncate text-sm font-black">
                <span className="truncate">
                  {item.owner || item.owner_name || "SwapWear User"}
                </span>
                <BadgeCheck size={14} className="shrink-0 text-pink-500" />
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
            className={`flex h-11 items-center justify-center gap-2 rounded-full text-sm font-black ${
              availableForSwap
                ? "bg-pink-500 text-white hover:bg-pink-600"
                : "cursor-not-allowed bg-slate-100 text-slate-400"
            }`}
            aria-disabled={!availableForSwap}
          >
            <MessageCircle size={16} />
            {availableForSwap ? "Swap" : "Unavailable"}
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