import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Repeat2 } from "lucide-react";

export default function ExploreHero() {
  return (
    <div className="premium-surface relative overflow-hidden rounded-[38px] p-7 md:p-9 xl:p-10">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(255,79,163,0.12),transparent_38%),linear-gradient(300deg,rgba(139,92,246,0.10),transparent_42%)]" />

      <div className="relative grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/70 bg-white/70 px-5 py-2 font-black text-pink-500 shadow-sm backdrop-blur-xl">
            <Sparkles size={16} className="shrink-0" />
            <span className="truncate">Explore Marketplace</span>
          </div>

          <h1 className="mt-5 max-w-4xl text-[clamp(40px,5.8vw,76px)] font-black leading-[0.96] text-slate-950">
            Find your next favorite fashion swap.
          </h1>

          <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-[var(--muted)] md:text-lg">
            Browse verified listings, filter by size and condition, save your
            favorites, and start a sustainable clothing exchange.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/add-listing"
              className="button-primary h-13 px-6"
            >
              Add Listing
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/dashboard"
              className="button-quiet h-13 px-6"
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
    <div className="premium-card interactive-lift rounded-[26px] p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-500 shadow-sm">
          <Icon size={22} />
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-2xl font-black">{value}</h3>
          <p className="truncate text-sm font-bold text-[var(--muted)]">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}
