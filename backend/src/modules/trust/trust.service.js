import { prisma } from "../../config/prisma.js";

function parseBigInt(id, label = "id") {
  if (!id) return null;
  try {
    return BigInt(id);
  } catch {
    const error = new Error(`Invalid ${label}`);
    error.status = 400;
    throw error;
  }
}

function isAdmin(user) {
  return ["ADMIN", "OWNER", "MODERATOR"].includes(user.role);
}

function formatReport(report = {}) {
  return {
    id: String(report.id),
    reporter_id: report.reporterId,
    reported_user_id: report.reportedUserId,
    listing_id: report.listingId ? String(report.listingId) : null,
    swap_id: report.swapId,
    report_type: report.reportType,
    reason: report.reason,
    status: String(report.status || "OPEN").toLowerCase(),
    listing_title: report.listing?.title || "",
    listing_image:
      (Array.isArray(report.listing?.images) && report.listing.images[0]) ||
      report.listing?.image ||
      "",
    reported_user_name:
      report.reportedUser?.profile?.fullName ||
      report.reportedUser?.profile?.username ||
      report.reportedUser?.email ||
      "",
    created_at: report.createdAt?.toISOString?.() || report.createdAt,
    resolved_at: report.resolvedAt?.toISOString?.() || report.resolvedAt || null,
  };
}

function formatReview(review = {}) {
  return {
    id: String(review.id),
    swap_id: review.swapId,
    reviewer_id: review.reviewerId,
    reviewee_id: review.revieweeId,
    rating: Number(review.rating) || 0,
    comment: review.comment || "",
    description: review.comment || "",
    reviewer_name:
      review.reviewer?.profile?.fullName ||
      review.reviewer?.profile?.username ||
      review.reviewer?.email?.split("@")[0] ||
      "SwapWear User",
    created_at: review.createdAt?.toISOString?.() || review.createdAt,
  };
}

async function recalculateUserRating(tx, userId) {
  const aggregate = await tx.review.aggregate({
    where: { revieweeId: userId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await tx.profile.upsert({
    where: { userId },
    update: {
      rating: aggregate._avg.rating || 0,
      totalSwaps: aggregate._count.rating || 0,
    },
    create: {
      userId,
      rating: aggregate._avg.rating || 0,
      totalSwaps: aggregate._count.rating || 0,
      provider: "email",
    },
  });
}

export async function createMarketplaceReport(payload = {}, user) {
  const listingId = parseBigInt(payload.listingId || payload.listing_id, "listing id");
  const swapId = payload.swapId || payload.swap_id || null;
  const reportedUserId = payload.reportedUserId || payload.reported_user_id || null;

  if (listingId) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      const error = new Error("Listing not found");
      error.status = 404;
      throw error;
    }
    if (listing.userId === user.id) {
      const error = new Error("You cannot report your own listing");
      error.status = 400;
      throw error;
    }
  }

  if (swapId) {
    const swap = await prisma.swap.findUnique({ where: { id: swapId } });
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

  const report = await prisma.report.create({
    data: {
      reporterId: user.id,
      reportedUserId,
      listingId,
      swapId,
      reportType: payload.reportType || payload.report_type || "general",
      reason: payload.reason || "Marketplace issue reported",
    },
    include: {
      listing: true,
      reportedUser: { include: { profile: true } },
    },
  });

  return formatReport(report);
}

export async function submitSwapReview(swapId, rating, comment, user) {
  const numericRating = Math.max(1, Math.min(5, Number(rating) || 5));
  const swap = await prisma.swap.findUnique({ where: { id: swapId } });

  if (!swap) {
    const error = new Error("Swap not found");
    error.status = 404;
    throw error;
  }

  if (swap.status !== "COMPLETED") {
    const error = new Error("Only completed swaps can be reviewed");
    error.status = 400;
    throw error;
  }

  if (swap.requesterId !== user.id && swap.ownerId !== user.id) {
    const error = new Error("You are not part of this swap");
    error.status = 403;
    throw error;
  }

  const revieweeId = swap.requesterId === user.id ? swap.ownerId : swap.requesterId;

  return prisma.$transaction(async (tx) => {
    const review = await tx.review.upsert({
      where: { swapId_reviewerId: { swapId, reviewerId: user.id } },
      update: { rating: numericRating, comment: comment || null },
      create: {
        swapId,
        reviewerId: user.id,
        revieweeId,
        rating: numericRating,
        comment: comment || null,
      },
      include: { reviewer: { include: { profile: true } } },
    });

    await recalculateUserRating(tx, revieweeId);
    return formatReview(review);
  });
}

export async function getUserReviews(userId) {
  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: { reviewer: { include: { profile: true } } },
  });

  return reviews.map(formatReview);
}

export async function getAdminDashboardData(user) {
  if (!isAdmin(user)) {
    const error = new Error("Admin access required");
    error.status = 403;
    throw error;
  }

  const [
    usersCount,
    listingsCount,
    availableListings,
    completedSwaps,
    openReports,
    openDisputes,
    users,
    reports,
    averageRating,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { swapStatus: "AVAILABLE", isPublic: true } }),
    prisma.swap.count({ where: { status: "COMPLETED" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.swapDispute.count({ where: { status: "OPEN" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        profile: true,
        _count: { select: { reportsAgainst: true, requesterSwaps: true, ownerSwaps: true } },
      },
    }),
    prisma.report.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        listing: true,
        reportedUser: { include: { profile: true } },
      },
    }),
    prisma.profile.aggregate({ _avg: { rating: true } }),
  ]);

  return {
    stats: {
      users: usersCount,
      listings: listingsCount,
      available_listings: availableListings,
      successful_swaps: completedSwaps,
      open_reports: openReports,
      open_disputes: openDisputes,
      trust_score: Number(averageRating._avg.rating || 0).toFixed(1),
    },
    users: users.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.profile?.fullName || row.profile?.username || row.email?.split("@")[0],
      avatar_url: row.profile?.avatarUrl || "",
      status: String(row.status || "ACTIVE").toLowerCase(),
      reports: row._count.reportsAgainst,
      swaps: row._count.requesterSwaps + row._count.ownerSwaps,
      rating: Number(row.profile?.rating || 0).toFixed(1),
    })),
    reports: reports.map(formatReport),
  };
}

export async function resolveMarketplaceReport(reportId, status, note, user) {
  if (!isAdmin(user)) {
    const error = new Error("Admin access required");
    error.status = 403;
    throw error;
  }

  const nextStatus = String(status || "resolved").toUpperCase();
  const allowed = ["RESOLVED", "DISMISSED", "BLOCKED"];
  if (!allowed.includes(nextStatus)) {
    const error = new Error("Invalid report status");
    error.status = 400;
    throw error;
  }

  const id = parseBigInt(reportId, "report id");
  const report = await prisma.report.findUnique({ where: { id }, include: { listing: true } });
  if (!report) {
    const error = new Error("Report not found");
    error.status = 404;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    if (nextStatus === "BLOCKED" && report.listingId) {
      await tx.listing.update({
        where: { id: report.listingId },
        data: { swapStatus: "BLOCKED", isPublic: false },
      });
    }

    const updated = await tx.report.update({
      where: { id },
      data: {
        status: nextStatus,
        resolvedAt: new Date(),
        reason: note ? `${report.reason}\n\nAdmin note: ${note}` : report.reason,
      },
      include: {
        listing: true,
        reportedUser: { include: { profile: true } },
      },
    });

    return formatReport(updated);
  });
}
