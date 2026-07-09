import { Link } from "react-router-dom";
import { ArrowRight, Flame, Repeat2, Sparkles } from "lucide-react";

import useRotatingListings, { listingImage } from "../../hooks/useRotatingListings";

const icons = [Flame, Sparkles, Repeat2];

export default function CollectionBanner() {
  const { items, loading } = useRotatingListings(3);

  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="min-h-[260px] animate-pulse rounded-[34px] bg-pink-50" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[30px] border border-pink-100 bg-white/80 p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <h3 className="text-2xl font-black">Product collections will appear here.</h3>
        <p className="mt-2 font-semibold text-slate-500">Upload listings to build live marketplace collections.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((item, index) => {
        const Icon = icons[index % icons.length];

        return (
          <Link
            key={`${item.id}-${index}`}
            to={`/item/${item.id}`}
            className="group relative min-h-[260px] overflow-hidden rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_26px_80px_rgba(15,23,42,0.16)] transition hover:-translate-y-1"
          >
            <img
              src={listingImage(item)}
              alt={item.title || "SwapWear product"}
              onError={(event) => {
                event.currentTarget.src = "/icons.svg";
              }}
              className="absolute inset-0 h-full w-full object-cover opacity-62 transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/48 to-transparent" />

            <div className="relative flex h-full min-h-[212px] flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/14 bg-white/14 text-pink-200 backdrop-blur-xl">
                  <Icon size={25} />
                </div>
                <ArrowRight
                  size={20}
                  className="text-white/50 transition group-hover:translate-x-1 group-hover:text-white"
                />
              </div>

              <div>
                <p className="font-black text-pink-200">{item.category || "Fashion"}</p>
                <h3 className="mt-2 line-clamp-2 text-3xl font-black">
                  {item.title || "Untitled item"}
                </h3>
                <p className="mt-2 truncate font-semibold text-white/70">
                  {item.brand || "Brand"} - {item.points || 0} pts
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
