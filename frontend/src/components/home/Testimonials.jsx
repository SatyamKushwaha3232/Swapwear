import { Link } from "react-router-dom";
import { Star } from "lucide-react";

import SectionHeader from "../common/SectionHeader";
import useRotatingListings, { listingImage } from "../../hooks/useRotatingListings";

export default function Testimonials() {
  const { items, loading } = useRotatingListings(3);

  return (
    <section className="container-main py-16">
      <SectionHeader
        eyebrow="Community Picks"
        title="Live products people can swap now."
        text="These cards are powered by uploaded marketplace products and refresh every 5 minutes."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-[330px] animate-pulse rounded-[30px] bg-pink-50" />
            ))
          : items.map((item) => (
              <Link
                key={item.id}
                to={`/item/${item.id}`}
                className="premium-card interactive-lift overflow-hidden rounded-[30px]"
              >
                <div className="relative h-[210px] overflow-hidden bg-slate-950">
                  <img
                    src={listingImage(item)}
                    alt={item.title || "SwapWear product"}
                    onError={(event) => {
                      event.currentTarget.src = "/icons.svg";
                    }}
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute left-4 top-4 flex gap-1 rounded-full bg-white/90 px-3 py-2 text-yellow-400 backdrop-blur-xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} fill="currentColor" size={15} />
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm font-black text-pink-500">
                    {item.category || "Fashion"}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-2xl font-black">
                    {item.title || "Untitled item"}
                  </h3>
                  <p className="mt-3 line-clamp-2 font-semibold leading-relaxed text-slate-500">
                    {item.description || `${item.brand || "This item"} is ready for a sustainable swap.`}
                  </p>
                </div>
              </Link>
            ))}

        {!loading && items.length === 0 && (
          <div className="rounded-[30px] border border-pink-100 bg-white/80 p-8 text-center shadow-lg md:col-span-3">
            <h3 className="text-2xl font-black">Community picks will appear after products are uploaded.</h3>
          </div>
        )}
      </div>
    </section>
  );
}
