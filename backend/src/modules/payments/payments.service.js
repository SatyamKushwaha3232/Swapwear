import { appConfig } from "../../config/app.config.js";
import { prisma } from "../../config/prisma.js";

const PAYMENT_PURPOSES = ["PREMIUM", "LISTING_BOOST", "PLATFORM_FEE", "DELIVERY_FEE"];
const PAYMENT_STATUSES = ["PENDING", "AUTHORIZED", "PAID", "FAILED", "REFUNDED", "CANCELLED"];

const DEFAULT_AMOUNTS = {
  PREMIUM: 19900,
  LISTING_BOOST: 4900,
  PLATFORM_FEE: 2900,
  DELIVERY_FEE: 7900,
};

function isAdmin(user) {
  return ["ADMIN", "OWNER", "MODERATOR"].includes(user.role);
}

function normalizePurpose(value) {
  const purpose = String(value || "").toUpperCase();
  if (!PAYMENT_PURPOSES.includes(purpose)) {
    const error = new Error("Invalid payment purpose");
    error.status = 400;
    throw error;
  }
  return purpose;
}

function normalizeStatus(value) {
  const status = String(value || "").toUpperCase();
  if (!PAYMENT_STATUSES.includes(status)) {
    const error = new Error("Invalid payment status");
    error.status = 400;
    throw error;
  }
  return status;
}

function parseAmount(amount, purpose) {
  const value = Number(amount || 0);
  return value > 0 ? Math.round(value) : DEFAULT_AMOUNTS[purpose];
}

function formatPayment(payment = {}) {
  return {
    id: payment.id,
    user_id: payment.userId,
    swap_id: payment.swapId,
    purpose: String(payment.purpose || "PREMIUM").toLowerCase(),
    provider: payment.provider || "manual",
    provider_order_id: payment.providerOrderId || "",
    provider_payment_id: payment.providerPaymentId || "",
    amount: Number(payment.amount) || 0,
    currency: payment.currency || "INR",
    status: String(payment.status || "PENDING").toLowerCase(),
    metadata: payment.metadata || {},
    user: payment.user
      ? {
          id: payment.user.id,
          email: payment.user.email,
          name:
            payment.user.profile?.fullName ||
            payment.user.profile?.username ||
            payment.user.email?.split("@")[0],
        }
      : null,
    created_at: payment.createdAt?.toISOString?.() || payment.createdAt,
    updated_at: payment.updatedAt?.toISOString?.() || payment.updatedAt,
  };
}

async function applyPaidSideEffects(tx, payment) {
  if (payment.purpose === "PREMIUM") {
    await tx.profile.upsert({
      where: { userId: payment.userId },
      update: { isPremium: true },
      create: {
        userId: payment.userId,
        isPremium: true,
        provider: "email",
      },
    });
  }

  if (payment.purpose === "LISTING_BOOST") {
    const listingId = payment.metadata?.listingId || payment.metadata?.listing_id;
    if (listingId) {
      await tx.listing.update({
        where: { id: BigInt(listingId) },
        data: { likes: { increment: 1 } },
      });
    }
  }
}

export async function createPaymentOrder(payload, user) {
  const purpose = normalizePurpose(payload.purpose);
  const amount = parseAmount(payload.amount, purpose);
  const provider = appConfig.payments.provider || "manual";

  if (payload.swapId) {
    const swap = await prisma.swap.findUnique({ where: { id: payload.swapId } });
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
  }

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      swapId: payload.swapId || null,
      purpose,
      provider,
      providerOrderId: `${provider}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      amount,
      currency: payload.currency || "INR",
      status: "PENDING",
      metadata: payload.metadata || {},
    },
  });

  return {
    payment: formatPayment(payment),
    checkout: {
      provider,
      mode: provider === "manual" ? "manual_confirmation" : "provider_checkout",
      amount,
      currency: payment.currency,
    },
  };
}

export async function listMyPayments(user) {
  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return payments.map(formatPayment);
}

export async function listAllPayments(user) {
  if (!isAdmin(user)) {
    const error = new Error("Admin access required");
    error.status = 403;
    throw error;
  }

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { include: { profile: true } } },
  });

  return payments.map(formatPayment);
}

export async function updatePaymentStatus(paymentId, status, user, metadata = {}) {
  const nextStatus = normalizeStatus(status);
  const existing = await prisma.payment.findUnique({ where: { id: paymentId } });

  if (!existing) {
    const error = new Error("Payment not found");
    error.status = 404;
    throw error;
  }

  if (existing.userId !== user.id && !isAdmin(user)) {
    const error = new Error("You can only update your own manual payment");
    error.status = 403;
    throw error;
  }

  if (!isAdmin(user) && nextStatus !== "CANCELLED") {
    const error = new Error("Payment success must be confirmed by provider/admin");
    error.status = 403;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: nextStatus,
        providerPaymentId: metadata.providerPaymentId || metadata.provider_payment_id || existing.providerPaymentId,
        metadata: { ...(existing.metadata || {}), ...metadata },
      },
    });

    if (nextStatus === "PAID") {
      await applyPaidSideEffects(tx, payment);
    }

    return formatPayment(payment);
  });
}

export async function handlePaymentWebhook(payload) {
  const paymentId = payload.paymentId || payload.payment_id || payload.id;
  const status = normalizeStatus(payload.status || "PAID");

  if (!paymentId) {
    const error = new Error("Payment id is required");
    error.status = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!existing) {
      const error = new Error("Payment not found");
      error.status = 404;
      throw error;
    }

    const payment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status,
        providerPaymentId: payload.providerPaymentId || payload.provider_payment_id || existing.providerPaymentId,
        metadata: { ...(existing.metadata || {}), webhook: payload },
      },
    });

    if (status === "PAID") {
      await applyPaidSideEffects(tx, payment);
    }

    return formatPayment(payment);
  });
}
