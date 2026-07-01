import { Link } from "react-router-dom";
import {
  ArrowRight,
  Search,
  Sparkles,
  Recycle,
  ShieldCheck,
  MessageCircle,
  Leaf,
} from "lucide-react";

const tags = ["Jackets", "Hoodies", "Sneakers", "Vintage"];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-4 md:pt-6">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(244,114,182,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,114,182,0.10)_1px,transparent_1px)] bg-[size:80px_80px]" />
      <div className="absolute -left-40 -top-40 h-[460px] w-[460px] rounded-full bg-pink-300/30 blur-3xl" />
      <div className="absolute -right-40 top-40 h-[460px] w-[460px] rounded-full bg-yellow-200/40 blur-3xl" />

      <div className="container-main relative grid min-h-[calc(100vh-120px)] items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.88fr)] xl:gap-12">
        <div className="min-w-0">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/70 bg-white/80 px-5 py-3 text-sm font-black shadow-lg backdrop-blur-xl sm:text-base">
            <Sparkles size={18} className="shrink-0 text-pink-500" />
            <span className="truncate">
              Sustainable Clothing Swap Marketplace
            </span>
          </div>

          <h1 className="mt-7 max-w-3xl text-[clamp(42px,6.2vw,78px)] font-black leading-[0.96] tracking-[-3px] text-slate-950">
            Discover pre-loved fashion ready to swap.
          </h1>

          <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-500 md:text-lg xl:text-xl">
            Exchange clothes directly with real people, chat before swapping,
            and refresh your wardrobe without buying something new.
          </p>

          <div className="mt-8 flex max-w-2xl flex-col gap-3 rounded-[28px] border border-white/70 bg-white/80 p-3 shadow-[0_20px_60px_rgba(255,79,163,0.14)] backdrop-blur-2xl sm:rounded-full md:flex-row">
            <div className="flex h-13 min-w-0 flex-1 items-center px-4">
              <Search size={21} className="shrink-0 text-slate-400" />
              <input
                placeholder="Search jackets, hoodies, sneakers..."
                className="min-w-0 flex-1 bg-transparent px-3 font-bold outline-none placeholder:text-slate-400"
              />
            </div>

            <Link
              to="/explore"
              className="flex h-13 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 font-black text-white shadow-[0_14px_34px_rgba(255,79,163,0.32)] transition hover:-translate-y-0.5"
            >
              Explore Now
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="font-black text-slate-500">Popular:</span>

            {tags.map((item) => (
              <Link
                key={item}
                to="/explore"
                className="rounded-full border border-white/70 bg-white/75 px-4 py-2.5 text-sm font-black shadow-md transition hover:bg-pink-50 hover:text-pink-500"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
            <MiniFeature icon={Recycle} label="Swap" />
            <MiniFeature icon={ShieldCheck} label="Verified" />
            <MiniFeature icon={MessageCircle} label="Chat" />
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function MiniFeature({ icon: Icon, label }) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/75 p-5 shadow-lg backdrop-blur-xl">
      <Icon size={23} className="text-pink-500" />
      <p className="mt-3 font-black">{label}</p>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative hidden min-h-[560px] min-w-0 overflow-hidden lg:block">
      <div className="absolute right-0 top-6 w-[min(76%,420px)] overflow-hidden rounded-[36px] border-[10px] border-white bg-white shadow-[0_30px_90px_rgba(15,23,42,0.14)]">
        <img
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
          alt="Fashion"
          className="h-[500px] w-full object-cover"
        />
      </div>

      <HeroCard
        className="absolute left-0 top-[130px] w-[min(54%,290px)] -rotate-6"
        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80"
        title="Luxury Streetwear"
        text="Premium curated collection"
      />

      <HeroCard
        className="absolute bottom-14 right-[8%] w-[min(58%,320px)] rotate-3"
        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80"
        title="Sustainable Fashion"
        text="Reuse • Refresh • Repeat"
      />

      <div className="absolute bottom-2 left-8 rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(255,79,163,0.16)] backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Leaf size={22} />
          </div>

          <div>
            <p className="text-sm font-black text-slate-500">Eco Impact</p>
            <h3 className="text-2xl font-black">24 Tons</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroCard({ src, title, text, className }) {
  return (
    <div
      className={`${className} animate-float-soft overflow-hidden rounded-[30px] border-[8px] border-white bg-white shadow-[0_26px_80px_rgba(15,23,42,0.14)]`}
    >
      <img src={src} alt={title} className="h-[220px] w-full object-cover" />

      <div className="p-4">
        <h3 className="truncate text-lg font-black">{title}</h3>
        <p className="mt-1 truncate text-sm font-semibold text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}