import { Link } from "react-router-dom";
import {
  ArrowRight,
  Leaf,
  MessageCircle,
  Recycle,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import useRotatingListings, { listingImage } from "../../hooks/useRotatingListings";
import { categoryHighlights } from "../../utils/marketplaceHighlights";

export default function Hero() {
  const { allItems } = useRotatingListings(4);
  const tags = categoryHighlights(allItems, 4).map((item) => item.title);

  return (
    <section className="relative overflow-hidden px-3 pt-3 md:px-5 md:pt-4">
      <div className="relative mx-auto min-h-[calc(100vh-120px)] max-w-[1500px] overflow-hidden rounded-[34px] bg-slate-950 text-white shadow-[0_42px_120px_rgba(15,23,42,0.28)] md:rounded-[44px]">
        <img
          src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1900&q=85"
          alt="Premium fashion swap editorial"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,7,25,0.94)_0%,rgba(7,7,25,0.72)_42%,rgba(7,7,25,0.22)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_22%,rgba(255,79,163,0.34),transparent_34%),radial-gradient(circle_at_78%_75%,rgba(139,92,246,0.24),transparent_32%)]" />

        <div className="relative grid min-h-[calc(100vh-120px)] items-center gap-10 px-5 py-10 md:px-10 lg:grid-cols-[minmax(0,1fr)_470px] xl:px-14">
          <div className="max-w-4xl">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black shadow-2xl backdrop-blur-2xl sm:text-base">
              <Sparkles size={18} className="shrink-0 text-pink-300" />
              <span className="truncate">Sustainable Clothing Swap Marketplace</span>
            </div>

            <h1 className="mt-7 max-w-4xl text-[clamp(46px,7.4vw,112px)] font-black leading-[0.88]">
              Trade style. Not money.
            </h1>

            <p className="mt-7 max-w-2xl text-base font-semibold leading-relaxed text-white/76 md:text-xl">
              Discover pre-loved fashion, send structured swap requests, chat with
              real swappers, and refresh your wardrobe with a marketplace that
              feels premium from the first click.
            </p>

            <div className="mt-8 flex max-w-2xl flex-col gap-3 rounded-[28px] border border-white/14 bg-white/12 p-3 shadow-[0_28px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl sm:rounded-full md:flex-row">
              <div className="flex h-13 min-w-0 flex-1 items-center px-4">
                <Search size={21} className="shrink-0 text-pink-200" />
                <input
                  placeholder="Search jackets, hoodies, sneakers..."
                  className="min-w-0 flex-1 bg-transparent px-3 font-bold text-white outline-none placeholder:text-white/50"
                />
              </div>

              <Link to="/explore" className="button-primary h-13 shrink-0 px-6">
                Explore Now
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="font-black text-white/58">Popular:</span>
              {tags.map((item) => (
                <Link
                  key={item}
                  to={`/explore?category=${encodeURIComponent(item)}`}
                  className="rounded-full border border-white/12 bg-white/10 px-4 py-2.5 text-sm font-black text-white/84 backdrop-blur-xl transition hover:bg-white hover:text-slate-950"
                >
                  {item}
                </Link>
              ))}
              {tags.length === 0 && (
                <Link
                  to="/explore"
                  className="rounded-full border border-white/12 bg-white/10 px-4 py-2.5 text-sm font-black text-white/84 backdrop-blur-xl transition hover:bg-white hover:text-slate-950"
                >
                  Browse live listings
                </Link>
              )}
            </div>
          </div>

          <HeroPanel />
        </div>

        <div className="relative grid border-t border-white/10 bg-white/10 backdrop-blur-2xl md:grid-cols-3">
          <MiniFeature icon={Recycle} label="Swap verified products" />
          <MiniFeature icon={ShieldCheck} label="Structured request flow" />
          <MiniFeature icon={MessageCircle} label="Chat before exchange" />
        </div>
      </div>
    </section>
  );
}

function MiniFeature({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-4 border-white/10 p-5 md:border-r md:p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-pink-200">
        <Icon size={23} />
      </div>
      <p className="font-black text-white/86">{label}</p>
    </div>
  );
}

function HeroPanel() {
  const { items } = useRotatingListings(2);
  const primary = items[0];
  const secondary = items[1] || items[0];

  return (
    <div className="hidden lg:block">
      <div className="relative min-h-[560px]">
        <div className="absolute right-0 top-0 w-[82%] overflow-hidden rounded-[34px] border border-white/14 bg-white/10 p-3 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <img
            src={primary ? listingImage(primary) : "/icons.svg"}
            alt={primary?.title || "Curated uploaded product"}
            onError={(event) => {
              event.currentTarget.src = "/icons.svg";
            }}
            className="h-[420px] w-full rounded-[26px] object-cover"
          />
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="line-clamp-1 text-2xl font-black">
                {primary?.title || "Uploaded Drops"}
              </h3>
              <p className="mt-1 font-semibold text-white/60">
                {primary?.brand || primary?.category || "Products rotate every 5 minutes"}
              </p>
            </div>
            <span className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-black text-emerald-950">
              Live
            </span>
          </div>
        </div>

        <div className="absolute left-0 top-24 w-[230px] rotate-[-7deg] overflow-hidden rounded-[28px] border border-white/14 bg-white/12 p-3 shadow-2xl backdrop-blur-2xl">
          <img
            src={secondary ? listingImage(secondary) : "/icons.svg"}
            alt={secondary?.title || "Uploaded product"}
            onError={(event) => {
              event.currentTarget.src = "/icons.svg";
            }}
            className="h-[210px] w-full rounded-[22px] object-cover"
          />
          <p className="mt-3 line-clamp-1 font-black">
            {secondary?.category || "Uploaded Picks"}
          </p>
        </div>

        <div className="absolute bottom-16 left-10 rounded-[24px] border border-white/14 bg-white/14 p-5 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/20 text-emerald-200">
              <Leaf size={22} />
            </div>
            <div>
              <p className="text-sm font-black text-white/60">Eco Impact</p>
              <h3 className="text-3xl font-black">24 Tons</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
