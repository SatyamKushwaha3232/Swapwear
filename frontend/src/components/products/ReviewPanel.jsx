import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, ShieldCheck, Star, ThumbsUp } from "lucide-react";

import useRotatingListings, { listingImage } from "../../hooks/useRotatingListings";
import { getUserReviews } from "../../services/trust";

export default function ReviewPanel({ ownerId }) {
  const { items, loading } = useRotatingListings(2);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    async function loadReviews() {
      if (!ownerId) {
        setReviews([]);
        return;
      }

      setReviewsLoading(true);
      const response = await getUserReviews(ownerId);
      if (response.success) setReviews(response.data || []);
      setReviewsLoading(false);
    }

    loadReviews();
  }, [ownerId]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return "New";
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return `${(total / reviews.length).toFixed(1)}/5`;
  }, [reviews]);

  return (
    <section className="section-space pt-0">
      <div className="container-main">
        <div className="grid gap-7 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[34px] border border-pink-100 bg-white/90 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)] md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-5 py-2 font-black text-pink-500">
              <Star size={17} fill="currentColor" />
              Trust Score
            </div>

            <h2 className="mt-5 text-4xl font-black">{averageRating} rating</h2>

            <p className="mt-3 font-semibold leading-relaxed text-[var(--muted)]">
              {reviews.length > 0
                ? `${reviews.length} completed swap review${reviews.length === 1 ? "" : "s"} for this owner.`
                : "Ratings will appear after completed swaps."}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <TrustItem icon={ShieldCheck} title="Verified" text="User identity checked" />
              <TrustItem icon={MessageCircle} title="Responsive" text="Quick chat replies" />
              <TrustItem icon={ThumbsUp} title="Reliable" text="Good swap history" />
            </div>
          </div>

          <div className="rounded-[34px] border border-pink-100 bg-white/90 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)] md:p-8">
            <h2 className="text-3xl font-black">
              {reviews.length > 0 ? "Owner Reviews" : "Live Marketplace Signals"}
            </h2>
            <p className="mt-2 font-semibold text-slate-500">
              {reviews.length > 0
                ? "Real feedback from completed swaps."
                : "Powered by uploaded products, rotating every 5 minutes."}
            </p>

            <div className="mt-6 grid gap-4">
              {reviewsLoading
                ? Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="h-28 animate-pulse rounded-[26px] bg-pink-50" />
                  ))
                : reviews.length > 0
                  ? reviews.slice(0, 3).map((review) => (
                      <div
                        key={review.id}
                        className="rounded-[26px] border border-pink-50 bg-pink-50/50 p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-black">Verified swap review</h3>
                          <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-black text-slate-700">
                            <Star size={15} fill="currentColor" className="text-yellow-400" />
                            {review.rating}/5
                          </div>
                        </div>
                        <p className="mt-3 line-clamp-3 font-medium leading-relaxed text-slate-600">
                          {review.comment || "Smooth swap completed successfully."}
                        </p>
                      </div>
                    ))
                  : loading
                ? Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="h-32 animate-pulse rounded-[26px] bg-pink-50" />
                  ))
                : items.map((item) => (
                    <Link
                      key={item.id}
                      to={`/item/${item.id}`}
                      className="rounded-[26px] border border-pink-50 bg-pink-50/50 p-5 transition hover:-translate-y-1 hover:bg-pink-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={listingImage(item)}
                            alt={item.title || "SwapWear product"}
                            onError={(event) => {
                              event.currentTarget.src = "/icons.svg";
                            }}
                            className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                          />

                          <div className="min-w-0">
                            <h3 className="truncate font-black">{item.title || "Untitled item"}</h3>
                            <p className="truncate text-sm font-bold text-slate-500">
                              {item.brand || "Brand"} - {item.category || "Fashion"}
                            </p>
                          </div>
                        </div>

                        <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-black text-slate-700">
                          <Star size={15} fill="currentColor" className="text-yellow-400" />
                          4.8
                        </div>
                      </div>

                      <p className="mt-4 line-clamp-2 font-medium leading-relaxed text-slate-600">
                        {item.description || "This uploaded item is ready for a trustworthy swap conversation."}
                      </p>
                    </Link>
                  ))}

              {!reviewsLoading && reviews.length === 0 && !loading && items.length === 0 && (
                <div className="rounded-[26px] border border-pink-50 bg-pink-50/50 p-5 text-center">
                  <p className="font-black text-slate-700">Marketplace signals will appear after products are uploaded.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustItem({ icon: Icon, title, text }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[22px] bg-pink-50/70 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-pink-500">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <h3 className="truncate font-black">{title}</h3>
        <p className="truncate text-sm font-semibold text-slate-500">{text}</p>
      </div>
    </div>
  );
}
