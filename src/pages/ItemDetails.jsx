import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Clock3, Eye, Info, Ruler, ShieldCheck, Sparkles } from "lucide-react";

import DetailGallery from "../components/products/DetailGallery";
import OwnerSwapCard from "../components/products/OwnerSwapCard";
import SimilarProducts from "../components/products/SimilarProducts";
import ReviewPanel from "../components/products/ReviewPanel";
import { getListingById, getListings } from "../services/listings";
import { createSwapRequest } from "../services/swaps";
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

  const safeItem = useMemo(() => {
    if (!item) return null;
    const images = Array.isArray(item.images) && item.images.length ? item.images : item.image ? [item.image] : [];
    return {
      ...item,
      images,
      image: images[0] || "",
      title: item.title || "Untitled Item",
      brand: item.brand || "Unknown Brand",
      size: item.size || "Free",
      condition: item.condition || "Good",
      location: item.location || "India",
      category: item.category || "Fashion",
      points: Number(item.points || 0),
      owner: item.owner || item.owner_name || "SwapWear User",
      ownerId: item.ownerId || item.user_id || null,
      views: item.views || "0",
      description: item.description || "Premium pre-loved fashion item available for sustainable swapping.",
    };
  }, [item]);

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
    const offeredItem = myListings.data?.[0] || items[0] || null;

    const response = await createSwapRequest({
      requesterId: user.id,
      ownerId: safeItem.ownerId || null,
      requesterName: profileResponse.data?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "SwapWear User",
      ownerName: safeItem.owner,
      requesterItem: offeredItem,
      ownerItem: safeItem,
    });

    if (!response.success) {
      toast.error(response.error || "Unable to send request");
      setRequesting(false);
      return;
    }
    toast.success("Swap request sent");
    setRequesting(false);
  }

  if (loading) {
    return <section className="container-main py-20"><div className="rounded-[44px] bg-white p-12 text-center shadow-lg"><div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-pink-100" /><h1 className="mt-6 text-4xl font-black">Loading premium item...</h1></div></section>;
  }

  if (!safeItem) {
    return <section className="container-main py-20"><div className="rounded-[44px] bg-white p-12 shadow-lg"><h1 className="text-5xl font-black">Item not found</h1><Link to="/explore" className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 font-black text-white">Back to Explore</Link></div></section>;
  }

  return (
    <>
      <section className="relative overflow-hidden py-10">
        <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute -right-40 top-40 h-[460px] w-[460px] rounded-full bg-fuchsia-200/30 blur-3xl" />

        <div className="container-main relative">
          <Link to="/explore" className="mb-8 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-5 py-3 font-black text-slate-800 shadow-md hover:text-pink-500">
            <ArrowLeft size={18} /> Back to Explore
          </Link>

          <div className="grid gap-12 xl:grid-cols-[1.05fr_0.95fr]">
            <DetailGallery item={safeItem} />
            <OwnerSwapCard item={safeItem} user={user} requesting={requesting} onRequestSwap={handleRequestSwap} />
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-4">
            <InfoCard icon={ShieldCheck} title="Trusted Swap" text="Profile and listing details help build trust before exchange." />
            <InfoCard icon={Ruler} title="Size & Fit" text={`Size ${safeItem.size} with condition marked as ${safeItem.condition}.`} />
            <InfoCard icon={Eye} title="Views" text={`${safeItem.views} users viewed this listing recently.`} />
            <InfoCard icon={Clock3} title="Fast Flow" text="Send request, chat, negotiate, and finalize your swap." />
          </div>

          <div className="mt-12 rounded-[44px] border border-pink-100 bg-white p-8 shadow-[0_30px_90px_rgba(15,23,42,0.07)] md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-5 py-2 font-black text-pink-500"><Sparkles size={17} /> Item Story</div>
            <h2 className="mt-5 text-4xl font-black tracking-[-1.5px]">Description</h2>
            <p className="mt-5 max-w-4xl text-lg font-medium leading-relaxed text-slate-600">{safeItem.description}</p>
          </div>
        </div>
      </section>

      <ReviewPanel />
      <SimilarProducts currentId={safeItem.id} />
    </>
  );
}

function InfoCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-[34px] border border-pink-100 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-500"><Icon size={24} /></div>
      <h3 className="mt-5 text-xl font-black">{title}</h3>
      <p className="mt-2 font-medium text-slate-500">{text}</p>
    </div>
  );
}
