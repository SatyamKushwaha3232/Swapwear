import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Users,
  Shirt,
  Repeat2,
  AlertTriangle,
  Search,
  ShieldCheck,
  Ban,
  Eye,
  BarChart3,
  Sparkles,
  TrendingUp,
  Clock3,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  XCircle,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import SectionTitle from "../components/common/SectionTitle";
import { getOpenSwapDisputes, resolveSwapDispute } from "../services/swaps";

const users = [
  {
    id: 1,
    name: "Rohit Sharma",
    email: "rohit@gmail.com",
    status: "Active",
    swaps: 14,
  },
  {
    id: 2,
    name: "Sneha Patel",
    email: "sneha@gmail.com",
    status: "Reported",
    swaps: 8,
  },
  {
    id: 3,
    name: "Aman Verma",
    email: "aman@gmail.com",
    status: "Active",
    swaps: 21,
  },
  {
    id: 4,
    name: "Priya Mehta",
    email: "priya@gmail.com",
    status: "Active",
    swaps: 11,
  },
];

const stats = [
  {
    title: "Total Users",
    value: "12.4K",
    icon: Users,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Total Listings",
    value: "8.9K",
    icon: Shirt,
    color: "bg-[var(--green-soft)] text-[var(--green)]",
  },
  {
    title: "Successful Swaps",
    value: "4.2K",
    icon: Repeat2,
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    title: "Reports Pending",
    value: "32",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-600",
  },
];

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "Today";

function DisputeItemCard({ label, item }) {
  const imageUrl = item?.images?.[0] || item?.image || "";

  return (
    <div className="min-w-0 rounded-[26px] border border-white/60 bg-white/65 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-500">
        {label}
      </p>

      <div className="mt-3 flex min-w-0 items-center gap-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item?.title || label}
            className="h-20 w-20 shrink-0 rounded-[22px] object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-pink-100 to-violet-100 text-2xl font-black text-pink-500">
            {(item?.title || label || "S").charAt(0)}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="truncate text-xl font-black">
            {item?.title || "Swap item"}
          </h3>

          <p className="mt-1 truncate text-[var(--muted)] font-bold">
            {[item?.brand, item?.size].filter(Boolean).join(" / ") || "Details pending"}
          </p>

          <p className="mt-2 text-sm font-black text-pink-500">
            {item?.points || item?.price || 0} points
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminDisputeQueue({ disputes, loading, resolvingId, onResolve }) {
  return (
    <div className="mt-10 rounded-[42px] border border-white/55 bg-white/60 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:p-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-sm font-black text-pink-600">
            <AlertTriangle size={16} />
            Live Disputes
          </div>

          <h2 className="mt-4 text-3xl font-black md:text-4xl">
            Admin resolution queue.
          </h2>

          <p className="mt-2 max-w-3xl text-[var(--muted)] font-semibold leading-relaxed">
            Disputed swaps stay frozen until an admin continues the deal, cancels and relists items, or completes the exchange.
          </p>
        </div>

        <div className="rounded-full border border-white/60 bg-white/70 px-5 py-3 font-black shadow-sm">
          {loading ? "Checking..." : `${disputes.length} open`}
        </div>
      </div>

      <div className="mt-7 space-y-5">
        {loading ? (
          <div className="flex items-center gap-3 rounded-[30px] border border-white/60 bg-white/55 p-6 font-black text-[var(--muted)]">
            <Loader2 size={20} className="animate-spin text-pink-500" />
            Loading disputes...
          </div>
        ) : disputes.length === 0 ? (
          <div className="rounded-[30px] border border-white/60 bg-white/55 p-6">
            <h3 className="text-xl font-black">No open disputes</h3>
            <p className="mt-2 text-[var(--muted)] font-semibold">
              Marketplace is clean right now. New dispute reports will appear here.
            </p>
          </div>
        ) : (
          disputes.map((dispute) => {
            const swap = dispute.swap || {};
            const isResolving = resolvingId === dispute.id;

            return (
              <div
                key={dispute.id}
                className="rounded-[34px] border border-white/60 bg-white/70 p-5 shadow-[0_18px_52px_rgba(15,23,42,0.07)]"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-600">
                        Disputed
                      </span>
                      <span className="rounded-full bg-white/75 px-4 py-2 text-sm font-black text-[var(--muted)]">
                        {formatDate(dispute.created_at)}
                      </span>
                      <span className="rounded-full bg-white/75 px-4 py-2 text-sm font-black text-[var(--muted)]">
                        Swap #{String(swap.id || "").slice(0, 8)}
                      </span>
                    </div>

                    <h3 className="mt-4 text-2xl font-black">
                      {swap.requester_name || "Requester"} vs {swap.owner_name || "Owner"}
                    </h3>

                    <p className="mt-2 max-w-4xl text-[var(--muted)] font-semibold leading-relaxed">
                      {dispute.reason || "Swap issue reported"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                    <button
                      type="button"
                      disabled={isResolving}
                      onClick={() => onResolve(dispute, "continue")}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-50 px-5 font-black text-emerald-700 transition hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      <RefreshCcw size={18} />
                      Continue
                    </button>

                    <button
                      type="button"
                      disabled={isResolving}
                      onClick={() => onResolve(dispute, "cancel")}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red-50 px-5 font-black text-red-600 transition hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      <XCircle size={18} />
                      Cancel & Relist
                    </button>

                    <button
                      type="button"
                      disabled={isResolving}
                      onClick={() => onResolve(dispute, "complete")}
                      className="button-primary h-12 px-5 disabled:opacity-60"
                    >
                      {isResolving ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                      Complete
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_auto_1fr] xl:items-center">
                  <DisputeItemCard label={`${swap.requester_name || "Requester"}'s offer`} item={swap.requester_item} />
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-pink-500">
                    <Repeat2 size={20} />
                  </div>
                  <DisputeItemCard label={`${swap.owner_name || "Owner"}'s item`} item={swap.owner_item} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const [disputes, setDisputes] = useState([]);
  const [loadingDisputes, setLoadingDisputes] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  const loadDisputes = async () => {
    setLoadingDisputes(true);
    const response = await getOpenSwapDisputes();
    if (response.success) {
      setDisputes(response.data || []);
    } else {
      toast.error(response.error || "Unable to load disputes");
    }
    setLoadingDisputes(false);
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleResolveDispute = async (dispute, decision) => {
    const labels = {
      continue: "continue this swap",
      cancel: "cancel this swap and relist both items",
      complete: "force complete this swap",
    };

    const confirmed = window.confirm(`Admin decision: ${labels[decision]}?`);
    if (!confirmed) return;

    const note = window.prompt("Resolution note for history:", labels[decision]) || labels[decision];
    setResolvingId(dispute.id);

    const response = await resolveSwapDispute(dispute.id, decision, note);
    if (response.success) {
      toast.success("Dispute resolved");
      await loadDisputes();
    } else {
      toast.error(response.error || "Unable to resolve dispute");
    }

    setResolvingId(null);
  };

  return (
    <section className="section-space pt-28">
      <div className="container-main flex gap-10">
        <Sidebar />

        <div className="flex-1">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
            <SectionTitle
              badge="Admin Control"
              title={
                <>
                  Manage the
                  <br />
                  marketplace.
                </>
              }
              description="Monitor users, listings, reports, swap disputes, moderation queues, and platform analytics."
            />

            <button className="h-14 px-7 rounded-full bg-pink-400/35 backdrop-blur-xl border border-white/50 font-black flex items-center gap-2 hover:bg-pink-400/50 transition shadow-[0_12px_34px_rgba(255,105,180,0.20)] w-fit">
              <BarChart3 size={20} />
              Generate Report
            </button>
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

          <AdminDisputeQueue
            disputes={disputes}
            loading={loadingDisputes}
            resolvingId={resolvingId}
            onResolve={handleResolveDispute}
          />

          <div className="mt-10 bg-white/55 backdrop-blur-2xl rounded-[42px] border border-white/50 shadow-[0_24px_80px_rgba(15,23,42,0.08)] overflow-hidden">
            <div className="p-7 border-b border-white/50 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
              <div>
                <h2 className="text-3xl font-black">
                  User Management
                </h2>

                <p className="mt-2 text-[var(--muted)] font-semibold">
                  Review reports, suspicious activity and user trust.
                </p>
              </div>

              <div className="relative w-full xl:w-[380px]">
                <Search
                  size={18}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />

                <input
                  placeholder="Search users..."
                  className="w-full h-14 rounded-full bg-white/55 backdrop-blur-xl border border-white/50 pl-12 pr-5 outline-none focus:border-pink-300/40 transition"
                />
              </div>
            </div>

            <div className="divide-y divide-white/50">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-pink-50/25 transition"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative w-16 h-16 rounded-full bg-[var(--accent-soft)] border border-white/50">
                      <div className="absolute inset-2 rounded-full bg-pink-200"></div>
                    </div>

                    <div>
                      <h3 className="text-xl font-black">
                        {user.name}
                      </h3>

                      <p className="mt-1 text-[var(--muted)] font-semibold">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`px-4 py-2 rounded-full font-black text-sm ${
                        user.status === "Reported"
                          ? "bg-red-100 text-red-600"
                          : "bg-[var(--green-soft)] text-[var(--green)]"
                      }`}
                    >
                      {user.status}
                    </span>

                    <span className="px-4 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 font-black text-sm">
                      {user.swaps} swaps
                    </span>

                    <button className="w-11 h-11 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 flex items-center justify-center hover:bg-pink-400/20 transition">
                      <Eye size={18} />
                    </button>

                    <button className="w-11 h-11 rounded-full bg-[var(--green-soft)] text-[var(--green)] flex items-center justify-center">
                      <ShieldCheck size={18} />
                    </button>

                    <button className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                      <Ban size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid xl:grid-cols-[0.95fr_1.05fr] gap-8">
            <div className="bg-white/55 backdrop-blur-2xl rounded-[42px] border border-white/50 shadow-[0_24px_80px_rgba(15,23,42,0.08)] p-7">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <h2 className="text-3xl font-black">
                    Moderation Queue
                  </h2>

                  <p className="text-[var(--muted)] font-semibold">
                    Listings needing review
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  "Reported listing: Luxury Leather Jacket",
                  "User dispute: courier delay",
                  "Suspicious duplicate listing",
                  "Fake product image complaint",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[28px] bg-white/45 backdrop-blur-xl border border-white/50 p-5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-black leading-relaxed">
                        {item}
                      </p>

                      <p className="mt-2 text-sm text-[var(--muted)] font-semibold">
                        Requires admin verification
                      </p>
                    </div>

                    <button className="px-5 py-3 rounded-full bg-pink-400/35 backdrop-blur-xl border border-white/50 font-black hover:bg-pink-400/50 transition">
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[42px] bg-pink-400/18 backdrop-blur-2xl border border-white/50 shadow-[0_24px_80px_rgba(255,105,180,0.10)] p-7 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-pink-400 blur-3xl opacity-20"></div>

              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/55 border border-white/50 font-black">
                  <Sparkles size={16} />
                  Platform Health
                </div>

                <h2 className="mt-6 text-4xl md:text-5xl font-black tracking-[-2px] leading-tight">
                  Marketplace analytics overview.
                </h2>

                <p className="mt-4 text-[var(--muted)] text-lg leading-relaxed">
                  Live performance insights for moderation, trust,
                  sustainability and successful exchanges.
                </p>

                <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="rounded-[28px] bg-white/55 backdrop-blur-xl border border-white/50 p-5">
                    <h3 className="text-4xl font-black">98%</h3>

                    <p className="mt-2 text-[var(--muted)] font-semibold">
                      Safe listings
                    </p>
                  </div>

                  <div className="rounded-[28px] bg-white/55 backdrop-blur-xl border border-white/50 p-5">
                    <h3 className="text-4xl font-black">4.8</h3>

                    <p className="mt-2 text-[var(--muted)] font-semibold">
                      Trust score
                    </p>
                  </div>

                  <div className="rounded-[28px] bg-white/55 backdrop-blur-xl border border-white/50 p-5">
                    <h3 className="text-4xl font-black">72%</h3>

                    <p className="mt-2 text-[var(--muted)] font-semibold">
                      Swap success
                    </p>
                  </div>

                  <div className="rounded-[28px] bg-white/55 backdrop-blur-xl border border-white/50 p-5">
                    <h3 className="text-4xl font-black">24T</h3>

                    <p className="mt-2 text-[var(--muted)] font-semibold">
                      Waste saved
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-[30px] bg-white/55 backdrop-blur-xl border border-white/50 p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                    <TrendingUp size={22} />
                  </div>

                  <div>
                    <h3 className="font-black">
                      Growth increasing this month
                    </h3>

                    <p className="mt-2 text-[var(--muted)] leading-relaxed">
                      User engagement and successful fashion swaps are higher than previous month.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/55 border border-white/50 font-black">
                    <Clock3 size={16} />
                    Real-time moderation
                  </div>

                  <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/55 border border-white/50 font-black">
                    <ShieldCheck size={16} className="text-[var(--green)]" />
                    Verified marketplace
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
