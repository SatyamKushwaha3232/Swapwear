import { prisma } from "../../config/prisma.js";

const DELIVERY_LEGS = ["requester_to_owner", "owner_to_requester"];
const DELIVERY_STATUSES = [
  "ADDRESS_PENDING",
  "PICKUP_PENDING",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
  "RETURNED",
  "DISPUTED",
];

function isAdmin(user) {
  return ["ADMIN", "OWNER", "MODERATOR"].includes(user.role);
}

function formatAddress(address = {}) {
  return {
    id: address.id,
    user_id: address.userId,
    label: address.label || "",
    full_name: address.fullName || "",
    phone: address.phone || "",
    line1: address.line1 || "",
    line2: address.line2 || "",
    city: address.city || "",
    state: address.state || "",
    postal_code: address.postalCode || "",
    country: address.country || "India",
    is_default: Boolean(address.isDefault),
    created_at: address.createdAt?.toISOString?.() || address.createdAt,
    updated_at: address.updatedAt?.toISOString?.() || address.updatedAt,
  };
}

function formatDelivery(order = {}) {
  return {
    id: order.id,
    swap_id: order.swapId,
    leg: order.leg,
    requester_id: order.requesterId,
    owner_id: order.ownerId,
    method: String(order.method || "COURIER").toLowerCase(),
    status: String(order.status || "ADDRESS_PENDING").toLowerCase(),
    pickup_address_id: order.pickupAddressId,
    drop_address_id: order.dropAddressId,
    pickup_address: order.pickupAddress ? formatAddress(order.pickupAddress) : null,
    drop_address: order.dropAddress ? formatAddress(order.dropAddress) : null,
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

function assertAddressPayload(payload = {}) {
  const required = ["fullName", "phone", "line1", "city", "state", "postalCode"];
  const missing = required.filter((field) => !String(payload[field] || "").trim());

  if (missing.length) {
    const error = new Error("Please complete all required address fields");
    error.status = 400;
    throw error;
  }
}

async function loadSwapForParticipant(swapId, user, tx = prisma) {
  const swap = await tx.swap.findUnique({
    where: { id: swapId },
    include: { deliveries: true },
  });

  if (!swap) {
    const error = new Error("Swap not found");
    error.status = 404;
    throw error;
  }

  if (swap.requesterId !== user.id && swap.ownerId !== user.id && !isAdmin(user)) {
    const error = new Error("You are not part of this swap");
    error.status = 403;
    throw error;
  }

  return swap;
}

async function getDefaultAddress(userId, tx = prisma) {
  return tx.address.findFirst({
    where: { userId, isDefault: true },
    orderBy: { updatedAt: "desc" },
  });
}

function statusForAddresses(pickupAddressId, dropAddressId, method = "COURIER") {
  if (method === "LOCAL") return "NOT_REQUIRED";
  return pickupAddressId && dropAddressId ? "PICKUP_PENDING" : "ADDRESS_PENDING";
}

async function ensureDeliveryOrders(tx, swap, method = "COURIER") {
  const requesterAddress = await getDefaultAddress(swap.requesterId, tx);
  const ownerAddress = await getDefaultAddress(swap.ownerId, tx);

  const legs = [
    {
      leg: "requester_to_owner",
      pickupAddressId: requesterAddress?.id || null,
      dropAddressId: ownerAddress?.id || null,
    },
    {
      leg: "owner_to_requester",
      pickupAddressId: ownerAddress?.id || null,
      dropAddressId: requesterAddress?.id || null,
    },
  ];

  const orders = [];

  for (const leg of legs) {
    orders.push(
      await tx.deliveryOrder.upsert({
        where: { swapId_leg: { swapId: swap.id, leg: leg.leg } },
        update: {
          method,
          pickupAddressId: leg.pickupAddressId,
          dropAddressId: leg.dropAddressId,
          status: statusForAddresses(leg.pickupAddressId, leg.dropAddressId, method),
        },
        create: {
          swapId: swap.id,
          leg: leg.leg,
          requesterId: swap.requesterId,
          ownerId: swap.ownerId,
          method,
          pickupAddressId: leg.pickupAddressId,
          dropAddressId: leg.dropAddressId,
          status: statusForAddresses(leg.pickupAddressId, leg.dropAddressId, method),
        },
        include: { pickupAddress: true, dropAddress: true },
      })
    );
  }

  return orders;
}

export async function listAddresses(user) {
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return addresses.map(formatAddress);
}

export async function createAddress(payload, user) {
  assertAddressPayload(payload);

  return prisma.$transaction(async (tx) => {
    if (payload.isDefault !== false) {
      await tx.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await tx.address.create({
      data: {
        userId: user.id,
        label: payload.label || "Default",
        fullName: payload.fullName,
        phone: payload.phone,
        line1: payload.line1,
        line2: payload.line2 || null,
        city: payload.city,
        state: payload.state,
        postalCode: payload.postalCode,
        country: payload.country || "India",
        isDefault: payload.isDefault !== false,
      },
    });

    return formatAddress(address);
  });
}

export async function setDefaultAddress(addressId, user) {
  const existing = await prisma.address.findUnique({ where: { id: addressId } });
  if (!existing || existing.userId !== user.id) {
    const error = new Error("Address not found");
    error.status = 404;
    throw error;
  }

  await prisma.address.updateMany({
    where: { userId: user.id },
    data: { isDefault: false },
  });

  const address = await prisma.address.update({
    where: { id: addressId },
    data: { isDefault: true },
  });

  return formatAddress(address);
}

export async function getSwapDelivery(swapId, user) {
  const swap = await loadSwapForParticipant(swapId, user);
  const orders = await prisma.deliveryOrder.findMany({
    where: { swapId: swap.id },
    orderBy: { leg: "asc" },
    include: { pickupAddress: true, dropAddress: true },
  });

  return orders.map(formatDelivery);
}

export async function setupSwapDelivery(swapId, payload, user) {
  const method = String(payload.method || "courier").toUpperCase();
  if (!["LOCAL", "COURIER", "OTHER"].includes(method)) {
    const error = new Error("Invalid delivery method");
    error.status = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const swap = await loadSwapForParticipant(swapId, user, tx);

    const orders = await ensureDeliveryOrders(tx, swap, method);

    await tx.swap.update({
      where: { id: swap.id },
      data: { deliveryMethod: method, lastActionAt: new Date() },
    });

    await tx.swapEvent.create({
      data: {
        swapId: swap.id,
        actorId: user.id,
        eventType: "delivery_setup",
        metadata: { method: method.toLowerCase() },
      },
    });

    return orders.map(formatDelivery);
  });
}

export async function updateDeliveryStatus(orderId, status, user) {
  const nextStatus = String(status || "").toUpperCase();
  if (!DELIVERY_STATUSES.includes(nextStatus)) {
    const error = new Error("Invalid delivery status");
    error.status = 400;
    throw error;
  }

  const order = await prisma.deliveryOrder.findUnique({
    where: { id: orderId },
    include: { swap: true },
  });

  if (!order) {
    const error = new Error("Delivery order not found");
    error.status = 404;
    throw error;
  }

  await loadSwapForParticipant(order.swapId, user);

  if (!isAdmin(user) && !["PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED", "DISPUTED"].includes(nextStatus)) {
    const error = new Error("Only support can set this delivery status");
    error.status = 403;
    throw error;
  }

  const updated = await prisma.deliveryOrder.update({
    where: { id: orderId },
    data: { status: nextStatus },
    include: { pickupAddress: true, dropAddress: true },
  });

  await prisma.swapEvent.create({
    data: {
      swapId: order.swapId,
      actorId: user.id,
      eventType: "delivery_status_updated",
      metadata: { orderId, status: nextStatus.toLowerCase(), leg: order.leg },
    },
  });

  return formatDelivery(updated);
}

export async function updateDeliveryTracking(orderId, payload, user) {
  const order = await prisma.deliveryOrder.findUnique({ where: { id: orderId } });

  if (!order) {
    const error = new Error("Delivery order not found");
    error.status = 404;
    throw error;
  }

  await loadSwapForParticipant(order.swapId, user);

  const updated = await prisma.deliveryOrder.update({
    where: { id: orderId },
    data: {
      courierProvider: payload.courierProvider || payload.courier_provider || order.courierProvider,
      trackingNumber: payload.trackingNumber || payload.tracking_number || order.trackingNumber,
      trackingUrl: payload.trackingUrl || payload.tracking_url || order.trackingUrl,
      notes: payload.notes ?? order.notes,
      status: order.status === "ADDRESS_PENDING" ? "PICKUP_PENDING" : order.status,
    },
    include: { pickupAddress: true, dropAddress: true },
  });

  await prisma.swapEvent.create({
    data: {
      swapId: order.swapId,
      actorId: user.id,
      eventType: "delivery_tracking_updated",
      metadata: { orderId, leg: order.leg },
    },
  });

  return formatDelivery(updated);
}

export async function addDeliveryProof(orderId, payload, user) {
  const order = await prisma.deliveryOrder.findUnique({ where: { id: orderId } });

  if (!order) {
    const error = new Error("Delivery order not found");
    error.status = 404;
    throw error;
  }

  await loadSwapForParticipant(order.swapId, user);

  const updated = await prisma.deliveryOrder.update({
    where: { id: orderId },
    data: {
      proofUrl: payload.proofUrl || payload.proof_url || order.proofUrl,
      notes: payload.notes ?? order.notes,
    },
    include: { pickupAddress: true, dropAddress: true },
  });

  await prisma.swapEvent.create({
    data: {
      swapId: order.swapId,
      actorId: user.id,
      eventType: "delivery_proof_added",
      metadata: { orderId, leg: order.leg },
    },
  });

  return formatDelivery(updated);
}

export async function assertCourierReadyForHandover(swapId) {
  const swap = await prisma.swap.findUnique({
    where: { id: swapId },
    include: { deliveries: true },
  });

  if (!swap || swap.deliveryMethod !== "COURIER") return true;

  const ready =
    swap.deliveries.length >= 2 &&
    swap.deliveries.every(
      (order) =>
        order.pickupAddressId &&
        order.dropAddressId &&
        order.status !== "ADDRESS_PENDING"
    );

  if (!ready) {
    const error = new Error("Both users must add delivery addresses before shipping");
    error.status = 400;
    throw error;
  }

  return true;
}
