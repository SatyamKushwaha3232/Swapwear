import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Clock3,
  Eye,
  Flag,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import DetailGallery from "../components/products/DetailGallery";
import OwnerSwapCard from "../components/products/OwnerSwapCard";
import SimilarProducts from "../components/products/SimilarProducts";
import ReviewPanel from "../components/products/ReviewPanel";
import SwapRequestModal from "../components/swaps/SwapRequestModal";
import { getListingById } from "../services/listings";
import { createMarketplaceReport } from "../services/trust";
import { useAuth } from "../context/AuthContext";
import ActionDialog from "../components/common/ActionDialog";

export default function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      setError("");

      const response = await getListingById(id);

      if (response.success && response.data) {
        setItem(response.data);
        setLoading(false);
        return;
      }

      setItem(null);
      setError(response.success ? "" : response.error || "Unable to load this listing");
      setLoading(false);
    }

    loadItem();
  }, [id]);

  const safeItem = useMemo(() => {
    if (!item) return null;

    const images =
      Array.isArray(item.images) && item.images.length
        ? item.images
        : item.image
        ? [item.image]
        : [];

    return {
      ...item,
      images,
      image: images[0] || "/icons.svg",
      title: item.title || "Untitled Item",
      brand: item.brand || "Unknown Brand",
      size: item.size || "Free",
      condition: item.condition || "Good",
      location: item.location || "India",
      category: item.category || "Fashion",
      points: Number(item.points || 0),
      owner: item.owner || item.owner_name || "SwapWear User",
      ownerId: item.ownerId || item.user_id || null,
      views: Number(item.views || 0),
      swap_status: item.swap_status || "available",
      is_available_for_swap: item.is_available_for_swap !== false,
      description:
        item.description ||
        "Premium pre-loved fashion item available for sustainable swapping.",
    };
  }, [item]);

  function handleRequestSwap() {
    if (!user) {
      toast.error("Please login to request a swap");
      return;
    }

    if (safeItem.ownerId && safeItem.ownerId === user.id) {
      toast.error("You cannot request swap on your own listing");
      return;
    }

    if (!safeItem.is_available_for_swap) {
      toast.error("This item is already reserved or swapped");
      return;
    }

    setSwapModalOpen(true);
  }

  async function handleReportItem() {
    if (!user) {
      toast.error("Please login to report this listing");
      return;
    }

    if (safeItem.ownerId && safeItem.ownerId === user.id) {
      toast.error("You cannot report your own listing");
      return;
    }

    setReportDialogOpen(true);
  }

  async function submitReport(values) {
    const response = await createMarketplaceReport({
      listingId: safeItem.id,
      reportedUserId: safeItem.ownerId,
      reportType: "listing",
      reason: values.reason || "Listing needs admin review",
    });

    if (response.success) {
      setReportDialogOpen(false);
      toast.success("Report sent to admin");
    } else {
      toast.error(response.error || "Unable to report listing");
    }
  }

  if (loading) {
    return (
      <section className="section-space pt-6">
        <div className="container-main">
          <div className="rounded-[34px] bg-white/80 p-10 text-center shadow-lg">
            <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-pink-100" />
            <h1 className="mt-6 text-3xl font-black">Loading item...</h1>
          </div>
        </div>
      </section>
    );
  }

  if (!safeItem) {
    return (
      <section className="section-space pt-6">
        <div className="container-main">
          <div className="rounded-[34px] bg-white p-10 shadow-lg">
            <h1 className="text-4xl font-black">
              {error ? "Unable to load item" : "Item not found"}
            </h1>
            {error && (
              <p className="mt-3 max-w-xl font-semibold text-slate-500">
                {error}
              </p>
            )}
            <Link
              to="/explore"
              className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 font-black text-white"
            >
              Back to Explore
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section-space pt-5">
        <div className="container-main">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-5 py-3 font-black text-slate-800 shadow-md hover:text-pink-500"
            >
              <ArrowLeft size={18} />
              Back to Explore
            </Link>

            <button
              type="button"
              onClick={handleReportItem}
              className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-5 py-3 font-black text-red-600 shadow-sm transition hover:bg-red-100"
            >
              <Flag size={18} />
              Report Listing
            </button>
          </div>

          <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.88fr)]">
            <DetailGallery item={safeItem} />

            <OwnerSwapCard
              item={safeItem}
              user={user}
              requesting={false}
              onRequestSwap={handleRequestSwap}
            />
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              icon={ShieldCheck}
              title="Trusted Swap"
              text="Check owner and item details before exchange."
            />
            <InfoCard
              icon={Ruler}
              title="Size & Fit"
              text={`Size ${safeItem.size}, condition ${safeItem.condition}.`}
            />
            <InfoCard
              icon={Eye}
              title="Views"
              text={`${safeItem.views} users viewed this listing.`}
            />
            <InfoCard
              icon={Clock3}
              title="Fast Flow"
              text="Request, chat, negotiate, and swap."
            />
          </div>

          <div className="mt-8 rounded-[34px] border border-pink-100 bg-white/90 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)] md:p-9">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-5 py-2 font-black text-pink-500">
              <Sparkles size={17} />
              Item Story
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-[-1px]">
              Description
            </h2>

            <p className="mt-4 max-w-4xl text-base font-medium leading-relaxed text-slate-600 md:text-lg">
              {safeItem.description}
            </p>
          </div>
        </div>
      </section>

      <ReviewPanel ownerId={safeItem.ownerId} />
      <SimilarProducts currentId={safeItem.id} />
      <SwapRequestModal
        open={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        user={user}
        ownerItem={safeItem}
        onSuccess={() => {}}
      />
      <ActionDialog
        open={reportDialogOpen}
        title="Report listing"
        text="Tell admin what should be reviewed. Reports help keep swaps safe."
        confirmLabel="Send Report"
        tone="danger"
        fields={[
          {
            name: "reason",
            label: "Reason",
            type: "textarea",
            rows: 4,
            placeholder: "Fake item, unsafe behavior, wrong details...",
          },
        ]}
        initialValues={{ reason: "" }}
        onClose={() => setReportDialogOpen(false)}
        onConfirm={submitReport}
      />
    </>
  );
}

function InfoCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-[28px] border border-pink-100 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
        <Icon size={23} />
      </div>

      <h3 className="mt-5 text-xl font-black">{title}</h3>
      <p className="mt-2 font-medium text-slate-500">{text}</p>
    </div>
  );
}
