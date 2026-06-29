import { Link } from "react-router-dom";
import {
  ArrowRight,
  Search,
  Sparkles,
  ShieldCheck,
  MapPin,
} from "lucide-react";

import HeroBackground from "./HeroBackground";
import HeroStats from "./HeroStats";
import HeroImages from "./HeroImages";

const popularTags = [
  "Jackets",
  "Hoodies",
  "Sneakers",
  "Ethnic",
  "Streetwear",
  "Vintage",
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen pt-6 xl:pt-8 pb-10">
      <HeroBackground />

      <div className="container-main relative">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 xl:gap-12 items-center min-h-[calc(100vh-120px)]">
          <div className="relative z-10 mt-4 xl:mt-6">
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/45 backdrop-blur-2xl border border-white/50 shadow-[0_10px_35px_rgba(255,105,180,0.16)] font-black">
              <Sparkles size={17} className="text-[var(--accent)]" />
              Sustainable Clothing Swap Marketplace
            </div>

            <h1 className="mt-7 text-[46px] md:text-[68px] xl:text-[82px] font-black tracking-[-4px] leading-[0.98] max-w-[760px]">
              Discover pre-loved fashion ready to swap.
            </h1>

            <p className="mt-6 text-lg md:text-xl text-[var(--muted)] max-w-2xl leading-relaxed">
              Exchange clothes directly with real people, compare swap value,
              chat before finalizing, and discover nearby fashion matches
              without buying something new.
            </p>

            <div className="mt-8 w-full max-w-2xl rounded-full bg-white/45 backdrop-blur-2xl border border-white/50 shadow-[0_16px_55px_rgba(255,105,180,0.16)] p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/55 flex items-center justify-center shrink-0">
                <Search size={21} className="text-[var(--muted)]" />
              </div>

              <input
                placeholder="Search jackets, hoodies, sneakers..."
                className="flex-1 min-w-0 bg-transparent outline-none text-[16px] md:text-[18px] placeholder:text-[var(--muted)]"
              />

              <Link
                to="/explore"
                className="hidden sm:flex items-center gap-2 px-7 py-4 rounded-full bg-pink-400/40 backdrop-blur-xl border border-white/50 text-[var(--text)] font-black hover:bg-pink-400/55 transition shadow-[0_10px_30px_rgba(255,105,180,0.22)]"
              >
                Explore Now
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="font-black text-[var(--muted)]">
                Popular:
              </span>

              {popularTags.map((tag) => (
                <Link
                  key={tag}
                  to="/explore"
                  className="px-5 py-3 rounded-full bg-white/40 backdrop-blur-xl border border-white/50 font-bold text-sm hover:bg-pink-400/20 hover:text-[var(--accent)] transition shadow-sm"
                >
                  {tag}
                </Link>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/40 backdrop-blur-xl border border-white/50 shadow-sm">
                <ShieldCheck size={19} className="text-[var(--green)]" />
                <span className="font-black">Verified Swappers</span>
              </div>

              <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/40 backdrop-blur-xl border border-white/50 shadow-sm">
                <MapPin size={19} className="text-[var(--accent)]" />
                <span className="font-black">Nearby Matching</span>
              </div>

              <Link
                to="/add-listing"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-pink-400/40 backdrop-blur-xl border border-white/50 font-black hover:bg-pink-400/55 transition shadow-[0_10px_30px_rgba(255,105,180,0.22)]"
              >
                List Your Item
                <ArrowRight size={18} />
              </Link>
            </div>

            <HeroStats />
          </div>

          <HeroImages />
        </div>
      </div>
    </section>
  );
}
