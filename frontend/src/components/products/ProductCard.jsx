import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Play,
  Repeat2,
  Sparkles,
  Star,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { addWishlist, getWishlist, removeWishlist } from "../../services/wishlist";

export default function ProductCard({ item }) {
  const { user } = useAuth();

  const images = useMemo(() => {
    if (Array.isArray(item?.images) && item.images.length > 0) return item.images;
    if (item?.image) return [item.image];
    return [];
  }, [item]);

  const [liked, setLiked] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [saving, setSaving] = useState(false);

  const currentImage = images[activeImage] || images[0];

  useEffect(() => {
    async function checkWishlist() {
      if (!user?.id || !item?.id) return;

      const wishlist = await getWishlist(user.id);
      const found = wishlist.find((wish) => Number(wish.listing_id) === Number(item.id));

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

    if (!user?.id) {
      toast.error("Please login to save wishlist");
      return;
    }

    if (saving) return;
    setSaving(true);

    if (liked && wishlistId) {
      const response = await removeWishlist(wishlistId);

      if (response?.success) {
        setLiked(false);
        setWishlistId(null);
        toast.success("Removed from wishlist");
      } else {
        toast.error(response?.error || "Unable to remove wishlist");
      }

      setSaving(false);
      return;
    }

    const response = await addWishlist(user.id, item.id);

    if (response?.success) {
      setLiked(true);
      setWishlistId(response.data?.id);
      toast.success("Saved to wishlist");
    } else {
      toast.error(response?.error || "Unable to save wishlist");
    }

    setSaving(false);
  }

  return (
    <article className="group relative overflow-hidden rounded-[42px] border border-white/80 bg-white/85 p-3 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:shadow-[0_38px_110px_rgba(255,79,163,0.20)]">
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

      <Link to={`/item/${item.id}`} className="block">
        <div className="relative h-[410px] overflow-hidden rounded-[34px] bg-gradient-to-br from-pink-50 to-fuchsia-50">
          {currentImage ? (
            <img
              src={currentImage}
              alt={item.title || "SwapWear item"}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl font-black text-pink-300">
              SW
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/5 to-transparent opacity-90" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-4 py-2 text-xs font-black text-pink-500 shadow-lg backdrop-blur-xl">
              <Sparkles size={13} /> Featured
            </span>
            {item?.video && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/65 px-4 py-2 text-xs font-black text-white shadow-lg backdrop-blur-xl">
                <Play size={13} /> Video
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleWishlist}
            className={`absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full shadow-lg backdrop-blur-xl transition disabled:opacity-60 ${
              liked
                ? "bg-pink-500 text-white"
                : "bg-white/90 text-slate-800 hover:bg-pink-50 hover:text-pink-500"
            }`}
          >
            <Heart size={21} fill={liked ? "currentColor" : "none"} />
          </button>

          {images.length > 1 && (
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-white/75 p-2 backdrop-blur-xl">
              {images.slice(0, 4).map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveImage(index);
                  }}
                  className={`h-2.5 rounded-full transition-all ${
                    activeImage === index ? "w-8 bg-pink-500" : "w-2.5 bg-slate-300"
                  }`}
                />
              ))}
            </div>
          )}

          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-black text-slate-900 shadow-lg backdrop-blur-xl">
              {item.category || "Fashion"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50/95 px-4 py-2 text-sm font-black text-emerald-600 shadow-lg backdrop-blur-xl">
              <Repeat2 size={15} /> Swap Ready
            </span>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-[1.8px] text-pink-500">
              {item.brand || "Unknown Brand"}
            </p>
            <Link to={`/item/${item.id}`}>
              <h3 className="mt-1 line-clamp-1 text-[27px] font-black tracking-[-1px] text-slate-950 transition hover:text-pink-500">
                {item.title || "Untitled Item"}
              </h3>
            </Link>
          </div>

          <div className="rounded-[22px] bg-pink-50 px-4 py-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Points</p>
            <p className="text-xl font-black text-pink-500">{item.points || 0}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip label={`Size ${item.size || "Free"}`} />
          <Chip label={item.condition || "Good"} />
          <Chip label={item.location || "India"} icon={MapPin} />
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-lg font-black text-white shadow-lg ring-4 ring-pink-50">
              {(item.owner || "S").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400">Listed by</p>
              <p className="flex items-center gap-1 truncate font-black text-slate-800">
                {item.owner || "SwapWear User"}
                <BadgeCheck size={15} className="shrink-0 text-pink-500" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-2 text-sm font-black text-slate-700">
            <Star size={16} className="text-yellow-400" fill="currentColor" />
            4.8
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm font-bold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Eye size={16} /> {item.views || 0} views
          </span>
          <span>{item.likes || 0} likes</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            to={`/item/${item.id}`}
            className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 font-black !text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-pink-500"
          >
            View Item
          </Link>
          <Link
            to={`/item/${item.id}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 font-black !text-white shadow-[0_14px_34px_rgba(255,79,163,0.30)] transition hover:-translate-y-0.5"
          >
            <MessageCircle size={17} /> Swap
          </Link>
        </div>
      </div>
    </article>
  );
}

function Chip({ label, icon: Icon }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600">
      {Icon && <Icon size={13} />}
      {label}
    </span>
  );
}