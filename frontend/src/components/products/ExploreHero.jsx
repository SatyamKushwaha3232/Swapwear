import { Link } from "react-router-dom";
import { ArrowRight, Repeat2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

export default function ExploreHero() {
  return (
    <div className="relative overflow-hidden rounded-[42px] bg-slate-950 p-6 text-white shadow-[0_38px_110px_rgba(15,23,42,0.24)] md:p-9 xl:p-10">
      <img
        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1500&q=85"
        alt="Explore fashion marketplace"
        className="absolute inset-0 h-full w-full object-cover opacity-42"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,7,25,0.94),rgba(7,7,25,0.58),rgba(7,7,25,0.18))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,79,163,0.32),transparent_34%),radial-gradient(circle_at_85%_80%,rgba(139,92,246,0.24),transparent_34%)]" />

      <div className="relative grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_410px] xl:grid-cols-[minmax(0,1fr)_470px]">
        <div className="min-w-0 py-4">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/14 bg-white/12 px-5 py-2 font-black text-pink-200 backdrop-blur-xl">
            <Sparkles size={16} className="shrink-0" />
            <span className="truncate">Explore Marketplace</span>
          </div>

          <h1 className="mt-5 max-w-4xl text-[clamp(44px,6.4vw,92px)] font-black leading-[0.9]">
            Browse swaps like a luxury drop.
          </h1>

          <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-white/72 md:text-lg">
            Filter by size, condition, points, and style. Every product card is
            tuned for quick scanning, confident saving, and fast swap decisions.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/add-listing" className="button-primary h-13 px-6">
              Add Listing
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex h-13 items-center justify-center rounded-full border border-white/14 bg-white/12 px-6 font-black text-white backdrop-blur-xl transition hover:bg-white hover:text-slate-950"
            >
              My Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <HeroStat icon={TrendingUp} value="Live" label="Fresh listings" />
          <HeroStat icon={ShieldCheck} value="Safe" label="Verified users" />
          <HeroStat icon={Repeat2} value="Eco" label="Swap ready" />
        </div>
      </div>
    </div>
  );
}

function HeroStat({ icon: Icon, value, label }) {
  return (
    <div className="rounded-[26px] border border-white/14 bg-white/12 p-5 shadow-2xl backdrop-blur-2xl transition hover:-translate-y-1 hover:bg-white/16">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-300/18 text-pink-200">
          <Icon size={22} />
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-2xl font-black">{value}</h3>
          <p className="truncate text-sm font-bold text-white/58">{label}</p>
        </div>
      </div>
    </div>
  );
}
