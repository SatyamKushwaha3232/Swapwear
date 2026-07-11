import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Heart,
  Loader2,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import ProductCard from "../components/products/ProductCard";
import { useAuth } from "../context/AuthContext";
import { getWishlist, removeWishlist } from "../services/wishlist";

export default function Wishlist() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [removingId, setRemovingId] = useState(null);

  async function loadWishlist() {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const wishlist = await getWishlist(user.id);

    setItems(
      wishlist
        .map((wish) =>
          wish.listing
            ? {
                ...wish.listing,
                wishlistId: wish.id,
                saved_at: wish.created_at,
              }
            : null
        )
        .filter(Boolean)
    );
    setLoading(false);
  }

  useEffect(() => {
    loadWishlist();
  }, [user?.id]);

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) =>
      [item.title, item.brand, item.category, item.location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [items, query]);

  const availableCount = items.filter(
    (item) => item.is_public !== false && (item.swap_status || "available") === "available"
  ).length;

  async function handleRemove(item) {
    if (!item?.wishlistId) return;

    setRemovingId(item.wishlistId);
    const response = await removeWishlist(item.wishlistId);

    if (response.success) {
      setItems((current) => current.filter((row) => row.wishlistId !== item.wishlistId));
      toast.success("Removed from wishlist");
    } else {
      toast.error(response.error || "Unable to remove wishlist item");
    }

    setRemovingId(null);
  }

  return (
    <section className="section-space pt-28">
      <div className="container-main">
        <div className="relative overflow-hidden rounded-[42px] bg-slate-950 p-7 text-white shadow-[0_34px_100px_rgba(15,23,42,0.22)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(255,79,163,0.36),transparent_34%),radial-gradient(circle_at_86%_20%,rgba(139,92,246,0.26),transparent_28%)]" />
          <div className="relative grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-black text-pink-100 ring-1 ring-white/15">
                <Heart size={17} fill="currentColor" />
                Saved Closet
              </div>

              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.96] md:text-7xl">
                Your favorite swaps, ready when you are.
              </h1>

              <p className="mt-5 max-w-2xl text-lg font-semibold leading-relaxed text-white/68">
                Track products you love, compare availability, and jump back into the swap flow without hunting through explore again.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:w-[440px]">
              <HeroStat label="Saved" value={items.length} />
              <HeroStat label="Available" value={availableCount} />
              <HeroStat label="Categories" value={new Set(items.map((item) => item.category).filter(Boolean)).size} />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[34px] border border-white/60 bg-white/70 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur-2xl md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search saved items..."
                className="h-14 w-full rounded-full border border-pink-100 bg-white/80 pl-12 pr-5 font-semibold outline-none transition focus:border-pink-300"
              />
            </div>

            <Link to="/explore" className="button-primary h-14 shrink-0 px-6">
              <Sparkles size={18} />
              Explore More
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="mt-10 grid place-items-center rounded-[34px] border border-white/60 bg-white/70 p-14">
            <Loader2 size={34} className="animate-spin text-pink-500" />
            <h2 className="mt-5 text-2xl font-black">Loading wishlist...</h2>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-10 rounded-[38px] border border-pink-100 bg-white/85 p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-pink-50 text-pink-500">
              <Heart size={38} />
            </div>

            <h2 className="mt-6 text-4xl font-black">
              {items.length === 0 ? "Wishlist is empty" : "No saved item matched"}
            </h2>

            <p className="mx-auto mt-3 max-w-xl font-semibold leading-relaxed text-slate-500">
              {items.length === 0
                ? "Save products while browsing and your personal swap shortlist will live here."
                : "Try another brand, category, or product name."}
            </p>

            <Link
              to="/explore"
              className="mt-8 inline-flex h-13 items-center gap-2 rounded-full bg-slate-950 px-7 font-black text-white transition hover:-translate-y-0.5"
            >
              Browse Products
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-7 md:grid-cols-2 2xl:grid-cols-3">
            {filteredItems.map((item) => (
              <div key={item.wishlistId || item.id} className="relative">
                <ProductCard item={item} />
                <button
                  type="button"
                  disabled={removingId === item.wishlistId}
                  onClick={() => handleRemove(item)}
                  className="absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 shadow transition hover:bg-red-100 disabled:opacity-60"
                  aria-label="Remove from wishlist"
                >
                  {removingId === item.wishlistId ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-[26px] border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm font-bold text-white/62">{label}</p>
    </div>
  );
}
