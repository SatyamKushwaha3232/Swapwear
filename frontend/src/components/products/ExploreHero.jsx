import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";

export default function ExploreHero() {
  return (
    <section className="relative overflow-hidden rounded-[52px] bg-slate-950 p-8 text-white shadow-[0_34px_110px_rgba(15,23,42,0.26)] md:p-14">
      <div className="absolute -right-28 -top-28 h-[380px] w-[380px] rounded-full bg-pink-500/30 blur-3xl" />
      <div className="absolute -bottom-36 left-16 h-[320px] w-[320px] rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative grid gap-10 lg:grid-cols-[1fr_0.75fr] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 font-black text-pink-200 backdrop-blur-xl">
            <Sparkles size={18} /> Explore Marketplace
          </div>
          <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-[-3px] md:text-7xl">
            Premium fashion items ready for your next swap.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-white/65">
            Discover clothing from real SwapWear users. Search by style, brand, category, size and condition.
          </p>
        </div>

        <div className="rounded-[36px] border border-white/10 bg-white/10 p-6 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500 text-white">
              <TrendingUp size={25} />
            </div>
            <div>
              <p className="font-black text-white/60">Trending this week</p>
              <h3 className="text-2xl font-black">Vintage • Sneakers • Streetwear</h3>
            </div>
          </div>
          <Link
            to="/add-listing"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-black !text-slate-950 transition hover:-translate-y-0.5"
          >
            List your item <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
