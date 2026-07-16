import { useCallback, useEffect, useMemo, useState } from "react";
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
  confirmSwapHandover,
  confirmSwapReceived,
  completeSwap,
  deleteCompletedSwapItems,
  getMySwaps,
  rejectSwap,
  setSwapDeliveryMethod,
} from "../services/swaps";
import { getOrCreateConversation } from "../services/chat";
import ActionDialog from "../components/common/ActionDialog";

const tabs = [
  "all",
  "incoming",
  "outgoing",
  "pending",
  "accepted",
  "shipped",
  "delivered",
  "completed",
  "expired",
  "cancelled",
];

export default function SwapRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDesktop, isTablet } = useDevice();

  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState(null);

  const loadSwaps = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    const response = await getMySwaps(user.id);

    if (response.success) setSwaps(response.data || []);
    else toast.error(response.error || "Unable to load swaps");

    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadSwaps();
  }, [loadSwaps]);

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

  function askAction(config) {
    setDialog(config);
  }

  async function confirmDialog(values) {
    const next = dialog;
    setDialog(null);
    await next?.onConfirm?.(values);
  }

  const stats = useMemo(() => {
    return {
      total: swaps.length,
      incoming: swaps.filter((s) => String(s.owner_id) === String(user?.id)).length,
      outgoing: swaps.filter((s) => String(s.requester_id) === String(user?.id)).length,
      pending: swaps.filter((s) => normalizeStatus(s.status) === "pending").length,
      accepted: swaps.filter((s) => normalizeStatus(s.status) === "accepted").length,
      shipped: swaps.filter((s) => normalizeStatus(s.status) === "shipped").length,
      delivered: swaps.filter((s) => normalizeStatus(s.status) === "delivered").length,
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
    onOpenDeal: (swap) => navigate(`/swaps/${swap.id}`),
    onOpenChat: handleOpenChat,
    onAccept: (swap) =>
      askAction({
        title: "Accept and lock swap?",
        text: "Both products will be reserved and competing pending requests for these items will expire.",
        confirmLabel: "Accept Swap",
        onConfirm: () => handleAction(swap.id, acceptSwap, "Swap accepted"),
      }),
    onReject: (swap) => handleAction(swap.id, rejectSwap, "Swap rejected"),
    onSetDeliveryMethod: (swap, method) =>
      handleAction(
        swap.id,
        (id) => setSwapDeliveryMethod(id, method),
        method === "courier" ? "Courier selected" : "Local meetup selected"
      ),
    onConfirmHandover: (swap) => {
      const method = swap.delivery_method === "courier" ? "shipping" : "handover";
      askAction({
        title: `Confirm ${method}?`,
        text: "Only confirm after your item is shipped or handed over.",
        confirmLabel: "Confirm",
        onConfirm: () =>
          handleAction(swap.id, confirmSwapHandover, "Your handover is confirmed"),
      });
    },
    onConfirmReceived: (swap) =>
      askAction({
        title: "Received the item?",
        text: "Confirm only after checking the other user's item.",
        confirmLabel: "I Received It",
        onConfirm: () => handleAction(swap.id, confirmSwapReceived, "Receipt confirmed"),
      }),
    onCancel: (swap) => {
      const status = normalizeStatus(swap.status);
      if (!["accepted", "completed"].includes(status)) {
        handleAction(
          swap.id,
          cancelSwap,
          status === "completed" ? "Swap cancelled and products relisted" : "Swap cancelled"
        );
        return;
      }

      askAction({
        title: status === "completed" ? "Cancel completed swap?" : "Cancel active swap?",
        text:
          status === "completed"
            ? "Both products will be relisted if safe, and eligible expired requests may return to pending."
            : "Both products will become available again if they are still reserved for this swap.",
        confirmLabel: "Cancel Swap",
        tone: "danger",
        onConfirm: () =>
          handleAction(
            swap.id,
            cancelSwap,
            status === "completed" ? "Swap cancelled and products relisted" : "Swap cancelled"
          ),
      });
    },
    onComplete: (swap) =>
      askAction({
        title: "Complete this swap?",
        text: "This is allowed only after both users confirmed receipt. Listings will stay hidden and archive after 3 days.",
        confirmLabel: "Complete Swap",
        onConfirm: () => handleAction(swap.id, completeSwap, "Swap completed"),
      }),
    onDeleteCompletedItems: (swap) =>
      handleAction(swap.id, deleteCompletedSwapItems, "Completed swap items archived"),
  };

  const content = isDesktop ? (
    <SwapDesktop {...commonProps} />
  ) : isTablet ? (
    <SwapTablet {...commonProps} />
  ) : (
    <SwapMobile {...commonProps} />
  );

  return (
    <>
      {content}
      <ActionDialog
        open={Boolean(dialog)}
        {...(dialog || {})}
        onClose={() => setDialog(null)}
        onConfirm={confirmDialog}
      />
    </>
  );
}

function SwapDesktop(props) {
  const { swaps, loading } = props;

  return (
    <section className="min-h-[calc(100vh-90px)] px-5 py-6">
      <div className="mx-auto grid max-w-[1500px] grid-cols-[360px_minmax(0,1fr)] gap-6">
        <aside className="sticky top-24 h-[calc(100vh-120px)] overflow-hidden rounded-[34px] bg-slate-950 text-white shadow-[0_34px_100px_rgba(15,23,42,0.22)]">
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
    <div className="relative overflow-hidden rounded-[38px] bg-slate-950 p-6 text-white shadow-[0_34px_100px_rgba(15,23,42,0.22)] md:p-8">
      <img
        src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85"
        alt="Swap request workflow"
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,7,25,0.94),rgba(7,7,25,0.66),rgba(7,7,25,0.24))]" />
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="relative min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/12 px-5 py-2 text-sm font-black text-pink-200 backdrop-blur-xl">
            <Repeat2 size={17} />
            Swap Center
          </div>
          <h1 className={`${compact ? "mt-4 text-4xl" : "mt-5 text-7xl"} max-w-3xl font-black leading-[0.9]`}>
            Swap requests, under control.
          </h1>
          <p className="mt-4 max-w-2xl font-semibold leading-relaxed text-white/68">
            Review offers, lock products safely, chat after acceptance, and keep completed swaps archived for history.
          </p>
        </div>

        <div className="relative grid min-w-[280px] grid-cols-2 gap-3">
          <Stat label="Total" value={stats.total} />
          <Stat label="Pending" value={stats.pending} />
          <Stat label="Active" value={stats.accepted + stats.shipped + stats.delivered} />
          <Stat label="Completed" value={stats.completed} />
        </div>
      </div>
    </div>
  );
}

function SwapSidebar(props) {
  const { stats } = props;

  return (
    <div className="relative flex h-full flex-col p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,79,163,0.28),transparent_34%),radial-gradient(circle_at_90%_80%,rgba(139,92,246,0.20),transparent_34%)]" />
      <div className="relative rounded-[28px] border border-white/12 bg-white/10 p-5 text-white backdrop-blur-2xl">
        <ShieldCheck size={26} />
        <h2 className="mt-4 text-2xl font-black">Swap workflow</h2>
        <p className="mt-2 text-sm font-semibold text-white/68">
          Accept only when item details and meeting plan feel clear.
        </p>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-3">
        <Stat label="Incoming" value={stats.incoming} />
        <Stat label="Outgoing" value={stats.outgoing} />
      </div>

      <div className="relative mt-4 min-h-0 flex-1 overflow-y-auto">
        <SearchAndTabs {...props} vertical />
      </div>
    </div>
  );
}

function SearchAndTabs({ tab, query, onTabChange, onQueryChange, vertical = false, mobile = false }) {
  const dark = vertical;

  return (
    <div>
      <div
        className={`flex h-12 items-center rounded-full px-4 backdrop-blur-xl ${
          dark ? "border border-white/12 bg-white/12" : "border border-pink-100 bg-pink-50"
        }`}
      >
        <Search size={18} className="shrink-0 text-pink-500" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search swaps..."
          className={`min-w-0 flex-1 bg-transparent px-3 text-sm font-bold outline-none ${
            dark ? "text-white placeholder:text-white/40" : "text-slate-900 placeholder:text-slate-400"
          }`}
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
                : dark
                ? "bg-white/10 text-white/72 hover:bg-white/16"
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
    onOpenDeal,
    onAccept,
    onReject,
    onCancel,
    onComplete,
    onDeleteCompletedItems,
    onSetDeliveryMethod,
    onConfirmHandover,
    onConfirmReceived,
    compact,
    mobile,
  } = props;

  const isOwner = String(swap.owner_id) === String(userId);
  const isRequester = String(swap.requester_id) === String(userId);
  const status = normalizeStatus(swap.status);
  const updating = updatingId === swap.id;
  const myConfirmation = getUserConfirmation(swap, userId);
  const confirmationSummary = getConfirmationSummary(swap);

  return (
    <article className="premium-card interactive-lift overflow-hidden rounded-[30px]">
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
          {["accepted", "shipped", "delivered"].includes(status) && (
            <SwapProgressPanel
              swap={swap}
              myConfirmation={myConfirmation}
              confirmationSummary={confirmationSummary}
            />
          )}
        </div>

        <SwapActions
          status={status}
          isOwner={isOwner}
          isRequester={isRequester}
          updating={updating}
          onOpenChat={() => onOpenChat(swap)}
          onOpenDeal={() => onOpenDeal(swap)}
          onAccept={() => onAccept(swap)}
          onReject={() => onReject(swap)}
          onCancel={() => onCancel(swap)}
          onComplete={() => onComplete(swap)}
          onDeleteCompletedItems={() => onDeleteCompletedItems(swap)}
          onSetDeliveryMethod={(method) => onSetDeliveryMethod(swap, method)}
          onConfirmHandover={() => onConfirmHandover(swap)}
          onConfirmReceived={() => onConfirmReceived(swap)}
          itemsDeleted={Boolean(swap.items_deleted_at)}
          deliveryMethod={swap.delivery_method}
          myConfirmation={myConfirmation}
          confirmationSummary={confirmationSummary}
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
  onOpenDeal,
  onAccept,
  onReject,
  onCancel,
  onComplete,
  onDeleteCompletedItems,
  onSetDeliveryMethod,
  onConfirmHandover,
  onConfirmReceived,
  deliveryMethod,
  myConfirmation,
  confirmationSummary,
}) {
  const handoverDone = Boolean(myConfirmation?.handover_confirmed_at);
  const receivedDone = Boolean(myConfirmation?.received_confirmed_at);
  const bothReceived = confirmationSummary.received >= 2;

  return (
    <div className="w-full shrink-0 xl:w-[230px]">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <button
          type="button"
          onClick={onOpenDeal}
          className="flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 font-black text-white transition hover:bg-slate-800"
        >
          <ShieldCheck size={17} />
          Open Deal Room
        </button>

        {status === "pending" && isOwner && (
          <>
            <ActionButton disabled={updating} onClick={onAccept}>Accept</ActionButton>
            <ActionButton variant="danger" disabled={updating} onClick={onReject}>Reject</ActionButton>
          </>
        )}

        {status === "pending" && isRequester && (
          <ActionButton variant="danger" disabled={updating} onClick={onCancel}>Cancel Request</ActionButton>
        )}

        {["accepted", "shipped", "delivered"].includes(status) && (
          <>
            <button
              type="button"
              onClick={onOpenChat}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-pink-500 font-black text-white transition hover:bg-pink-600"
            >
              <MessageCircle size={17} />
              Open Chat
            </button>
            {!deliveryMethod && (
              <>
                <ActionButton disabled={updating} onClick={() => onSetDeliveryMethod("local")}>
                  Local Meetup
                </ActionButton>
                <ActionButton disabled={updating} onClick={() => onSetDeliveryMethod("courier")}>
                  Courier
                </ActionButton>
              </>
            )}
            {deliveryMethod && !handoverDone && (
              <ActionButton disabled={updating} onClick={onConfirmHandover}>
                {deliveryMethod === "courier" ? "I Shipped It" : "I Handed Over"}
              </ActionButton>
            )}
            {deliveryMethod && !receivedDone && (
              <ActionButton disabled={updating} onClick={onConfirmReceived}>
                I Received Item
              </ActionButton>
            )}
            {status === "delivered" && bothReceived && (
              <ActionButton disabled={updating} onClick={onComplete}>Mark Completed</ActionButton>
            )}
            <ActionButton variant="danger" disabled={updating} onClick={onCancel}>Cancel Swap</ActionButton>
          </>
        )}

        {status === "completed" && (
          <>
            <ActionButton variant="danger" disabled={updating} onClick={onCancel}>
              Cancel & Relist
            </ActionButton>
            {!itemsDeleted ? (
              <ActionButton disabled={updating} onClick={onDeleteCompletedItems}>
                Archive Swapped Items
              </ActionButton>
            ) : (
              <div className="rounded-[20px] bg-slate-50 px-4 py-3 text-center text-sm font-black text-slate-500">
                Items archived
              </div>
            )}
          </>
        )}

        {!["pending", "accepted", "shipped", "delivered", "completed"].includes(status) && (
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
    <div className="min-w-0 rounded-[24px] border border-white/80 bg-white/72 p-4 shadow-sm">
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
    { key: "shipped", label: "Handover" },
    { key: "delivered", label: "Received" },
    { key: "completed", label: "Completed" },
  ];
  const activeIndexMap = {
    pending: 0,
    accepted: 1,
    shipped: 2,
    delivered: 3,
    completed: 4,
  };
  const activeIndex = activeIndexMap[status] ?? -1;

  return (
    <div className="mt-5 rounded-[24px] border border-white/80 bg-white/72 p-4 shadow-sm">
      <div className="grid grid-cols-5 gap-3">
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
    shipped: ["In Transit", Repeat2, "bg-blue-50 text-blue-700"],
    delivered: ["Delivered", ShieldCheck, "bg-violet-50 text-violet-700"],
    rejected: ["Rejected", XCircle, "bg-red-50 text-red-700"],
    cancelled: ["Cancelled", RotateCcw, "bg-slate-100 text-slate-700"],
    completed: ["Completed", CheckCircle2, "bg-pink-50 text-pink-600"],
    expired: ["Expired", Clock3, "bg-slate-100 text-slate-700"],
    failed: ["Failed", XCircle, "bg-red-50 text-red-700"],
    disputed: ["Disputed", ShieldCheck, "bg-violet-50 text-violet-700"],
  };
  const [label, Icon, cls] = map[status] || map.pending;

  return (
    <div className={`inline-flex w-fit items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black ${cls}`}>
      <Icon size={17} />
      {label}
    </div>
  );
}

function SwapProgressPanel({ swap, myConfirmation, confirmationSummary }) {
  const method = swap.delivery_method
    ? swap.delivery_method === "courier"
      ? "Courier"
      : swap.delivery_method === "local"
      ? "Local meetup"
      : "Other"
    : "Not selected";

  return (
    <div className="mt-5 grid gap-3 rounded-[24px] border border-white/80 bg-white/72 p-4 shadow-sm sm:grid-cols-3">
      <ProgressPill label="Method" value={method} />
      <ProgressPill
        label="Your side"
        value={`${myConfirmation?.handover_confirmed_at ? "Handed" : "Pending"} / ${
          myConfirmation?.received_confirmed_at ? "Received" : "Waiting"
        }`}
      />
      <ProgressPill
        label="Both users"
        value={`${confirmationSummary.handover}/2 handed, ${confirmationSummary.received}/2 received`}
      />
    </div>
  );
}

function ProgressPill({ label, value }) {
  return (
    <div className="min-w-0 rounded-[18px] bg-pink-50/70 px-4 py-3">
      <p className="truncate text-[11px] font-black uppercase tracking-widest text-pink-500">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-slate-700">{value}</p>
    </div>
  );
}

function getUserConfirmation(swap, userId) {
  return (swap.confirmations || []).find((item) => String(item.user_id) === String(userId)) || null;
}

function getConfirmationSummary(swap) {
  const confirmations = swap.confirmations || [];
  return {
    handover: confirmations.filter((item) => item.handover_confirmed_at).length,
    received: confirmations.filter((item) => item.received_confirmed_at).length,
  };
}

function ActionButton({ children, onClick, disabled, variant = "primary" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-11 rounded-full px-4 font-black transition disabled:opacity-60 ${
        variant === "danger" ? "bg-red-50 text-red-600 hover:bg-red-100" : "button-primary min-h-0"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-[22px] border border-white/14 bg-white/12 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl">
      <p className="text-xs font-black text-white/58">{label}</p>
      <h3 className="mt-1 text-3xl font-black text-pink-200">{value}</h3>
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
