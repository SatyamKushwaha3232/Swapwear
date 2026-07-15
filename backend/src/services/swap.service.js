import { prisma } from "../config/prisma.js";
import { assertCourierReadyForHandover } from "../modules/delivery/delivery.service.js";
import { createNotification } from "./notification.service.js";

const ACTIVE_SWAP_STATUSES = ["PENDING", "ACCEPTED", "SHIPPED", "DELIVERED", "DISPUTED"];
const RELIST_STATUSES = ["CANCELLED", "REJECTED", "FAILED"];

function parseListingId(id) {
  try {
    return BigInt(id);
  } catch {
    const error = new Error("Invalid listing id");
    error.status = 400;
    throw error;
  }
}

function normalizeStatus(status) {
  const value = String(status || "PENDING").toUpperCase();
  if (value === "CANCELED") return "CANCELLED";
  return value;
}

function apiStatus(status) {
  return String(status || "PENDING").toLowerCase();
}

function listingSnapshot(item = {}) {
  return {
    id: String(item.id),
    title: item.title || "Untitled Item",
    brand: item.brand || "Unknown Brand",
    size: item.size || "Free",
    condition: item.condition || "Good",
    category: item.category || "Fashion",
    points: Number(item.points) || 0,
    image:
      (Array.isArray(item.images) && item.images[0]) ||
      item.image ||
      "/icons.svg",
    images: Array.isArray(item.images) ? item.images : item.image ? [item.image] : [],
    owner_name: item.ownerName || "SwapWear User",
    user_id: item.userId,
  };
}

function formatEvent(event = {}) {
  return {
    id: String(event.id),
    swap_id: event.swapId,
    actor_id: event.actorId,
    event_type: event.eventType,
    metadata: event.metadata || {},
    created_at: event.createdAt?.toISOString?.() || event.createdAt,
  };
}

function formatConfirmation(item = {}) {
  return {
    id: String(item.id),
    swap_id: item.swapId,
    user_id: item.userId,
    handover_confirmed_at:
      item.handoverConfirmedAt?.toISOString?.() || item.handoverConfirmedAt || null,
    received_confirmed_at:
      item.receivedConfirmedAt?.toISOString?.() || item.receivedConfirmedAt || null,
    proof_url: item.proofUrl || "",
    note: item.note || "",
    created_at: item.createdAt?.toISOString?.() || item.createdAt,
    updated_at: item.updatedAt?.toISOString?.() || item.updatedAt,
  };
}

function formatDispute(item = {}) {
  return {
    id: String(item.id),
    swap_id: item.swapId,
    opened_by: item.openedBy,
    reason: item.reason || "",
    status: apiStatus(item.status),
    resolution: item.resolution || "",
    created_at: item.createdAt?.toISOString?.() || item.createdAt,
    resolved_at: item.resolvedAt?.toISOString?.() || item.resolvedAt || null,
  };
}

function formatDelivery(order = {}) {
  return {
    id: order.id,
    swap_id: order.swapId,
    leg: order.leg,
    method: String(order.method || "COURIER").toLowerCase(),
    status: String(order.status || "ADDRESS_PENDING").toLowerCase(),
    pickup_address_id: order.pickupAddressId,
    drop_address_id: order.dropAddressId,
    courier_provider: order.courierProvider || "",
    tracking_number: order.trackingNumber || "",
    tracking_url: order.trackingUrl || "",
    proof_url: order.proofUrl || "",
    cost: Number(order.cost) || 0,
    notes: order.notes || "",
    created_at: order.createdAt?.toISOString?.() || order.createdAt,
    updated_at: order.updatedAt?.toISOString?.() || order.updatedAt,
  };
}

function formatSwap(swap = {}) {
  const requesterItem =
    swap.requesterItem || swap.requesterListing
      ? swap.requesterItem || listingSnapshot(swap.requesterListing)
      : null;
  const ownerItem =
    swap.ownerItem || swap.ownerListing
      ? swap.ownerItem || listingSnapshot(swap.ownerListing)
      : null;

  return {
    id: swap.id,
    requester_id: swap.requesterId,
    owner_id: swap.ownerId,
    requester_name: swap.requesterName || "Requester",
    owner_name: swap.ownerName || "Owner",
    requester_item_id: String(swap.requesterItemId || requesterItem?.id || ""),
    owner_item_id: String(swap.ownerItemId || ownerItem?.id || ""),
    requester_item: requesterItem,
    owner_item: ownerItem,
    status: apiStatus(swap.status),
    message: swap.message || "",
    delivery_method: swap.deliveryMethod ? apiStatus(swap.deliveryMethod) : "",
    accepted_at: swap.acceptedAt?.toISOString?.() || swap.acceptedAt || null,
    cancelled_at: swap.cancelledAt?.toISOString?.() || swap.cancelledAt || null,
    expires_at: swap.expiresAt?.toISOString?.() || swap.expiresAt || null,
    last_action_at: swap.lastActionAt?.toISOString?.() || swap.lastActionAt || null,
    completed_at: swap.completedAt?.toISOString?.() || swap.completedAt || null,
    archive_after: swap.archiveAfter?.toISOString?.() || swap.archiveAfter || null,
    delete_eligible_at:
      swap.deleteEligibleAt?.toISOString?.() || swap.deleteEligibleAt || null,
    items_deleted_at: swap.itemsDeletedAt?.toISOString?.() || swap.itemsDeletedAt || null,
    archived_at: swap.archivedAt?.toISOString?.() || swap.archivedAt || null,
    cancel_reason: swap.cancelReason || "",
    confirmations: (swap.confirmations || []).map(formatConfirmation),
    events: (swap.events || []).map(formatEvent),
    disputes: (swap.disputes || []).map(formatDispute),
    deliveries: (swap.deliveries || []).map(formatDelivery),
    created_at: swap.createdAt?.toISOString?.() || swap.createdAt,
    updated_at: swap.updatedAt?.toISOString?.() || swap.updatedAt,
  };
}

function swapInclude() {
  return {
    requesterListing: true,
    ownerListing: true,
    confirmations: true,
    deliveries: { orderBy: { leg: "asc" } },
    events: { orderBy: { createdAt: "desc" } },
    disputes: { orderBy: { createdAt: "desc" } },
  };
}

async function addEvent(tx, swapId, actorId, eventType, metadata = {}) {
  await tx.swapEvent.create({
    data: { swapId, actorId, eventType, metadata },
  });
}

async function notifySwapParticipant(swap, actorId, status, title = "Swap updated") {
  const recipientId = swap.requesterId === actorId ? swap.ownerId : swap.requesterId;
  if (!recipientId || recipientId === actorId) return;

  await createNotification({
    userId: recipientId,
    actorId,
    type: `swap_${status}`,
    title,
    message: `Your swap is now ${status}.`,
    link: "/swaps",
    data: { swap_id: swap.id },
  });
}

async function assertParticipant(swap, user) {
  if (swap.requesterId !== user.id && swap.ownerId !== user.id && !["ADMIN", "OWNER"].includes(user.role)) {
    const error = new Error("You are not part of this swap");
    error.status = 403;
    throw error;
  }
}

async function loadSwap(id, tx = prisma) {
  const swap = await tx.swap.findUnique({
    where: { id },
    include: swapInclude(),
  });

  if (!swap) {
    const error = new Error("Swap not found");
    error.status = 404;
    throw error;
  }

  return swap;
}

async function ensureListingsAvailable(tx, requesterItemId, ownerItemId) {
  const listings = await tx.listing.findMany({
    where: { id: { in: [requesterItemId, ownerItemId] } },
  });

  if (listings.length !== 2) {
    const error = new Error("One of these items is no longer available");
    error.status = 400;
    throw error;
  }

  const blocked = listings.find(
    (item) => item.swapStatus !== "AVAILABLE" || item.isPublic === false
  );

  if (blocked) {
    const error = new Error(`${blocked.title || "This item"} is already locked in another swap`);
    error.status = 409;
    throw error;
  }

  return listings;
}

async function expireCompetingSwaps(tx, swap, actorId) {
  const touched = await tx.swap.findMany({
    where: {
      id: { not: swap.id },
      status: "PENDING",
      OR: [
        { requesterItemId: swap.requesterItemId },
        { ownerItemId: swap.requesterItemId },
        { requesterItemId: swap.ownerItemId },
        { ownerItemId: swap.ownerItemId },
      ],
    },
  });

  if (touched.length === 0) return;

  await tx.swap.updateMany({
    where: { id: { in: touched.map((item) => item.id) } },
    data: { status: "EXPIRED", lastActionAt: new Date() },
  });

  await Promise.all(
    touched.map((item) =>
      addEvent(tx, item.id, actorId, "expired_by_competing_accept", {
        acceptedSwapId: swap.id,
      })
    )
  );
}

async function reviveEligibleExpiredSwaps(tx, cancelledSwap, actorId) {
  const expired = await tx.swap.findMany({
    where: {
      id: { not: cancelledSwap.id },
      status: "EXPIRED",
      OR: [
        { requesterItemId: cancelledSwap.requesterItemId },
        { ownerItemId: cancelledSwap.requesterItemId },
        { requesterItemId: cancelledSwap.ownerItemId },
        { ownerItemId: cancelledSwap.ownerItemId },
      ],
    },
  });

  for (const swap of expired) {
    const listings = await tx.listing.findMany({
      where: { id: { in: [swap.requesterItemId, swap.ownerItemId] } },
    });

    const canRevive =
      listings.length === 2 &&
      listings.every((item) => item.swapStatus === "AVAILABLE" && item.isPublic);

    if (!canRevive) continue;

    await tx.swap.update({
      where: { id: swap.id },
      data: {
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastActionAt: new Date(),
      },
    });
    await addEvent(tx, swap.id, actorId, "revived_after_relist", {
      cancelledSwapId: cancelledSwap.id,
    });
  }
}

export async function createSwapRequest(payload, user) {
  const requesterItemId = parseListingId(payload.requester_item_id || payload.requesterItem?.id);
  const ownerItemId = parseListingId(payload.owner_item_id || payload.ownerItem?.id);

  if (requesterItemId === ownerItemId) {
    const error = new Error("You cannot swap the same item");
    error.status = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const [requesterListing, ownerListing] = await ensureListingsAvailable(
      tx,
      requesterItemId,
      ownerItemId
    );

    if (requesterListing.userId !== user.id) {
      const error = new Error("Requester item must belong to you");
      error.status = 403;
      throw error;
    }

    if (ownerListing.userId === user.id) {
      const error = new Error("You cannot request a swap with your own item");
      error.status = 400;
      throw error;
    }

    const duplicate = await tx.swap.findFirst({
      where: {
        requesterId: user.id,
        ownerId: ownerListing.userId,
        requesterItemId,
        ownerItemId,
        status: { in: ["PENDING", "ACCEPTED", "SHIPPED", "DELIVERED", "DISPUTED"] },
      },
    });

    if (duplicate) {
      const error = new Error("You already have an active request for these items");
      error.status = 409;
      throw error;
    }

    const swap = await tx.swap.create({
      data: {
        requesterId: user.id,
        ownerId: ownerListing.userId,
        requesterName:
          payload.requester_name || user.profile?.fullName || user.email?.split("@")[0],
        ownerName: payload.owner_name || ownerListing.ownerName || "Owner",
        requesterItemId,
        ownerItemId,
        requesterItem: payload.requester_item || payload.requesterItem || listingSnapshot(requesterListing),
        ownerItem: payload.owner_item || payload.ownerItem || listingSnapshot(ownerListing),
        status: "PENDING",
        message: payload.message || "",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: swapInclude(),
    });

    await addEvent(tx, swap.id, user.id, "requested", {
      requesterItemId: String(requesterItemId),
      ownerItemId: String(ownerItemId),
    });

    await createNotification({
      userId: swap.ownerId,
      actorId: user.id,
      type: "swap_request",
      title: "New swap request",
      message: `${swap.requesterName || "Someone"} wants to swap for ${ownerListing.title || "your item"}.`,
      link: "/swaps",
      data: { swap_id: swap.id, listing_id: String(ownerItemId) },
    });

    return formatSwap(swap);
  });
}

export async function fetchSwapRequests(userId, user) {
  if (userId && userId !== user.id && !["ADMIN", "OWNER"].includes(user.role)) {
    const error = new Error("You can only view your own swaps");
    error.status = 403;
    throw error;
  }

  const swaps = await prisma.swap.findMany({
    where: {
      OR: [{ requesterId: user.id }, { ownerId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    include: swapInclude(),
  });

  return swaps.map(formatSwap);
}

export async function fetchSwapById(id, user) {
  const swap = await loadSwap(id);
  await assertParticipant(swap, user);
  return formatSwap(swap);
}

export async function updateSwapStatus(id, status, user, reason = "") {
  const nextStatus = normalizeStatus(status);

  return prisma.$transaction(async (tx) => {
    const swap = await loadSwap(id, tx);
    await assertParticipant(swap, user);

    if (nextStatus === "ACCEPTED") {
      if (swap.ownerId !== user.id && !["ADMIN", "OWNER"].includes(user.role)) {
        const error = new Error("Only owner can accept this request");
        error.status = 403;
        throw error;
      }
      if (swap.status !== "PENDING") throw new Error("Only pending swaps can be accepted");

      await ensureListingsAvailable(tx, swap.requesterItemId, swap.ownerItemId);

      await tx.listing.updateMany({
        where: { id: { in: [swap.requesterItemId, swap.ownerItemId] } },
        data: { swapStatus: "RESERVED", activeSwapId: swap.id, isPublic: false },
      });

      const updated = await tx.swap.update({
        where: { id },
        data: { status: "ACCEPTED", acceptedAt: new Date(), lastActionAt: new Date() },
        include: swapInclude(),
      });

      await expireCompetingSwaps(tx, updated, user.id);
      await addEvent(tx, id, user.id, "accepted");
      await notifySwapParticipant(updated, user.id, "accepted", "Swap accepted");
      return formatSwap(updated);
    }

    if (nextStatus === "COMPLETED") {
      if (!["ACCEPTED", "SHIPPED", "DELIVERED"].includes(swap.status)) {
        throw new Error("Only active swaps can be completed");
      }

      const now = new Date();
      const archiveAfter = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      await tx.listing.updateMany({
        where: { id: { in: [swap.requesterItemId, swap.ownerItemId] } },
        data: {
          swapStatus: "SWAPPED",
          activeSwapId: id,
          isPublic: false,
          swapCompletedAt: now,
          archiveAfter,
          deleteEligibleAt: archiveAfter,
        },
      });

      const updated = await tx.swap.update({
        where: { id },
        data: {
          status: "COMPLETED",
          completedAt: now,
          archiveAfter,
          deleteEligibleAt: archiveAfter,
          lastActionAt: now,
        },
        include: swapInclude(),
      });

      await addEvent(tx, id, user.id, "completed");
      await notifySwapParticipant(updated, user.id, "completed", "Swap completed");
      return formatSwap(updated);
    }

    if (RELIST_STATUSES.includes(nextStatus)) {
      if (!ACTIVE_SWAP_STATUSES.includes(swap.status) && swap.status !== "COMPLETED") {
        throw new Error("This swap can no longer be cancelled");
      }

      const now = new Date();
      await tx.listing.updateMany({
        where: {
          id: { in: [swap.requesterItemId, swap.ownerItemId] },
          activeSwapId: id,
        },
        data: {
          swapStatus: "AVAILABLE",
          activeSwapId: null,
          isPublic: true,
          swapCompletedAt: null,
          archiveAfter: null,
          deleteEligibleAt: null,
        },
      });

      const updated = await tx.swap.update({
        where: { id },
        data: {
          status: nextStatus,
          cancelledAt: now,
          cancelReason: reason || null,
          lastActionAt: now,
        },
        include: swapInclude(),
      });

      await reviveEligibleExpiredSwaps(tx, updated, user.id);
      await addEvent(tx, id, user.id, apiStatus(nextStatus), { reason });
      await notifySwapParticipant(updated, user.id, apiStatus(nextStatus), "Swap updated");
      return formatSwap(updated);
    }

    const error = new Error("Unsupported swap status update");
    error.status = 400;
    throw error;
  });
}

export async function setSwapDeliveryMethod(id, method, user) {
  const deliveryMethod = String(method || "").toUpperCase();
  if (!["LOCAL", "COURIER", "OTHER"].includes(deliveryMethod)) {
    const error = new Error("Invalid delivery method");
    error.status = 400;
    throw error;
  }

  const swap = await loadSwap(id);
  await assertParticipant(swap, user);

  const updated = await prisma.swap.update({
    where: { id },
    data: { deliveryMethod, lastActionAt: new Date() },
    include: swapInclude(),
  });

  await prisma.swapEvent.create({
    data: { swapId: id, actorId: user.id, eventType: "delivery_method_set", metadata: { method } },
  });
  await notifySwapParticipant(updated, user.id, "delivery_method", "Exchange method selected");

  return formatSwap(updated);
}

export async function confirmSwapHandover(id, note, user) {
  return prisma.$transaction(async (tx) => {
    const swap = await loadSwap(id, tx);
    await assertParticipant(swap, user);

    if (!["ACCEPTED", "SHIPPED"].includes(swap.status)) {
      throw new Error("Swap must be accepted before handover");
    }

    await assertCourierReadyForHandover(id);

    await tx.swapConfirmation.upsert({
      where: { swapId_userId: { swapId: id, userId: user.id } },
      update: { handoverConfirmedAt: new Date(), note: note || null },
      create: { swapId: id, userId: user.id, handoverConfirmedAt: new Date(), note: note || null },
    });

    const confirmations = await tx.swapConfirmation.findMany({ where: { swapId: id } });
    const bothConfirmed = [swap.requesterId, swap.ownerId].every((participantId) =>
      confirmations.some((item) => item.userId === participantId && item.handoverConfirmedAt)
    );

    const updated = await tx.swap.update({
      where: { id },
      data: { status: bothConfirmed ? "SHIPPED" : swap.status, lastActionAt: new Date() },
      include: swapInclude(),
    });

    await addEvent(tx, id, user.id, "handover_confirmed");
    await notifySwapParticipant(updated, user.id, "shipped", "Swap handover confirmed");
    return formatSwap(updated);
  });
}

export async function confirmSwapReceived(id, note, user) {
  return prisma.$transaction(async (tx) => {
    const swap = await loadSwap(id, tx);
    await assertParticipant(swap, user);

    if (!["SHIPPED", "DELIVERED"].includes(swap.status)) {
      throw new Error("Swap must be shipped before receipt confirmation");
    }

    await tx.swapConfirmation.upsert({
      where: { swapId_userId: { swapId: id, userId: user.id } },
      update: { receivedConfirmedAt: new Date(), note: note || null },
      create: { swapId: id, userId: user.id, receivedConfirmedAt: new Date(), note: note || null },
    });

    const confirmations = await tx.swapConfirmation.findMany({ where: { swapId: id } });
    const bothReceived = [swap.requesterId, swap.ownerId].every((participantId) =>
      confirmations.some((item) => item.userId === participantId && item.receivedConfirmedAt)
    );

    const updated = await tx.swap.update({
      where: { id },
      data: { status: bothReceived ? "DELIVERED" : swap.status, lastActionAt: new Date() },
      include: swapInclude(),
    });

    await addEvent(tx, id, user.id, "received_confirmed");
    await notifySwapParticipant(updated, user.id, "delivered", "Swap receipt confirmed");
    return formatSwap(updated);
  });
}

export async function openSwapDispute(id, reason, user) {
  return prisma.$transaction(async (tx) => {
    const swap = await loadSwap(id, tx);
    await assertParticipant(swap, user);

    const dispute = await tx.swapDispute.create({
      data: { swapId: id, openedBy: user.id, reason: reason || "Swap issue reported" },
    });

    const updated = await tx.swap.update({
      where: { id },
      data: { status: "DISPUTED", lastActionAt: new Date() },
      include: swapInclude(),
    });

    await addEvent(tx, id, user.id, "disputed", { disputeId: String(dispute.id), reason });
    await notifySwapParticipant(updated, user.id, "disputed", "Swap dispute opened");
    return formatSwap(updated);
  });
}

export async function getOpenSwapDisputes() {
  const disputes = await prisma.swapDispute.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: { swap: { include: swapInclude() } },
  });

  return disputes.map((row) => ({
    ...formatDispute(row),
    swap: formatSwap(row.swap),
  }));
}

export async function resolveSwapDispute(disputeId, decision, resolution, user) {
  if (!["ADMIN", "OWNER", "MODERATOR"].includes(user.role)) {
    const error = new Error("Admin access required");
    error.status = 403;
    throw error;
  }

  const disputeKey = parseListingId(disputeId);
  return prisma.$transaction(async (tx) => {
    const dispute = await tx.swapDispute.findUnique({ where: { id: disputeKey } });
    if (!dispute) throw new Error("Dispute not found");

    await tx.swapDispute.update({
      where: { id: disputeKey },
      data: { status: "RESOLVED", resolution: resolution || decision, resolvedAt: new Date() },
    });

    const nextStatus = decision === "complete" ? "COMPLETED" : decision === "cancel" ? "CANCELLED" : "ACCEPTED";
    await addEvent(tx, dispute.swapId, user.id, "dispute_resolved", { decision, resolution });

    const current = await loadSwap(dispute.swapId, tx);
    if (nextStatus === "COMPLETED") {
      const now = new Date();
      const archiveAfter = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      await tx.listing.updateMany({
        where: { id: { in: [current.requesterItemId, current.ownerItemId] } },
        data: { swapStatus: "SWAPPED", isPublic: false, swapCompletedAt: now, archiveAfter, deleteEligibleAt: archiveAfter },
      });
    }
    if (nextStatus === "CANCELLED") {
      await tx.listing.updateMany({
        where: { id: { in: [current.requesterItemId, current.ownerItemId] }, activeSwapId: current.id },
        data: { swapStatus: "AVAILABLE", activeSwapId: null, isPublic: true, swapCompletedAt: null, archiveAfter: null, deleteEligibleAt: null },
      });
    }

    const updated = await tx.swap.update({
      where: { id: dispute.swapId },
      data: { status: nextStatus, lastActionAt: new Date(), completedAt: nextStatus === "COMPLETED" ? new Date() : current.completedAt },
      include: swapInclude(),
    });

    if (nextStatus === "CANCELLED") await reviveEligibleExpiredSwaps(tx, updated, user.id);
    return formatSwap(updated);
  });
}

export async function archiveCompletedSwapItems(id, user) {
  return prisma.$transaction(async (tx) => {
    const swap = await loadSwap(id, tx);
    await assertParticipant(swap, user);

    if (swap.status !== "COMPLETED") {
      throw new Error("Only completed swap items can be archived");
    }

    const now = new Date();
    await tx.listing.updateMany({
      where: { id: { in: [swap.requesterItemId, swap.ownerItemId] } },
      data: { swapStatus: "ARCHIVED", isPublic: false, archivedAt: now },
    });

    const updated = await tx.swap.update({
      where: { id },
      data: { itemsDeletedAt: now, archivedAt: now, lastActionAt: now },
      include: swapInclude(),
    });

    await addEvent(tx, id, user.id, "items_archived");
    return formatSwap(updated);
  });
}
