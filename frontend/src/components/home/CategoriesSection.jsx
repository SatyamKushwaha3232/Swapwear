import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

import SectionHeader from "../common/SectionHeader";
import useRotatingListings, { listingImage } from "../../hooks/useRotatingListings";

export default function CategoriesSection() {
  const { items, loading } = useRotatingListings(6);

  return (
    <section className="container-main py-16 md:py-20">
      <SectionHeader
        eyebrow="Uploaded Categories"
        title="Explore what users are listing."
        text="Category cards are generated from real uploaded products and refresh every 5 minutes."
        action={
          <Link
            to="/explore"
            className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/80 px-7 py-4 font-black shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:bg-pink-50 md:flex"
          >
            View All <ArrowRight size={18} />
          </Link>
        }
      />

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[300px] animate-pulse rounded-[30px] bg-pink-50" />
            ))
          : items.map((item) => (
              <Link
                key={item.id}
                to={`/item/${item.id}`}
                className="group relative min-h-[300px] overflow-hidden rounded-[30px] bg-slate-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] transition hover:-translate-y-1"
              >
                <img
                  src={listingImage(item)}
                  alt={item.category || item.title || "SwapWear product"}
                  onError={(event) => {
                    event.currentTarget.src = "/icons.svg";
                  }}
                  className="absolute inset-0 h-full w-full object-cover opacity-64 transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="relative flex min-h-[244px] flex-col justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/16 bg-white/14 text-pink-200 backdrop-blur-xl">
                    <Sparkles size={28} />
                  </div>

                  <div>
                    <p className="font-black text-pink-200">{item.brand || "Uploaded item"}</p>
                    <h3 className="mt-2 text-3xl font-black">{item.category || "Fashion"}</h3>
                    <p className="mt-3 line-clamp-2 font-semibold text-white/70">
                      {item.title || "Explore this uploaded swap item."}
                    </p>
                    <span className="mt-7 inline-flex items-center gap-2 font-black text-white">
                      Browse <ArrowRight size={18} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}

        {!loading && items.length === 0 && (
          <div className="rounded-[30px] border border-pink-100 bg-white/80 p-8 text-center shadow-lg md:col-span-3">
            <h3 className="text-2xl font-black">Uploaded category cards will appear here.</h3>
          </div>
        )}
      </div>
    </section>
  );
}
