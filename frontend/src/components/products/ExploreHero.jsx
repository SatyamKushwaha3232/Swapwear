import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Repeat2 } from "lucide-react";

export default function ExploreHero() {
  return (
    <div className="relative overflow-hidden rounded-[38px] border border-white/70 bg-white/70 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:p-9 xl:p-10">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-pink-300/40 blur-3xl" />
      <div className="absolute -bottom-28 left-24 h-72 w-72 rounded-full bg-fuchsia-300/25 blur-3xl" />

      <div className="relative grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-pink-400/20 px-5 py-2 font-black text-pink-500">
            <Sparkles size={16} className="shrink-0" />
            <span className="truncate">Explore Marketplace</span>
          </div>

          <h1 className="mt-5 max-w-4xl text-[clamp(42px,5.8vw,76px)] font-black leading-[0.96] tracking-[-3px] text-slate-950">
            Find your next favorite fashion swap.
          </h1>

          <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-[var(--muted)] md:text-lg">
            Browse verified listings, filter by size and condition, save your
            favorites, and start a sustainable clothing exchange.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/add-listing"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 font-black text-white shadow-[0_14px_34px_rgba(255,79,163,0.32)] transition hover:-translate-y-0.5"
            >
              Add Listing
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex h-13 items-center justify-center rounded-full border border-pink-100 bg-white px-6 font-black text-pink-500 transition hover:bg-pink-50"
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
    <div className="rounded-[26px] border border-white/70 bg-white/75 p-5 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
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