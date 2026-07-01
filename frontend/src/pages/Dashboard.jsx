import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
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
  Trash2,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import SectionTitle from "../components/common/SectionTitle";

import { getListings, deleteListing } from "../services/listings";

export default function Dashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!error) setProfile(data);
    }

    loadProfile();
  }, [user?.id]);

  useEffect(() => {
    async function loadListings() {
      if (!user?.id) {
        setListings([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const response = await getListings(user.id);

      if (response.success) {
        setListings(response.data || []);
      } else {
        console.error(response.error);
        setListings([]);
      }

      setLoading(false);
    }

    loadListings();
  }, [user?.id]);

  async function handleDelete(id) {
    const confirmDelete = window.confirm("Delete this listing?");
    if (!confirmDelete) return;

    setDeletingId(id);

    const response = await deleteListing(id);

    if (!response.success) {
      alert(response.error || "Unable to delete listing");
      setDeletingId(null);
      return;
    }

    setListings((prev) => prev.filter((item) => item.id !== id));
    setDeletingId(null);
  }

  const stats = useMemo(() => {
    const totalListings = listings.length;
    const totalViews = listings.reduce(
      (acc, item) => acc + Number(item.views || 0),
      0
    );

    return [
      {
        title: "Active Listings",
        value: totalListings,
        icon: Package,
        color: "bg-emerald-100 text-emerald-700",
      },
      {
        title: "Successful Swaps",
        value: Math.floor(totalListings / 2),
        icon: Repeat2,
        color: "bg-blue-100 text-blue-700",
      },
      {
        title: "Saved Items",
        value: totalListings * 2,
        icon: Heart,
        color: "bg-pink-100 text-pink-700",
      },
      {
        title: "Profile Views",
        value: totalViews,
        icon: TrendingUp,
        color: "bg-yellow-100 text-yellow-700",
      },
    ];
  }, [listings]);

  return (
    <section className="section-space pt-24 md:pt-28">
      <div className="container-main flex flex-col lg:flex-row gap-8 lg:gap-10">
        <Sidebar />

        <div className="flex-1 min-w-0">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
            <SectionTitle
              badge="User Dashboard"
              title={
                <>
                  Welcome back,
                  <br />
                  {userName}.
                </>
              }
              description="Manage your listings, swap activity, saved items, and sustainability impact from one clean dashboard."
            />

            <Link
              to="/add-listing"
              className="h-14 px-7 rounded-full bg-pink-400/40 backdrop-blur-xl border border-white/60 font-black flex items-center gap-2 hover:bg-pink-400/55 transition shadow-[0_12px_34px_rgba(255,105,180,0.20)] w-fit"
            >
              <Plus size={20} />
              Add Listing
            </Link>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 2xl:grid-cols-4 gap-5">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="bg-white/60 backdrop-blur-2xl rounded-[30px] border border-white/60 shadow-[0_18px_55px_rgba(15,23,42,0.07)] p-6"
                >
                  <div
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center ${stat.color}`}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-5 text-3xl md:text-4xl font-black">
                    {stat.value}
                  </h3>

                  <p className="mt-1 text-[var(--muted)] font-semibold">
                    {stat.title}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-[38px] bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_22px_70px_rgba(15,23,42,0.07)] p-7 md:p-9 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-pink-400 blur-3xl opacity-20" />

            <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-7">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-400/20 border border-white/60 font-black">
                  <Leaf size={18} />
                  Sustainability Impact
                </div>

                <h2 className="mt-5 text-3xl md:text-5xl font-black tracking-[-1px] leading-tight">
                  Your swaps helped reduce fashion waste.
                </h2>

                <p className="mt-3 text-[var(--muted)] text-base md:text-lg leading-relaxed">
                  Every exchange keeps wearable clothes in use and supports
                  sustainable fashion habits.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full xl:w-[320px]">
                <div className="rounded-[26px] bg-white/60 backdrop-blur-xl border border-white/60 p-5">
                  <h3 className="text-4xl md:text-5xl font-black">
                    {listings.length * 4}kg
                  </h3>

                  <p className="mt-2 text-[var(--muted)] font-semibold">
                    Waste saved
                  </p>
                </div>

                <div className="rounded-[26px] bg-white/60 backdrop-blur-xl border border-white/60 p-5">
                  <h3 className="text-4xl md:text-5xl font-black">
                    {listings.length}
                  </h3>

                  <p className="mt-2 text-[var(--muted)] font-semibold">
                    Items reused
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid 2xl:grid-cols-[1.35fr_0.65fr] gap-8">
            <div className="bg-white/60 backdrop-blur-2xl rounded-[38px] border border-white/60 shadow-[0_22px_70px_rgba(15,23,42,0.07)] overflow-hidden">
              <div className="p-6 md:p-7 border-b border-white/60 flex items-center justify-between gap-5">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black">
                    Your Listings
                  </h2>

                  <p className="mt-1 text-[var(--muted)] font-semibold">
                    Manage your uploaded fashion items.
                  </p>
                </div>

                <Link
                  to="/explore"
                  className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-xl border border-white/60 flex items-center justify-center hover:bg-pink-400/20 transition"
                >
                  <ArrowUpRight size={20} />
                </Link>
              </div>

              {loading ? (
                <div className="p-7 space-y-5">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-28 rounded-[28px] bg-white/45 animate-pulse"
                    />
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="p-10 text-center">
                  <h3 className="text-3xl font-black">No listings yet</h3>

                  <p className="mt-3 text-[var(--muted)] font-semibold">
                    Upload your first fashion item to start swapping.
                  </p>

                  <Link
                    to="/add-listing"
                    className="inline-flex mt-6 px-6 py-3 rounded-full bg-pink-400/35 border border-white/60 font-black"
                  >
                    Create Listing
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/60">
                  {listings.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-pink-50/35 transition"
                    >
                      <div className="flex items-center gap-4 md:gap-5 min-w-0">
                        <img
                          src={item.images?.[0] || item.image || "/icons.svg"}
                          alt={item.title || "Listing"}
                          onError={(e) => {
                            e.currentTarget.src = "/icons.svg";
                          }}
                          className="w-20 h-24 rounded-[22px] object-cover shadow-lg bg-white"
                        />

                        <div className="min-w-0">
                          <h3 className="text-lg md:text-xl font-black truncate">
                            {item.title || "Untitled Item"}
                          </h3>

                          <p className="mt-1 text-[var(--muted)] font-semibold">
                            {item.brand || "Brand"} • {item.points || 0} pts
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-black">
                              Active
                            </span>

                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/65 border border-white/60 text-sm font-black">
                              <Eye size={14} />
                              {item.views || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 md:shrink-0">
                        <Link
                          to={`/item/${item.id}`}
                          className="px-5 py-3 rounded-full bg-white/65 backdrop-blur-xl border border-white/60 font-black hover:bg-pink-400/20 transition"
                        >
                          View
                        </Link>

                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="px-5 py-3 rounded-full bg-red-100 text-red-600 font-black hover:bg-red-200 transition disabled:opacity-60 flex items-center gap-2"
                        >
                          <Trash2 size={17} />
                          {deletingId === item.id ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-white/60 backdrop-blur-2xl rounded-[38px] border border-white/60 shadow-[0_22px_70px_rgba(15,23,42,0.07)] p-7">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-pink-400/20 text-[var(--accent)] flex items-center justify-center">
                    <Clock3 size={24} />
                  </div>

                  <div>
                    <h2 className="text-3xl font-black">Activity</h2>
                    <p className="text-[var(--muted)] font-semibold">
                      Recent updates
                    </p>
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  {(listings.length
                    ? [
                        "New listing uploaded successfully",
                        "Marketplace profile updated",
                        "Listing visibility improved",
                        "Fashion discovery boosted",
                      ]
                    : [
                        "Create your first listing",
                        "Complete your profile",
                        "Add good product photos",
                        "Start your first swap",
                      ]
                  ).map((activity, index) => (
                    <div
                      key={activity}
                      className="rounded-[24px] bg-white/50 backdrop-blur-xl border border-white/60 p-5"
                    >
                      <p className="font-black leading-relaxed">{activity}</p>

                      <p className="mt-2 text-sm text-[var(--muted)] font-semibold">
                        {index + 1}h ago
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-pink-400/20 backdrop-blur-2xl rounded-[38px] border border-white/60 shadow-[0_22px_70px_rgba(255,105,180,0.10)] p-7">
                <div className="w-14 h-14 rounded-2xl bg-white/65 flex items-center justify-center">
                  <Sparkles size={24} />
                </div>

                <h3 className="mt-6 text-3xl font-black leading-tight">
                  Premium profile visibility enabled.
                </h3>

                <p className="mt-4 text-[var(--muted)] leading-relaxed">
                  Your listings will appear inside the fashion discovery section
                  when active.
                </p>

                <Link
                  to="/profile"
                  className="mt-6 h-14 px-6 rounded-full bg-white/65 backdrop-blur-xl border border-white/60 font-black hover:bg-white transition inline-flex items-center justify-center"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}