import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  Package,
  Repeat2,
  Heart,
  TrendingUp,
  Plus,
  Clock3,
  Leaf,
  ArrowUpRight,
  Sparkles,
  Eye,
} from "lucide-react";

import { Link } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import SectionTitle from "../components/common/SectionTitle";

import { 
   getListings,
   deleteListing,

 } from "../services/listings";

export default function Dashboard() {
  const { user } = useAuth();
     const userName =
     user?.user_metadata?.full_name ||
     user?.email?.split("@")[0] ||
     "User";

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      setLoading(true);

      const response = await getListings(user?.id);

      if (response.success) {
        setListings(response.data);
      }

      setLoading(false);
    }

    loadListings();
  }, [user]);
  async function handleDelete(id) {
  const confirmDelete = window.confirm(
    "Delete this listing?"
  );

  if (!confirmDelete) return;

  const response = await deleteListing(id);

  if (!response.success) {
    alert(response.error);
    return;
  }

  setListings((prev) =>
    prev.filter((item) => item.id !== id)
  );
}

  const stats = useMemo(() => {
    const totalListings = listings.length;

    const totalViews = listings.reduce((acc, item) => {
      return acc + Number(item.views || 0);
    }, 0);

    return [
      {
        title: "Active Listings",
        value: totalListings,
        icon: Package,
        color: "bg-[var(--green-soft)] text-[var(--green)]",
      },
      {
        title: "Successful Swaps",
        value: Math.floor(totalListings / 2),
        icon: Repeat2,
        color: "bg-blue-100 text-blue-600",
      },
      {
        title: "Saved Items",
        value: totalListings * 2,
        icon: Heart,
        color: "bg-pink-100 text-pink-600",
      },
      {
        title: "Profile Views",
        value: totalViews || 0,
        icon: TrendingUp,
        color: "bg-yellow-100 text-yellow-700",
      },
    ];
  }, [listings]);

  return (
    <section className="section-space pt-28">
      <div className="container-main flex gap-10">
        <Sidebar />

        <div className="flex-1">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
            <SectionTitle
              badge="User Dashboard"
              title={
                <>
                  Welcome back,
                  <br />
                  {userName}.
                </>
              }
              description="Track your listings, swap requests, messages, sustainability impact, and premium marketplace activity from one dashboard."
            />

            <Link
              to="/add-listing"
              className="h-14 px-7 rounded-full bg-pink-400/35 backdrop-blur-xl border border-white/50 font-black flex items-center gap-2 hover:bg-pink-400/50 transition shadow-[0_12px_34px_rgba(255,105,180,0.20)] w-fit"
            >
              <Plus size={20} />
              Add Listing
            </Link>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 2xl:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="bg-white/55 backdrop-blur-2xl rounded-[34px] border border-white/50 shadow-[0_20px_70px_rgba(15,23,42,0.08)] p-6"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}
                  >
                    <Icon size={25} />
                  </div>

                  <h3 className="mt-6 text-4xl font-black">
                    {stat.value}
                  </h3>

                  <p className="mt-2 text-[var(--muted)] font-semibold">
                    {stat.title}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-[44px] bg-white/55 backdrop-blur-2xl border border-white/50 shadow-[0_24px_80px_rgba(15,23,42,0.08)] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-pink-400 blur-3xl opacity-20"></div>

            <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-400/20 border border-white/50 font-black">
                  <Leaf size={18} />
                  Sustainability Impact
                </div>

                <h2 className="mt-6 text-4xl md:text-5xl font-black tracking-[-1px] leading-tight">
                  Your swaps helped reduce fashion waste.
                </h2>

                <p className="mt-4 text-[var(--muted)] text-lg leading-relaxed">
                  Every successful exchange keeps wearable clothes in use,
                  reduces textile waste, and supports sustainable fashion habits.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 min-w-[320px]">
                <div className="rounded-[30px] bg-white/55 backdrop-blur-xl border border-white/50 p-5">
                  <h3 className="text-5xl font-black">
                    {listings.length * 4}kg
                  </h3>

                  <p className="mt-2 text-[var(--muted)] font-semibold">
                    Waste saved
                  </p>
                </div>

                <div className="rounded-[30px] bg-white/55 backdrop-blur-xl border border-white/50 p-5">
                  <h3 className="text-5xl font-black">
                    {listings.length}
                  </h3>

                  <p className="mt-2 text-[var(--muted)] font-semibold">
                    Items reused
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid 2xl:grid-cols-[1.35fr_0.65fr] gap-8">
            <div className="bg-white/55 backdrop-blur-2xl rounded-[42px] border border-white/50 shadow-[0_24px_80px_rgba(15,23,42,0.08)] overflow-hidden">
              <div className="p-7 border-b border-white/50 flex items-center justify-between gap-5">
                <div>
                  <h2 className="text-3xl font-black">
                    Your Listings
                  </h2>

                  <p className="mt-2 text-[var(--muted)] font-semibold">
                    Manage uploaded fashion items.
                  </p>
                </div>

                <button className="w-12 h-12 rounded-full bg-white/55 backdrop-blur-xl border border-white/50 flex items-center justify-center hover:bg-pink-400/20 transition">
                  <ArrowUpRight size={20} />
                </button>
              </div>

              {loading ? (
                <div className="p-7 space-y-5">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-28 rounded-[30px] bg-white/40 animate-pulse"
                    />
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="p-10 text-center">
                  <h3 className="text-3xl font-black">
                    No listings yet
                  </h3>

                  <p className="mt-3 text-[var(--muted)] font-semibold">
                    Upload your first fashion item to start swapping.
                  </p>

                  <Link
                    to="/add-listing"
                    className="inline-flex mt-6 px-6 py-3 rounded-full bg-pink-400/30 border border-white/50 font-black"
                  >
                    Create Listing
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/50">
                  {listings.map((item) => (
                    <div
                      key={item.id}
                      className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-pink-50/30 transition"
                    >
                      <div className="flex items-center gap-5">
                        <img
                          src={item.images?.[0] || item.image}
                          alt={item.title}
                          className="w-20 h-24 rounded-[24px] object-cover shadow-lg"
                        />

                        <div>
                          <h3 className="text-xl font-black">
                            {item.title}
                          </h3>

                          <p className="mt-1 text-[var(--muted)] font-semibold">
                            {item.brand} • {item.points} pts
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex px-3 py-1 rounded-full bg-[var(--green-soft)] text-[var(--green)] text-sm font-black">
                              Active
                            </span>

                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/60 border border-white/50 text-sm font-black">
                              <Eye size={14} />
                              {item.views}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link
                          to={`/item/${item.id}`}
                          className="px-5 py-3 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 font-black hover:bg-pink-400/20 transition"
                        >
                          View
                        </Link>

                       <button
                          onClick={() => handleDelete(item.id)}
                          className="px-5 py-3 rounded-full bg-red-100 text-red-600 font-black hover:bg-red-200 transition"
                        >
                           Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-white/55 backdrop-blur-2xl rounded-[42px] border border-white/50 shadow-[0_24px_80px_rgba(15,23,42,0.08)] p-7">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-pink-400/20 text-[var(--accent)] flex items-center justify-center">
                    <Clock3 size={24} />
                  </div>

                  <div>
                    <h2 className="text-3xl font-black">
                      Activity
                    </h2>

                    <p className="text-[var(--muted)] font-semibold">
                      Recent updates
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {[
                    "New listing uploaded successfully",
                    "Premium visibility increased",
                    "Marketplace profile updated",
                    "Fashion discovery boosted",
                  ].map((activity, index) => (
                    <div
                      key={activity}
                      className="rounded-[28px] bg-white/45 backdrop-blur-xl border border-white/50 p-5"
                    >
                      <p className="font-black leading-relaxed">
                        {activity}
                      </p>

                      <p className="mt-2 text-sm text-[var(--muted)] font-semibold">
                        {index + 1}h ago
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-pink-400/20 backdrop-blur-2xl rounded-[42px] border border-white/50 shadow-[0_24px_80px_rgba(255,105,180,0.10)] p-7">
                <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center">
                  <Sparkles size={24} />
                </div>

                <h3 className="mt-6 text-3xl font-black leading-tight">
                  Premium profile visibility enabled.
                </h3>

                <p className="mt-4 text-[var(--muted)] leading-relaxed">
                  Your listings are getting more exposure inside the premium fashion discovery section.
                </p>

                <button className="mt-6 h-14 px-6 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 font-black hover:bg-white transition">
                  View Insights
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}