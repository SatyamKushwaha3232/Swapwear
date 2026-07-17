import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

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
import InlineError from "../components/common/InlineError";
import ActionDialog from "../components/common/ActionDialog";

import { getListings, deleteListing } from "../services/listings";
import { getCurrentProfile } from "../services/profile";

export default function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id || "";

  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialogItem, setDeleteDialogItem] = useState(null);
  const [error, setError] = useState(null);

  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  useEffect(() => {
    async function loadProfile() {
      if (!userId) return;

      const response = await getCurrentProfile();
      if (response.success) setProfile(response.data);
    }

    loadProfile();
  }, [userId]);

  const loadListings = useCallback(async () => {
    if (!userId) {
      setListings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getListings(userId);

      if (response.success) {
        setListings(response.data || []);
      } else {
        setError(response.error || "Unable to load listings");
        setListings([]);
      }
    } catch (loadError) {
      setError(loadError);
      setListings([]);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  async function handleDelete(id) {
    setDeleteDialogItem(listings.find((item) => item.id === id) || { id });
  }

  async function confirmDelete() {
    const id = deleteDialogItem?.id;
    if (!id) return;

    setDeletingId(id);

    const response = await deleteListing(id);

    if (!response.success) {
      toast.error(response.error || "Unable to delete listing");
      setDeletingId(null);
      return;
    }

    setListings((prev) => prev.filter((item) => item.id !== id));
    setDeleteDialogItem(null);
    toast.success("Listing removed");
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
      <div className="container-main flex flex-col gap-8 lg:flex-row lg:gap-10">
        <Sidebar />

        <div className="flex-1 min-w-0">
          <div className="relative overflow-hidden rounded-[42px] bg-slate-950 p-7 text-white shadow-[0_38px_110px_rgba(15,23,42,0.24)] md:p-10">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1500&q=85"
              alt="Dashboard fashion workspace"
              className="absolute inset-0 h-full w-full object-cover opacity-28"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,79,163,0.32),transparent_32%),linear-gradient(90deg,rgba(7,7,25,0.96),rgba(7,7,25,0.68),rgba(7,7,25,0.30))]" />

            <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/12 px-5 py-2 font-black text-pink-200 backdrop-blur-xl">
                  <Sparkles size={16} />
                  User Dashboard
                </div>
                <h1 className="mt-5 max-w-4xl text-[clamp(42px,6vw,82px)] font-black leading-[0.9]">
                  Welcome back, {userName}.
                </h1>
                <p className="mt-5 max-w-2xl text-lg font-semibold leading-relaxed text-white/68">
                  Manage listings, swap activity, saved items, and sustainability
                  impact from one polished command center.
                </p>
              </div>

              <Link to="/add-listing" className="button-primary h-14 px-7">
                <Plus size={20} />
                Add Listing
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 2xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="premium-card interactive-lift rounded-[30px] p-6"
                >
                  <div
                    className={`flex h-13 w-13 items-center justify-center rounded-2xl shadow-sm ${stat.color}`}
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

          <div className="premium-surface relative mt-8 overflow-hidden rounded-[38px] p-7 md:p-9">
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(125deg,rgba(17,163,127,0.10),transparent_34%),linear-gradient(305deg,rgba(255,79,163,0.10),transparent_40%)]" />

            <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-7">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 font-black text-pink-500 shadow-sm backdrop-blur-xl">
                  <Leaf size={18} />
                  Sustainability Impact
                </div>

                <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
                  Your swaps helped reduce fashion waste.
                </h2>

                <p className="mt-3 text-[var(--muted)] text-base md:text-lg leading-relaxed">
                  Every exchange keeps wearable clothes in use and supports
                  sustainable fashion habits.
                </p>
              </div>

              <div className="grid w-full grid-cols-2 gap-4 xl:w-[320px]">
                <div className="premium-card rounded-[26px] p-5">
                  <h3 className="text-4xl font-black md:text-5xl">
                    {listings.length * 4}kg
                  </h3>

                  <p className="mt-2 text-[var(--muted)] font-semibold">
                    Waste saved
                  </p>
                </div>

                <div className="premium-card rounded-[26px] p-5">
                  <h3 className="text-4xl font-black md:text-5xl">
                    {listings.length}
                  </h3>

                  <p className="mt-2 text-[var(--muted)] font-semibold">
                    Items reused
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 2xl:grid-cols-[1.35fr_0.65fr]">
            <div className="premium-surface overflow-hidden rounded-[38px]">
              <div className="flex items-center justify-between gap-5 border-b border-white/60 p-6 md:p-7">
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
                  className="button-quiet h-12 min-h-0 w-12 rounded-full p-0"
                >
                  <ArrowUpRight size={20} />
                </Link>
              </div>

              {loading ? (
                <div className="p-7 space-y-5">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                          className="h-28 animate-pulse rounded-[28px] bg-white/45"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="p-6">
                  <InlineError error={error} title="Unable to load your listings" onRetry={loadListings} />
                </div>
              ) : listings.length === 0 ? (
                <div className="p-10 text-center">
                  <h3 className="text-3xl font-black">No listings yet</h3>

                  <p className="mt-3 text-[var(--muted)] font-semibold">
                    Upload your first fashion item to start swapping.
                  </p>

                  <Link
                    to="/add-listing"
                    className="button-primary mt-6 px-6 py-3"
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
                            {item.brand || "Brand"} - {item.points || 0} pts
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700">
                              Active
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/65 px-3 py-1 text-sm font-black">
                              <Eye size={14} />
                              {item.views || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 md:shrink-0">
                        <Link
                          to={`/item/${item.id}`}
                          className="button-quiet min-h-0 px-5 py-3"
                        >
                          View
                        </Link>

                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="flex items-center gap-2 rounded-full bg-red-100 px-5 py-3 font-black text-red-600 transition hover:bg-red-200 disabled:opacity-60"
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
              <div className="premium-surface rounded-[38px] p-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-400/20 text-[var(--accent)]">
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
                      className="premium-card rounded-[24px] p-5"
                    >
                      <p className="font-black leading-relaxed">{activity}</p>

                      <p className="mt-2 text-sm text-[var(--muted)] font-semibold">
                        {index + 1}h ago
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="premium-surface rounded-[38px] p-7">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/65">
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
                  className="button-quiet mt-6 h-14 px-6"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ActionDialog
        open={Boolean(deleteDialogItem)}
        title="Remove this listing?"
        text={`${
          deleteDialogItem?.title || "This item"
        } will be removed if it is still available. Reserved items are archived safely.`}
        tone="danger"
        confirmLabel="Remove Listing"
        loading={Boolean(deletingId)}
        onClose={() => setDeleteDialogItem(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
