import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  HeartHandshake,
  Loader2,
  MapPin,
  MessageCircle,
  Repeat2,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import InlineError from "../components/common/InlineError";
import ProductCard from "../components/products/ProductCard";
import { getListings } from "../services/listings";

export default function Community() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);

  async function loadCommunity() {
    setLoading(true);
    setError(null);

    const response = await getListings(null, { includeUnavailable: true });

    if (response.success) {
      setItems(response.data || []);
    } else {
      setError(response.error || "Unable to load community");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCommunity();
  }, []);

  const community = useMemo(() => {
    const visible = items.filter((item) => item.is_public !== false);
    const available = visible.filter((item) => item.is_available_for_swap);
    const owners = new Set(visible.map((item) => item.user_id).filter(Boolean));
    const categories = rankBy(visible, "category").slice(0, 8);
    const cities = rankBy(visible, "location").slice(0, 6);
    const brands = rankBy(visible, "brand").slice(0, 6);
    const totalViews = visible.reduce((sum, item) => sum + Number(item.views || 0), 0);
    const totalPoints = visible.reduce((sum, item) => sum + Number(item.points || 0), 0);
    const featured = available.length ? available.slice(0, 6) : visible.slice(0, 6);

    return {
      visible,
      available,
      owners,
      categories,
      cities,
      brands,
      totalViews,
      totalPoints,
      featured,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const source = community.featured;
    if (!q) return source;

    return source.filter((item) =>
      [item.title, item.brand, item.category, item.location, item.owner_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [community.featured, query]);

  return (
    <section className="section-space pt-5 md:pt-8">
      <div className="container-main">
        <div className="relative overflow-hidden rounded-[42px] bg-slate-950 p-7 text-white shadow-[0_34px_100px_rgba(15,23,42,0.22)] md:p-10">
          <div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_12%_14%,rgba(255,79,163,0.42),transparent_32%),radial-gradient(circle_at_78%_18%,rgba(16,185,129,0.20),transparent_28%),linear-gradient(135deg,rgba(10,10,25,0.98),rgba(20,18,40,0.82))]" />

          <div className="relative grid gap-9 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 font-black text-pink-100 backdrop-blur-xl">
                <Users size={17} />
                SwapWear Community
              </div>

              <h1 className="mt-5 max-w-4xl text-[clamp(46px,7vw,88px)] font-black leading-[0.92]">
                Real closets. Real swappers. Real deals.
              </h1>

              <p className="mt-5 max-w-2xl text-lg font-semibold leading-relaxed text-white/68">
                Discover what people are listing, where swap activity is growing, and which styles are moving through the marketplace.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/explore" className="button-primary h-13 px-6">
                  Browse Listings
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/swaps"
                  className="inline-flex h-13 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 font-black text-white backdrop-blur-xl transition hover:bg-white/15"
                >
                  <Repeat2 size={18} />
                  Swap Requests
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HeroStat icon={Users} label="Swappers" value={community.owners.size} />
              <HeroStat icon={HeartHandshake} label="Available" value={community.available.length} />
              <HeroStat icon={Eye} label="Views" value={community.totalViews} />
              <HeroStat icon={Sparkles} label="Points" value={community.totalPoints} />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="min-w-0">
            <div className="rounded-[34px] border border-white/60 bg-white/75 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur-2xl md:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-3xl font-black">Community Picks</h2>
                  <p className="mt-1 font-semibold text-slate-500">
                    Powered by uploaded marketplace products.
                  </p>
                </div>

                <div className="relative min-w-0 md:w-[330px]">
                  <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search community..."
                    className="h-13 w-full rounded-full border border-pink-100 bg-white/85 pl-12 pr-5 font-semibold outline-none transition focus:border-pink-300"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="mt-8 grid place-items-center rounded-[34px] bg-white/75 p-14">
                <Loader2 className="animate-spin text-pink-500" size={34} />
                <h3 className="mt-5 text-2xl font-black">Loading community...</h3>
              </div>
            ) : error ? (
              <div className="mt-8">
                <InlineError error={error} title="Unable to load community" onRetry={loadCommunity} />
              </div>
            ) : filteredItems.length === 0 ? (
              <EmptyCommunity />
            ) : (
              <div className="mt-8 grid gap-7 md:grid-cols-2 2xl:grid-cols-3">
                {filteredItems.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </main>

          <aside className="space-y-6">
            <SignalCard
              icon={Sparkles}
              title="Trending Categories"
              emptyText="Categories will appear after listings are uploaded."
              rows={community.categories}
            />
            <SignalCard
              icon={Star}
              title="Active Brands"
              emptyText="Brands will appear after products are listed."
              rows={community.brands}
            />
            <SignalCard
              icon={MapPin}
              title="Swap Cities"
              emptyText="Locations will appear after users add listings."
              rows={community.cities}
            />

            <div className="rounded-[34px] border border-pink-100 bg-white/80 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.07)]">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
                <MessageCircle size={24} />
              </div>
              <h3 className="mt-5 text-2xl font-black">Chat After Acceptance</h3>
              <p className="mt-2 font-semibold leading-relaxed text-slate-500">
                Swap chat unlocks around real swap requests, keeping negotiation tied to structured deals.
              </p>
              <Link to="/chat" className="mt-5 inline-flex font-black text-pink-500">
                Open messages
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function rankBy(items, key) {
  const counts = new Map();
  items.forEach((item) => {
    const label = String(item[key] || "").trim();
    if (!label) return;
    counts.set(label, (counts.get(label) || 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
}

function HeroStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
      <Icon size={22} className="text-pink-200" />
      <p className="mt-4 text-4xl font-black">{value}</p>
      <p className="mt-1 text-sm font-bold text-white/62">{label}</p>
    </div>
  );
}

function SignalCard({ icon: Icon, title, rows, emptyText }) {
  return (
    <div className="rounded-[34px] border border-white/60 bg-white/75 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
          <Icon size={21} />
        </div>
        <h3 className="text-xl font-black">{title}</h3>
      </div>

      <div className="mt-5 space-y-3">
        {rows.length === 0 ? (
          <p className="rounded-2xl bg-pink-50/70 p-4 text-sm font-bold text-slate-500">{emptyText}</p>
        ) : (
          rows.map((row) => (
            <Link
              key={row.label}
              to={`/explore?${title.includes("Categories") ? "category" : "q"}=${encodeURIComponent(row.label)}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white/75 px-4 py-3 font-black transition hover:bg-pink-50"
            >
              <span className="truncate">{row.label}</span>
              <span className="rounded-full bg-pink-50 px-3 py-1 text-xs text-pink-500">{row.count}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function EmptyCommunity() {
  return (
    <div className="mt-8 rounded-[38px] border border-pink-100 bg-white/85 p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-pink-50 text-pink-500">
        <Users size={38} />
      </div>
      <h2 className="mt-6 text-4xl font-black">Community is warming up</h2>
      <p className="mx-auto mt-3 max-w-xl font-semibold leading-relaxed text-slate-500">
        Upload listings or explore available products to start building marketplace activity.
      </p>
      <Link to="/add-listing" className="button-primary mt-8 h-13 px-7">
        Add Listing
      </Link>
    </div>
  );
}
