import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Clock3,
  MessageCircle,
  Repeat2,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  acceptSwap,
  cancelSwap,
  completeSwap,
  getMySwaps,
  rejectSwap,
} from "../services/swaps";

const tabs = ["all", "incoming", "outgoing", "pending", "accepted", "completed"];

export default function SwapRequests() {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    loadSwaps();
  }, [user?.id]);

  async function loadSwaps() {
    if (!user?.id) return;

    setLoading(true);
    const response = await getMySwaps(user.id);

    if (response.success) setSwaps(response.data || []);
    else toast.error(response.error || "Unable to load swaps");

    setLoading(false);
  }

  async function handleAction(id, actionFn, message) {
    setUpdatingId(id);

    const response = await actionFn(id);

    if (response.success) {
      toast.success(message);
      await loadSwaps();
    } else {
      toast.error(response.error || "Action failed");
    }

    setUpdatingId(null);
  }

  const filteredSwaps = useMemo(() => {
    if (tab === "all") return swaps;

    if (tab === "incoming") {
      return swaps.filter((swap) => String(swap.owner_id) === String(user?.id));
    }

    if (tab === "outgoing") {
      return swaps.filter(
        (swap) => String(swap.requester_id) === String(user?.id)
      );
    }

    return swaps.filter((swap) => swap.status === tab);
  }, [swaps, tab, user?.id]);

  const stats = {
    total: swaps.length,
    incoming: swaps.filter((s) => String(s.owner_id) === String(user?.id)).length,
    outgoing: swaps.filter((s) => String(s.requester_id) === String(user?.id))
      .length,
    pending: swaps.filter((s) => s.status === "pending").length,
  };

  return (
    <section className="section-space pt-6">
      <div className="container-main">
        <div className="rounded-[38px] border border-white/70 bg-white/75 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:p-9">
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-5 py-2 font-black text-pink-500">
            <Sparkles size={17} />
            Swap Center
          </div>

          <h1 className="mt-5 text-[clamp(42px,6vw,76px)] font-black leading-[0.96] tracking-[-3px]">
            Manage your swap requests.
          </h1>

          <p className="mt-5 max-w-3xl font-semibold leading-relaxed text-[var(--muted)] md:text-lg">
            Track incoming and outgoing requests, accept good offers, reject
            unsuitable ones, and complete successful exchanges.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Total" value={stats.total} />
            <Stat label="Incoming" value={stats.incoming} />
            <Stat label="Outgoing" value={stats.outgoing} />
            <Stat label="Pending" value={stats.pending} />
          </div>
        </div>

        <div className="mt-7 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`shrink-0 rounded-full px-5 py-3 font-black capitalize transition ${
                tab === item
                  ? "bg-pink-500 text-white shadow-[0_14px_34px_rgba(255,79,163,0.28)]"
                  : "bg-white text-slate-700 hover:bg-pink-50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5">
          {loading ? (
            <LoadingState />
          ) : filteredSwaps.length === 0 ? (
            <EmptyState />
          ) : (
            filteredSwaps.map((swap) => (
              <SwapCard
                key={swap.id}
                swap={swap}
                userId={user.id}
                updating={updatingId === swap.id}
                onAccept={() =>
                  handleAction(swap.id, acceptSwap, "Swap accepted")
                }
                onReject={() =>
                  handleAction(swap.id, rejectSwap, "Swap rejected")
                }
                onCancel={() =>
                  handleAction(swap.id, cancelSwap, "Swap cancelled")
                }
                onComplete={() =>
                  handleAction(swap.id, completeSwap, "Swap completed")
                }
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function SwapCard({
  swap,
  userId,
  updating,
  onAccept,
  onReject,
  onCancel,
  onComplete,
}) {
  const isOwner = String(swap.owner_id) === String(userId);
  const isRequester = String(swap.requester_id) === String(userId);

  return (
    <article className="rounded-[34px] border border-pink-100 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <StatusBadge status={swap.status} />
              <p className="mt-2 text-sm font-bold text-slate-500">
                {isOwner ? "Incoming request" : "Outgoing request"}
              </p>
            </div>

            <p className="text-sm font-bold text-slate-400">
              {new Date(swap.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="grid min-w-0 gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <SwapItem
              label={isRequester ? "Your offer" : `${swap.requester_name}'s offer`}
              item={swap.requester_item}
            />

            <div className="mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-500">
              <Repeat2 size={24} />
            </div>

            <SwapItem
              label={isOwner ? "Your item" : `${swap.owner_name}'s item`}
              item={swap.owner_item}
            />
          </div>

          {swap.message && (
            <div className="mt-5 rounded-[24px] bg-pink-50/70 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-pink-500">
                Message
              </p>
              <p className="mt-2 font-semibold text-slate-600">
                {swap.message}
              </p>
            </div>
          )}

          <SwapTimeline status={swap.status} />
        </div>

        <div className="w-full shrink-0 xl:w-[230px]">
          <div className="grid gap-2">
            {swap.status === "pending" && isOwner && (
              <>
                <ActionButton disabled={updating} onClick={onAccept}>
                  Accept
                </ActionButton>
                <ActionButton variant="danger" disabled={updating} onClick={onReject}>
                  Reject
                </ActionButton>
              </>
            )}

            {swap.status === "pending" && isRequester && (
              <ActionButton variant="danger" disabled={updating} onClick={onCancel}>
                Cancel Request
              </ActionButton>
            )}

            {swap.status === "accepted" && (
              <>
                <Link
                  to="/chat"
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-pink-500 font-black text-white hover:bg-pink-600"
                >
                  <MessageCircle size={17} />
                  Open Chat
                </Link>

                <ActionButton disabled={updating} onClick={onComplete}>
                  Mark Completed
                </ActionButton>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function SwapItem({ label, item }) {
  const image =
    item?.image ||
    (Array.isArray(item?.images) ? item.images[0] : "") ||
    "/icons.svg";

  return (
    <div className="min-w-0 rounded-[26px] bg-pink-50/60 p-4">
      <p className="mb-3 truncate text-xs font-black uppercase tracking-widest text-pink-500">
        {label}
      </p>

      <div className="flex min-w-0 items-center gap-4">
        <img
          src={image}
          alt={item?.title || "Swap item"}
          onError={(e) => {
            e.currentTarget.src = "/icons.svg";
          }}
          className="h-20 w-20 shrink-0 rounded-[20px] object-cover"
        />

        <div className="min-w-0">
          <h3 className="truncate text-lg font-black">
            {item?.title || "Untitled Item"}
          </h3>
          <p className="mt-1 truncate text-sm font-bold text-slate-500">
            {item?.brand || "Brand"} • {item?.size || "Free"}
          </p>
          <p className="mt-2 truncate text-sm font-black text-pink-500">
            {item?.points || 0} points
          </p>
        </div>
      </div>
    </div>
  );
}

function SwapTimeline({ status }) {
  const steps = [
    { key: "pending", label: "Requested" },
    { key: "accepted", label: "Accepted" },
    { key: "completed", label: "Completed" },
  ];

  const activeIndex =
    status === "completed" ? 2 : status === "accepted" ? 1 : status === "pending" ? 0 : -1;

  return (
    <div className="mt-5 rounded-[24px] border border-pink-50 bg-white p-4">
      <div className="grid grid-cols-3 gap-3">
        {steps.map((step, index) => (
          <div key={step.key} className="min-w-0 text-center">
            <div
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${
                index <= activeIndex
                  ? "bg-pink-500 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <CheckCircle2 size={17} />
            </div>

            <p className="mt-2 truncate text-xs font-black text-slate-500">
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: ["Pending", Clock3, "bg-yellow-50 text-yellow-700"],
    accepted: ["Accepted", CheckCircle2, "bg-emerald-50 text-emerald-700"],
    rejected: ["Rejected", XCircle, "bg-red-50 text-red-700"],
    cancelled: ["Cancelled", RotateCcw, "bg-slate-100 text-slate-700"],
    completed: ["Completed", CheckCircle2, "bg-pink-50 text-pink-600"],
  };

  const [label, Icon, cls] = map[status] || map.pending;

  return (
    <div
      className={`inline-flex w-fit items-center justify-center gap-2 rounded-full px-5 py-3 font-black ${cls}`}
    >
      <Icon size={18} />
      {label}
    </div>
  );
}

function ActionButton({ children, onClick, disabled, variant = "primary" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-11 rounded-full font-black transition disabled:opacity-60 ${
        variant === "danger"
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-slate-950 text-white hover:bg-pink-500"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-[26px] border border-white/70 bg-white/70 p-5">
      <p className="text-sm font-black text-[var(--muted)]">{label}</p>
      <h3 className="mt-2 text-4xl font-black text-pink-500">{value}</h3>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[34px] bg-white p-10 text-center shadow-lg">
      <h2 className="text-3xl font-black">No swap requests yet</h2>
      <p className="mt-3 font-semibold text-[var(--muted)]">
        Request swaps from item details pages.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[34px] bg-white p-10 text-center shadow-lg">
      <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-pink-100" />
      <p className="mt-4 font-black">Loading swaps...</p>
    </div>
  );
}