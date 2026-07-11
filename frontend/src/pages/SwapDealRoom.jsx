import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MessageCircle,
  PackageCheck,
  Repeat2,
  ShieldCheck,
  Star,
  Truck,
  XCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  acceptSwap,
  cancelSwap,
  confirmSwapHandover,
  confirmSwapReceived,
  completeSwap,
  deleteCompletedSwapItems,
  getSwapById,
  openSwapDispute,
  rejectSwap,
  setSwapDeliveryMethod,
} from "../services/swaps";
import { getOrCreateConversation } from "../services/chat";
import { submitSwapReview } from "../services/trust";

const flowSteps = [
  ["pending", "Requested"],
  ["accepted", "Locked"],
  ["shipped", "Handover"],
  ["delivered", "Received"],
  ["completed", "Completed"],
];

export default function SwapDealRoom() {
  const { swapId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [swap, setSwap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const loadSwap = useCallback(async () => {
    if (!swapId) return;

    setLoading(true);

    try {
      const data = await getSwapById(swapId);
      setSwap(data);
    } catch (error) {
      toast.error(error.message || "Unable to load swap");
    } finally {
      setLoading(false);
    }
  }, [swapId]);

  useEffect(() => {
    loadSwap();
  }, [loadSwap]);

  async function runAction(actionFn, successMessage) {
    if (!swap?.id) return;

    setUpdating(true);
    const response = await actionFn(swap.id);

    if (response.success) {
      toast.success(successMessage);
      await loadSwap();
    } else {
      toast.error(response.error || "Action failed");
    }

    setUpdating(false);
  }

  async function openChat() {
    if (!swap || !user?.id) return;

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

  async function openDispute() {
    const reason = window.prompt(
      "Tell us what went wrong. This will freeze the swap for review."
    );

    if (reason === null) return;

    await runAction(
      (id) => openSwapDispute(id, reason || "Swap issue reported"),
      "Dispute opened"
    );
  }

  async function submitReview() {
    if (!swap?.id) return;

    setReviewing(true);
    const response = await submitSwapReview(swap.id, reviewRating, reviewComment);

    if (response.success) {
      toast.success("Review saved");
      setReviewComment("");
    } else {
      toast.error(response.error || "Unable to save review");
    }

    setReviewing(false);
  }

  const status = normalizeStatus(swap?.status);
  const myConfirmation = useMemo(
    () =>
      (swap?.confirmations || []).find(
        (item) => String(item.user_id) === String(user?.id)
      ) || null,
    [swap?.confirmations, user?.id]
  );
  const summary = useMemo(() => getConfirmationSummary(swap), [swap]);
  const canComplete = status === "delivered" && summary.received >= 2;
  const isOwner = String(swap?.owner_id) === String(user?.id);
  const isRequester = String(swap?.requester_id) === String(user?.id);

  if (loading) {
    return (
      <section className="section-space pt-6">
        <div className="container-main">
          <div className="rounded-[34px] bg-white p-10 text-center shadow-lg">
            <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-pink-100" />
            <h1 className="mt-5 text-3xl font-black">Loading deal room...</h1>
          </div>
        </div>
      </section>
    );
  }

  if (!swap) {
    return (
      <section className="section-space pt-6">
        <div className="container-main">
          <div className="rounded-[34px] bg-white p-10 shadow-lg">
            <h1 className="text-4xl font-black">Swap not found</h1>
            <Link to="/swaps" className="button-primary mt-6 px-6">
              Back to swaps
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-90px)] px-4 py-6 md:px-5">
      <div className="mx-auto max-w-[1480px]">
        <Link
          to="/swaps"
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-black shadow-md hover:text-pink-500"
        >
          <ArrowLeft size={18} />
          Back to swaps
        </Link>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <main className="min-w-0">
            <div className="relative overflow-hidden rounded-[38px] bg-slate-950 p-6 text-white shadow-[0_34px_100px_rgba(15,23,42,0.22)] md:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(255,79,163,0.34),transparent_36%),radial-gradient(circle_at_92%_0%,rgba(139,92,246,0.26),transparent_30%)]" />
              <div className="relative">
                <StatusBadge status={status} />
                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.96] md:text-6xl">
                  Swap Deal Room
                </h1>
                <p className="mt-4 max-w-2xl font-semibold leading-relaxed text-white/68">
                  One guided place for method selection, handover, receipt, completion,
                  cancellation, and safety checks.
                </p>
              </div>
            </div>

            <Timeline status={status} />

            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <DealItem
                label={isRequester ? "Your offer" : `${swap.requester_name}'s offer`}
                item={swap.requester_item}
              />
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 text-pink-500">
                <Repeat2 size={24} />
              </div>
              <DealItem
                label={isOwner ? "Your item" : `${swap.owner_name}'s item`}
                item={swap.owner_item}
              />
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <InfoPanel
                icon={Truck}
                title="Exchange method"
                value={methodLabel(swap.delivery_method)}
                text="Can be changed before completion."
              />
              <InfoPanel
                icon={PackageCheck}
                title="Your confirmation"
                value={`${myConfirmation?.handover_confirmed_at ? "Handed" : "Pending"} / ${
                  myConfirmation?.received_confirmed_at ? "Received" : "Waiting"
                }`}
                text="Your side of the swap."
              />
              <InfoPanel
                icon={ShieldCheck}
                title="Both users"
                value={`${summary.handover}/2 handed, ${summary.received}/2 received`}
                text="Completion unlocks after both receive."
              />
            </div>

            {status === "disputed" && (
              <div className="mt-6 rounded-[30px] border border-red-100 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={24} className="mt-1 shrink-0 text-red-600" />
                  <div>
                    <h2 className="text-2xl font-black text-red-700">Dispute open</h2>
                    <p className="mt-2 font-semibold leading-relaxed text-red-700/80">
                      This swap is frozen. Products should stay hidden and locked until the
                      issue is resolved by support/admin.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === "completed" && (
              <ReviewSwapPanel
                rating={reviewRating}
                comment={reviewComment}
                loading={reviewing}
                onRating={setReviewRating}
                onComment={setReviewComment}
                onSubmit={submitReview}
              />
            )}

            <EventHistory events={swap.events || []} disputes={swap.disputes || []} />
          </main>

          <aside className="h-fit rounded-[34px] border border-pink-100 bg-white/92 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl xl:sticky xl:top-28">
            <h2 className="text-2xl font-black">Next action</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Actions are shown only when that step is safe for this swap.
            </p>

            <div className="mt-5 grid gap-3">
              {status === "pending" && isOwner && (
                <>
                  <ActionButton
                    disabled={updating}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Accepting this swap will reserve both products and expire competing pending requests."
                        )
                      ) {
                        runAction(acceptSwap, "Swap accepted");
                      }
                    }}
                  >
                    Accept & Lock
                  </ActionButton>
                  <ActionButton
                    danger
                    disabled={updating}
                    onClick={() => runAction(rejectSwap, "Swap rejected")}
                  >
                    Reject
                  </ActionButton>
                </>
              )}

              {status === "pending" && isRequester && (
                <ActionButton
                  danger
                  disabled={updating}
                  onClick={() => runAction(cancelSwap, "Request cancelled")}
                >
                  Cancel Request
                </ActionButton>
              )}

              {["accepted", "shipped", "delivered"].includes(status) && (
                <>
                  <ActionButton disabled={updating} onClick={openChat}>
                    <MessageCircle size={17} />
                    Open Chat
                  </ActionButton>

                  <div className="grid grid-cols-2 gap-2">
                    <ActionButton
                      disabled={updating}
                      quiet={swap.delivery_method === "local"}
                      onClick={() =>
                        runAction(
                          (id) => setSwapDeliveryMethod(id, "local"),
                          "Local meetup selected"
                        )
                      }
                    >
                      Local
                    </ActionButton>
                    <ActionButton
                      disabled={updating}
                      quiet={swap.delivery_method === "courier"}
                      onClick={() =>
                        runAction(
                          (id) => setSwapDeliveryMethod(id, "courier"),
                          "Courier selected"
                        )
                      }
                    >
                      Courier
                    </ActionButton>
                  </div>

                  {swap.delivery_method && !myConfirmation?.handover_confirmed_at && (
                    <ActionButton
                      disabled={updating}
                      onClick={() =>
                        runAction(confirmSwapHandover, "Handover confirmed")
                      }
                    >
                      {swap.delivery_method === "courier"
                        ? "I Shipped It"
                        : "I Handed Over"}
                    </ActionButton>
                  )}

                  {swap.delivery_method && !myConfirmation?.received_confirmed_at && (
                    <ActionButton
                      disabled={updating}
                      onClick={() =>
                        runAction(confirmSwapReceived, "Receipt confirmed")
                      }
                    >
                      I Received Item
                    </ActionButton>
                  )}

                  {canComplete && (
                    <ActionButton
                      disabled={updating}
                      onClick={() => runAction(completeSwap, "Swap completed")}
                    >
                      Mark Completed
                    </ActionButton>
                  )}

                  <ActionButton danger disabled={updating} onClick={openDispute}>
                    <AlertTriangle size={17} />
                    Open Dispute
                  </ActionButton>

                  <ActionButton
                    danger
                    disabled={updating}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Cancel this active swap? Products will be relisted if safe, and eligible expired requests may return to pending."
                        )
                      ) {
                        runAction(cancelSwap, "Swap cancelled and products relisted");
                      }
                    }}
                  >
                    Cancel & Relist
                  </ActionButton>
                </>
              )}

              {status === "completed" && (
                <>
                  <ActionButton danger disabled={updating} onClick={openDispute}>
                    <AlertTriangle size={17} />
                    Open Dispute
                  </ActionButton>
                  <ActionButton
                    danger
                    disabled={updating}
                    onClick={() => runAction(cancelSwap, "Swap cancelled and products relisted")}
                  >
                    Cancel & Relist
                  </ActionButton>
                  {!swap.items_deleted_at && (
                    <ActionButton
                      disabled={updating}
                      onClick={() =>
                        runAction(deleteCompletedSwapItems, "Items archived")
                      }
                    >
                      Archive Items
                    </ActionButton>
                  )}
                </>
              )}

              {!["pending", "accepted", "shipped", "delivered", "completed"].includes(
                status
              ) && (
                <div className="rounded-[22px] bg-slate-50 p-4 text-center font-black text-slate-500">
                  No action needed
                </div>
              )}
            </div>

            <div className="mt-5 rounded-[24px] bg-emerald-50 p-4">
              <p className="font-black text-emerald-700">Safety rule</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-emerald-700/80">
                Complete only after both users confirm receipt. Use cancel/relist if the
                deal falls apart before final completion.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function DealItem({ label, item }) {
  const image = item?.image || (Array.isArray(item?.images) ? item.images[0] : "") || "/icons.svg";

  return (
    <div className="min-w-0 rounded-[30px] border border-white/80 bg-white/88 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <p className="text-xs font-black uppercase tracking-widest text-pink-500">{label}</p>
      <div className="mt-4 flex min-w-0 gap-4">
        <img
          src={image}
          alt={item?.title || "Swap item"}
          onError={(event) => {
            event.currentTarget.src = "/icons.svg";
          }}
          className="h-28 w-28 shrink-0 rounded-[24px] object-cover"
        />
        <div className="min-w-0">
          <h3 className="truncate text-2xl font-black">{item?.title || "Untitled Item"}</h3>
          <p className="mt-2 truncate font-bold text-slate-500">
            {item?.brand || "Brand"} / {item?.size || "Free"}
          </p>
          <p className="mt-3 text-lg font-black text-pink-500">{item?.points || 0} points</p>
        </div>
      </div>
    </div>
  );
}

function Timeline({ status }) {
  const activeIndex = flowSteps.findIndex(([key]) => key === status);

  return (
    <div className="mt-6 rounded-[30px] border border-white/80 bg-white/82 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <div className="grid grid-cols-5 gap-2">
        {flowSteps.map(([key, label], index) => (
          <div key={key} className="min-w-0 text-center">
            <div
              className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${
                index <= activeIndex ? "bg-pink-500 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              <CheckCircle2 size={18} />
            </div>
            <p className="mt-2 truncate text-xs font-black text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: ["Pending", Clock3, "bg-yellow-50 text-yellow-700"],
    accepted: ["Locked", ShieldCheck, "bg-emerald-50 text-emerald-700"],
    shipped: ["In Transit", Truck, "bg-blue-50 text-blue-700"],
    delivered: ["Delivered", PackageCheck, "bg-violet-50 text-violet-700"],
    completed: ["Completed", CheckCircle2, "bg-pink-50 text-pink-600"],
    disputed: ["Disputed", AlertTriangle, "bg-red-50 text-red-700"],
    cancelled: ["Cancelled", XCircle, "bg-slate-100 text-slate-700"],
    expired: ["Expired", Clock3, "bg-slate-100 text-slate-700"],
  };
  const [label, Icon, cls] = map[status] || map.pending;

  return (
    <div className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${cls}`}>
      <Icon size={17} />
      {label}
    </div>
  );
}

function InfoPanel({ icon: Icon, title, value, text }) {
  return (
    <div className="rounded-[26px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
      <Icon size={22} className="text-pink-500" />
      <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">{title}</p>
      <h3 className="mt-1 text-xl font-black">{value}</h3>
      <p className="mt-2 text-sm font-semibold text-slate-500">{text}</p>
    </div>
  );
}

function ReviewSwapPanel({ rating, comment, loading, onRating, onComment, onSubmit }) {
  return (
    <div className="mt-6 rounded-[30px] border border-pink-100 bg-white/90 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 font-black text-pink-600">
            <Star size={16} fill="currentColor" />
            Swap Review
          </div>
          <h2 className="mt-4 text-2xl font-black">Rate this swap partner</h2>
          <p className="mt-2 max-w-2xl font-semibold leading-relaxed text-slate-500">
            Your review improves trust scoring for future swappers.
          </p>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onRating(value)}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                value <= rating ? "bg-yellow-100 text-yellow-500" : "bg-slate-100 text-slate-300"
              }`}
              aria-label={`${value} star rating`}
            >
              <Star size={19} fill="currentColor" />
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(event) => onComment(event.target.value)}
        placeholder="Share item quality, timing, communication, or meetup experience..."
        className="mt-5 min-h-28 w-full resize-none rounded-[24px] border border-pink-100 bg-white/75 p-4 font-semibold outline-none transition focus:border-pink-300"
      />

      <button
        type="button"
        disabled={loading}
        onClick={onSubmit}
        className="button-primary mt-4 h-12 px-6 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Review"}
      </button>
    </div>
  );
}

function EventHistory({ events, disputes }) {
  const rows = [
    ...events.map((event) => ({
      id: `event-${event.id}`,
      type: event.event_type,
      text: eventLabel(event.event_type),
      created_at: event.created_at,
      metadata: event.metadata,
    })),
    ...disputes.map((dispute) => ({
      id: `dispute-${dispute.id}`,
      type: "dispute",
      text: `Dispute: ${dispute.reason || "Swap issue reported"}`,
      created_at: dispute.created_at,
      metadata: { status: dispute.status },
    })),
  ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  return (
    <div className="mt-6 rounded-[30px] border border-white/80 bg-white/88 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <h2 className="text-2xl font-black">Deal history</h2>
      <div className="mt-4 grid gap-3">
        {rows.length === 0 ? (
          <p className="rounded-[20px] bg-slate-50 p-4 text-sm font-semibold text-slate-500">
            No activity yet.
          </p>
        ) : (
          rows.slice(0, 12).map((row) => (
            <div
              key={row.id}
              className="flex items-start gap-3 rounded-[20px] bg-slate-50 p-4"
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-500">
                {row.type === "dispute" ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}
              </div>
              <div className="min-w-0">
                <p className="font-black text-slate-800">{row.text}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">
                  {formatDateTime(row.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function eventLabel(type) {
  const labels = {
    request_accepted: "Request accepted and products locked",
    delivery_method_set: "Exchange method selected",
    handover_confirmed: "Handover/shipping confirmed",
    received_confirmed: "Item receipt confirmed",
    swap_completed: "Swap completed",
    items_archived: "Completed items archived",
    dispute_opened: "Dispute opened",
    cancelled: "Swap cancelled",
    rejected: "Swap rejected",
    failed: "Swap failed",
  };

  return labels[type] || String(type || "Swap updated").replaceAll("_", " ");
}

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActionButton({ children, onClick, disabled, danger = false, quiet = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-full px-4 font-black transition disabled:opacity-60 ${
        danger
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : quiet
          ? "bg-pink-50 text-pink-600"
          : "button-primary"
      }`}
    >
      {children}
    </button>
  );
}

function normalizeStatus(status) {
  return String(status || "pending").toLowerCase();
}

function methodLabel(method) {
  if (method === "courier") return "Courier";
  if (method === "local") return "Local meetup";
  if (method) return "Other";
  return "Not selected";
}

function getConfirmationSummary(swap) {
  const confirmations = swap?.confirmations || [];
  return {
    handover: confirmations.filter((item) => item.handover_confirmed_at).length,
    received: confirmations.filter((item) => item.received_confirmed_at).length,
  };
}
