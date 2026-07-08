import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Clock3,
  MessageCircle,
  Repeat2,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import useDevice from "../hooks/useDevice";
import {
  acceptSwap,
  cancelSwap,
  completeSwap,
  deleteCompletedSwapItems,
  getMySwaps,
  rejectSwap,
} from "../services/swaps";
import { getOrCreateConversation } from "../services/chat";

const tabs = ["all", "incoming", "outgoing", "pending", "accepted", "completed"];

export default function SwapRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDesktop, isTablet } = useDevice();

  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

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

  async function handleOpenChat(swap) {
    if (!user?.id) {
      toast.error("Please login first");
      return;
    }

    const response = await getOrCreateConversation({
      swapId: swap.id,
      user1Id: swap.requester_id,
      user2Id: swap.owner_id,
    });

    if (!response.success) {
      toast.error(response.error || "Unable to open chat");
      return;
    }

    navigate(`/chat/${response.data.id}`);
  }

  const stats = useMemo(() => {
    return {
      total: swaps.length,
      incoming: swaps.filter((s) => String(s.owner_id) === String(user?.id)).length,
      outgoing: swaps.filter((s) => String(s.requester_id) === String(user?.id)).length,
      pending: swaps.filter((s) => normalizeStatus(s.status) === "pending").length,
      accepted: swaps.filter((s) => normalizeStatus(s.status) === "accepted").length,
      completed: swaps.filter((s) => normalizeStatus(s.status) === "completed").length,
    };
  }, [swaps, user?.id]);

  const filteredSwaps = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return swaps.filter((swap) => {
      const status = normalizeStatus(swap.status);
      const direction = String(swap.owner_id) === String(user?.id) ? "incoming" : "outgoing";

      if (tab === "incoming" && direction !== "incoming") return false;
      if (tab === "outgoing" && direction !== "outgoing") return false;
      if (!["all", "incoming", "outgoing"].includes(tab) && status !== tab) return false;

      if (!cleanQuery) return true;

      return [
        swap.requester_name,
        swap.owner_name,
        swap.requester_item?.title,
        swap.requester_item?.brand,
        swap.owner_item?.title,
        swap.owner_item?.brand,
        swap.message,
        status,
        direction,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(cleanQuery);
    });
  }, [query, swaps, tab, user?.id]);

  const commonProps = {
    swaps: filteredSwaps,
    totalSwaps: swaps.length,
    stats,
    loading,
    tab,
    query,
    userId: user?.id,
    updatingId,
    onTabChange: setTab,
    onQueryChange: setQuery,
    onOpenChat: handleOpenChat,
    onAccept: (swap) => handleAction(swap.id, acceptSwap, "Swap accepted"),
    onReject: (swap) => handleAction(swap.id, rejectSwap, "Swap rejected"),
    onCancel: (swap) => handleAction(swap.id, cancelSwap, "Swap cancelled"),
    onComplete: (swap) => handleAction(swap.id, completeSwap, "Swap completed"),
    onDeleteCompletedItems: (swap) =>
      handleAction(swap.id, deleteCompletedSwapItems, "Completed swap items deleted"),
  };

  if (isDesktop) return <SwapDesktop {...commonProps} />;
  if (isTablet) return <SwapTablet {...commonProps} />;
  return <SwapMobile {...commonProps} />;
}

function SwapDesktop(props) {
  const { swaps, loading } = props;

  return (
    <section className="min-h-[calc(100vh-90px)] px-5 py-6">
      <div className="mx-auto grid max-w-[1500px] grid-cols-[360px_minmax(0,1fr)] gap-6">
        <aside className="sticky top-24 h-[calc(100vh-120px)] overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
          <SwapSidebar {...props} />
        </aside>

        <main className="min-w-0">
          <SwapHero compact={false} {...props} />
          <div className="mt-5 grid gap-5">
            {loading ? <LoadingState /> : swaps.length === 0 ? <EmptyState /> : swaps.map((swap) => <SwapCard key={swap.id} swap={swap} {...props} />)}
          </div>
        </main>
      </div>
    </section>
  );
}

function SwapTablet(props) {
  const { swaps, loading } = props;

  return (
    <section className="min-h-[calc(100vh-90px)] px-4 py-5">
      <div className="container-main">
        <SwapHero compact {...props} />
        <div className="mt-5 rounded-[30px] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <SearchAndTabs {...props} />
        </div>
        <div className="mt-5 grid gap-4">
          {loading ? <LoadingState /> : swaps.length === 0 ? <EmptyState /> : swaps.map((swap) => <SwapCard key={swap.id} swap={swap} compact {...props} />)}
        </div>
      </div>
    </section>
  );
}

function SwapMobile(props) {
  const { swaps, loading, stats } = props;

  return (
    <section className="min-h-screen bg-[#fff7fb] pb-6">
      <div className="sticky top-0 z-20 border-b border-pink-100 bg-white/95 px-4 py-4 backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-pink-500">
          <Sparkles size={14} />
          Swap Center
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-[-1px]">Requests</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          {stats.pending} pending, {stats.accepted} accepted
        </p>
        <div className="mt-4">
          <SearchAndTabs {...props} mobile />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-4">
        <MobileStat label="In" value={stats.incoming} />
        <MobileStat label="Out" value={stats.outgoing} />
        <MobileStat label="Done" value={stats.completed} />
      </div>

      <div className="grid gap-4 px-4">
        {loading ? <LoadingState /> : swaps.length === 0 ? <EmptyState /> : swaps.map((swap) => <SwapCard key={swap.id} swap={swap} mobile {...props} />)}
      </div>
    </section>
  );
}

function SwapHero({ stats, compact }) {
  return (
    <div className="rounded-[34px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:p-7">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-5 py-2 text-sm font-black text-pink-500">
            <Repeat2 size={17} />
            Swap Center
          </div>
          <h1 className={`${compact ? "mt-4 text-4xl" : "mt-5 text-6xl"} max-w-3xl font-black leading-[0.95] tracking-[-2px]`}>
            Manage your swap requests.
          </h1>
          <p className="mt-4 max-w-2xl font-semibold leading-relaxed text-slate-500">
            Review offers, open chats after acceptance, and complete successful exchanges.
          </p>
        </div>

        <div className="grid min-w-[280px] grid-cols-2 gap-3">
          <Stat label="Total" value={stats.total} />
          <Stat label="Pending" value={stats.pending} />
          <Stat label="Accepted" value={stats.accepted} />
          <Stat label="Completed" value={stats.completed} />
        </div>
      </div>
    </div>
  );
}

function SwapSidebar(props) {
  const { stats } = props;

  return (
    <div className="flex h-full flex-col p-5">
      <div className="rounded-[26px] bg-gradient-to-r from-pink-500 to-fuchsia-500 p-5 text-white">
        <ShieldCheck size={26} />
        <h2 className="mt-4 text-2xl font-black">Swap workflow</h2>
        <p className="mt-2 text-sm font-semibold text-white/80">
          Accept only when item details and meeting plan feel clear.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Incoming" value={stats.incoming} />
        <Stat label="Outgoing" value={stats.outgoing} />
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
        <SearchAndTabs {...props} vertical />
      </div>
    </div>
  );
}

function SearchAndTabs({ tab, query, onTabChange, onQueryChange, vertical = false, mobile = false }) {
  return (
    <div>
      <div className="flex h-12 items-center rounded-full bg-pink-50 px-4">
        <Search size={18} className="shrink-0 text-pink-500" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search swaps..."
          className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold outline-none placeholder:text-slate-400"
        />
      </div>

      <div className={`${vertical ? "mt-4 grid gap-2" : "mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar"}`}>
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onTabChange(item)}
            className={`${vertical ? "w-full" : "shrink-0"} ${mobile ? "px-4 py-2.5 text-xs" : "px-5 py-3 text-sm"} rounded-full font-black capitalize transition ${
              tab === item
                ? "bg-pink-500 text-white shadow-[0_14px_34px_rgba(255,79,163,0.24)]"
                : "bg-white text-slate-600 hover:bg-pink-50"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function SwapCard(props) {
  const {
    swap,
    userId,
    updatingId,
    onOpenChat,
    onAccept,
    onReject,
    onCancel,
    onComplete,
    onDeleteCompletedItems,
    compact,
    mobile,
  } = props;

  const isOwner = String(swap.owner_id) === String(userId);
  const isRequester = String(swap.requester_id) === String(userId);
  const status = normalizeStatus(swap.status);
  const updating = updatingId === swap.id;

  return (
    <article className="overflow-hidden rounded-[30px] border border-pink-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 p-4 md:p-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <StatusBadge status={status} />
              <p className="mt-2 text-sm font-bold text-slate-500">
                {isOwner ? "Incoming request" : "Outgoing request"}
              </p>
            </div>
            <p className="text-xs font-bold text-slate-400">
              {formatDate(swap.created_at)}
            </p>
          </div>

          <div className={`${mobile || compact ? "grid gap-3" : "mt-5 grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center"} mt-5`}>
            <SwapItem label={isRequester ? "Your offer" : `${swap.requester_name}'s offer`} item={swap.requester_item} />
            <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-500 md:h-14 md:w-14">
              <Repeat2 size={22} />
            </div>
            <SwapItem label={isOwner ? "Your item" : `${swap.owner_name}'s item`} item={swap.owner_item} />
          </div>

          {swap.message && (
            <div className="mt-4 rounded-[22px] bg-pink-50/70 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-pink-500">Message</p>
              <p className="mt-2 break-words font-semibold text-slate-600">{swap.message}</p>
            </div>
          )}

          {!mobile && <SwapTimeline status={status} />}
        </div>

        <SwapActions
          status={status}
          isOwner={isOwner}
          isRequester={isRequester}
          updating={updating}
          onOpenChat={() => onOpenChat(swap)}
          onAccept={() => onAccept(swap)}
          onReject={() => onReject(swap)}
          onCancel={() => onCancel(swap)}
          onComplete={() => onComplete(swap)}
          onDeleteCompletedItems={() => onDeleteCompletedItems(swap)}
          itemsDeleted={Boolean(swap.items_deleted_at)}
        />
      </div>
    </article>
  );
}

function SwapActions({
  status,
  isOwner,
  isRequester,
  updating,
  itemsDeleted,
  onOpenChat,
  onAccept,
  onReject,
  onCancel,
  onComplete,
  onDeleteCompletedItems,
}) {
  return (
    <div className="w-full shrink-0 xl:w-[230px]">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {status === "pending" && isOwner && (
          <>
            <ActionButton disabled={updating} onClick={onAccept}>Accept</ActionButton>
            <ActionButton variant="danger" disabled={updating} onClick={onReject}>Reject</ActionButton>
          </>
        )}

        {status === "pending" && isRequester && (
          <ActionButton variant="danger" disabled={updating} onClick={onCancel}>Cancel Request</ActionButton>
        )}

        {status === "accepted" && (
          <>
            <button
              type="button"
              onClick={onOpenChat}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-pink-500 font-black text-white transition hover:bg-pink-600"
            >
              <MessageCircle size={17} />
              Open Chat
            </button>
            <ActionButton disabled={updating} onClick={onComplete}>Mark Completed</ActionButton>
          </>
        )}

        {status === "completed" && !itemsDeleted && (
          <ActionButton variant="danger" disabled={updating} onClick={onDeleteCompletedItems}>
            Delete Swapped Items
          </ActionButton>
        )}

        {status === "completed" && itemsDeleted && (
          <div className="rounded-[20px] bg-slate-50 px-4 py-3 text-center text-sm font-black text-slate-500">
            Items deleted
          </div>
        )}

        {!["pending", "accepted", "completed"].includes(status) && (
          <div className="rounded-[20px] bg-slate-50 px-4 py-3 text-center text-sm font-black text-slate-500">
            No action needed
          </div>
        )}
      </div>
    </div>
  );
}

function SwapItem({ label, item }) {
  const image = item?.image || (Array.isArray(item?.images) ? item.images[0] : "") || "/icons.svg";

  return (
    <div className="min-w-0 rounded-[24px] bg-pink-50/60 p-4">
      <p className="mb-3 truncate text-xs font-black uppercase tracking-widest text-pink-500">{label}</p>
      <div className="flex min-w-0 items-center gap-4">
        <img
          src={image}
          alt={item?.title || "Swap item"}
          onError={(e) => {
            e.currentTarget.src = "/icons.svg";
          }}
          className="h-20 w-20 shrink-0 rounded-[18px] object-cover"
        />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black">{item?.title || "Untitled Item"}</h3>
          <p className="mt-1 truncate text-sm font-bold text-slate-500">
            {item?.brand || "Brand"} / {item?.size || "Free"}
          </p>
          <p className="mt-2 truncate text-sm font-black text-pink-500">{item?.points || 0} points</p>
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
  const activeIndex = status === "completed" ? 2 : status === "accepted" ? 1 : status === "pending" ? 0 : -1;

  return (
    <div className="mt-5 rounded-[24px] border border-pink-50 bg-white p-4">
      <div className="grid grid-cols-3 gap-3">
        {steps.map((step, index) => (
          <div key={step.key} className="min-w-0 text-center">
            <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${index <= activeIndex ? "bg-pink-500 text-white" : "bg-slate-100 text-slate-400"}`}>
              <CheckCircle2 size={17} />
            </div>
            <p className="mt-2 truncate text-xs font-black text-slate-500">{step.label}</p>
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
    <div className={`inline-flex w-fit items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black ${cls}`}>
      <Icon size={17} />
      {label}
    </div>
  );
}

function ActionButton({ children, onClick, disabled, variant = "primary" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-11 rounded-full px-4 font-black transition disabled:opacity-60 ${
        variant === "danger" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-slate-950 text-white hover:bg-pink-500"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/70 p-4">
      <p className="text-xs font-black text-slate-500">{label}</p>
      <h3 className="mt-1 text-3xl font-black text-pink-500">{value}</h3>
    </div>
  );
}

function MobileStat({ label, value }) {
  return (
    <div className="rounded-[22px] bg-white p-4 text-center shadow-sm">
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
      <h3 className="mt-1 text-2xl font-black text-pink-500">{value}</h3>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[30px] bg-white p-10 text-center shadow-lg">
      <h2 className="text-3xl font-black">No swap requests</h2>
      <p className="mt-3 font-semibold text-slate-500">Try another filter or request swaps from item details pages.</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[30px] bg-white p-10 text-center shadow-lg">
      <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-pink-100" />
      <p className="mt-4 font-black">Loading swaps...</p>
    </div>
  );
}

function normalizeStatus(status) {
  return String(status || "pending").toLowerCase();
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}