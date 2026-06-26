import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Heart,
  MapPin,
  ShieldCheck,
  MessageCircle,
  Repeat2,
  Eye,
  Clock3,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useParams, Link } from "react-router-dom";

import ProductGallery from "../components/products/ProductGallery";
import { createSwapRequest } from "../services/swaps";
import { getListingById, getListings } from "../services/listings";
import { getCurrentProfile } from "../services/profile";
import { useAuth } from "../context/AuthContext";
import { items } from "../data/items";

export default function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);

      const response = await getListingById(id);

      if (response.success && response.data) {
        setItem(response.data);
        setLoading(false);
        return;
      }

      const demoItem = items.find((product) => String(product.id) === String(id));
      setItem(demoItem || null);
      setLoading(false);
    }

    loadItem();
  }, [id]);

  if (loading) {
    return (
      <section className="section-space pt-28">
        <div className="container-main">
          <div className="rounded-[40px] bg-white/55 backdrop-blur-2xl border border-white/50 p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="mx-auto w-16 h-16 rounded-full bg-pink-400/20 animate-pulse" />
            <h1 className="mt-6 text-4xl font-black">Loading item...</h1>
            <p className="mt-3 text-[var(--muted)] font-semibold">
              Please wait while we prepare the premium listing.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="section-space pt-28">
        <div className="container-main">
          <div className="rounded-[40px] bg-white/55 backdrop-blur-2xl border border-white/50 p-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <h1 className="text-5xl font-black">Item not found</h1>
            <p className="mt-4 text-[var(--muted)] font-semibold">
              This listing may have been removed or the link is incorrect.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 mt-7 px-6 py-3 rounded-full bg-pink-400/30 border border-white/50 font-black"
            >
              <ArrowLeft size={18} />
              Back to Explore
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const safeImages =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.image
      ? [item.image]
      : [];

  const safeItem = {
    ...item,
    images: safeImages,
    image: safeImages[0] || "",
    title: item.title || "Untitled Item",
    brand: item.brand || "Unknown Brand",
    size: item.size || "Free",
    condition: item.condition || "Good",
    location: item.location || "India",
    category: item.category || "Fashion",
    points: item.points || 0,
    owner: item.owner || "SwapWear User",
    ownerId: item.ownerId || item.user_id || null,
    likes: item.likes ?? 0,
    views: item.views ?? "0",
    description:
      item.description ||
      "Premium pre-loved fashion item available for sustainable swapping.",
  };

  async function handleRequestSwap() {
    if (!user) {
      toast.error("Please login to request a swap");
      return;
    }

    if (safeItem.ownerId && safeItem.ownerId === user.id) {
      toast.error("You cannot request swap on your own listing");
      return;
    }

    setRequesting(true);

    const profileResponse = await getCurrentProfile();
    const myListings = await getListings(user.id);
    const offeredItem = myListings.data?.[0] || items[0];

    const response = await createSwapRequest({
      requesterId: user.id,
      ownerId: safeItem.ownerId || null,
      requesterName:
        profileResponse.data?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "SwapWear User",
      ownerName: safeItem.owner,
      requesterItem: offeredItem,
      ownerItem: safeItem,
    });

    if (!response.success) {
      toast.error(response.error);
      setRequesting(false);
      return;
    }

    toast.success("Swap request sent");
    setRequesting(false);
  }

  return (
    <section className="section-space pt-28">
      <div className="container-main">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 mb-8 px-5 py-3 rounded-full bg-white/55 backdrop-blur-xl border border-white/50 font-black hover:bg-pink-400/20 transition"
        >
          <ArrowLeft size={18} />
          Back to Explore
        </Link>

        <div className="grid xl:grid-cols-[1.05fr_0.95fr] gap-14 xl:gap-16 items-start">
          <ProductGallery item={safeItem} />

          <div className="xl:sticky xl:top-32">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-400/20 backdrop-blur-xl border border-white/50 text-[var(--accent)] font-black">
              <Sparkles size={16} />
              Premium Listing
            </div>

            <div className="mt-6 flex items-start justify-between gap-5">
              <div className="min-w-0">
                <h1 className="text-[42px] md:text-[56px] xl:text-[64px] font-black tracking-[-3px] leading-[0.98]">
                  {safeItem.title}
                </h1>
                <p className="mt-4 text-xl text-[var(--muted)] font-semibold">
                  {safeItem.brand} • Size {safeItem.size} • {safeItem.category}
                </p>
              </div>

              <button className="shrink-0 w-14 h-14 rounded-full bg-white/55 backdrop-blur-xl border border-white/50 flex items-center justify-center shadow-lg hover:bg-pink-400/20 transition">
                <Heart size={20} />
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Pill>{safeItem.condition}</Pill>
              <Pill>
                <MapPin size={17} className="text-[var(--accent)]" />
                {safeItem.location}
              </Pill>
              <span className="px-5 py-3 rounded-full bg-[var(--green-soft)] text-[var(--green)] font-black flex items-center gap-2">
                <ShieldCheck size={17} />
                Verified Owner
              </span>
            </div>

            <div className="mt-9 rounded-[38px] bg-white/55 backdrop-blur-2xl border border-white/50 shadow-[0_22px_70px_rgba(15,23,42,0.08)] p-7 md:p-8">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-black text-[var(--muted)]">
                    Swap Value
                  </p>
                  <div className="mt-2 flex items-end gap-3">
                    <h2 className="text-6xl font-black leading-none text-[var(--accent)]">
                      {safeItem.points}
                    </h2>
                    <p className="text-[var(--muted)] font-black pb-2">points</p>
                  </div>
                </div>

                <div className="w-20 h-20 rounded-full bg-pink-400/20 border border-pink-300/30 flex items-center justify-center">
                  <Repeat2 size={32} />
                </div>
              </div>

              <div className="mt-8 grid sm:grid-cols-2 gap-5">
                <InfoBox icon={ShieldCheck} title="Trusted Swap">
                  Owner profile and listing details are verified for safer exchange.
                </InfoBox>
                <InfoBox icon={Clock3} title="Quick Response">
                  Usually replies fast for photos, value negotiation, and location.
                </InfoBox>
              </div>

              <div className="mt-8">
                <h3 className="text-2xl font-black">Description</h3>
                <p className="mt-4 text-[16px] text-[var(--muted)] leading-relaxed">
                  {safeItem.description}
                </p>
              </div>

              <div className="mt-8 rounded-[30px] bg-white/50 border border-white/50 p-5">
                <div className="flex items-center justify-between gap-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-full bg-[var(--accent-soft)] shrink-0 flex items-center justify-center">
                      <span className="text-xl font-black text-[var(--accent)]">
                        {safeItem.owner.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-[var(--muted)] font-semibold">
                        Listed by
                      </p>
                      <h3 className="text-2xl font-black truncate">
                        {safeItem.owner}
                      </h3>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--green-soft)] text-[var(--green)] font-black">
                    <ShieldCheck size={18} />
                    Verified
                  </div>
                </div>
              </div>

              <div className="mt-7 flex items-center gap-8 text-[var(--muted)] font-black">
                <span className="flex items-center gap-2">
                  <Eye size={20} />
                  {safeItem.views} views
                </span>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleRequestSwap}
                  disabled={requesting}
                  className="flex-1 h-[64px] rounded-full bg-pink-400/35 backdrop-blur-xl border border-white/50 font-black text-lg hover:bg-pink-400/50 transition flex items-center justify-center gap-3 shadow-[0_12px_34px_rgba(255,105,180,0.20)] disabled:opacity-60"
                >
                  <Repeat2 size={22} />
                  {requesting ? "Sending..." : "Request Swap"}
                </button>

                <Link
                  to="/chat"
                  className="flex-1 h-[64px] rounded-full bg-white/55 backdrop-blur-xl border border-white/50 font-black text-lg hover:bg-pink-400/20 transition flex items-center justify-center gap-3"
                >
                  <MessageCircle size={22} />
                  Chat Owner
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pill({ children }) {
  return (
    <span className="px-5 py-3 rounded-full bg-white/55 backdrop-blur-xl border border-white/50 font-black flex items-center gap-2">
      {children}
    </span>
  );
}

function InfoBox({ icon: Icon, title, children }) {
  return (
    <div className="rounded-[28px] bg-white/50 border border-white/50 p-5">
      <div className="flex items-center gap-3 font-black">
        <Icon size={18} className="text-[var(--accent)]" />
        {title}
      </div>
      <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
        {children}
      </p>
    </div>
  );
}
