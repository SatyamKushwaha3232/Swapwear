import { prisma } from "../config/prisma.js";
import { fetchListingById } from "./listing.service.js";

function parseListingId(id) {
  try {
    return BigInt(id);
  } catch {
    const error = new Error("Invalid listing id");
    error.status = 400;
    throw error;
  }
}

async function formatWishlist(row = {}) {
  const listing = row.listing
    ? {
        id: String(row.listing.id),
        title: row.listing.title || "Untitled Item",
        owner: row.listing.ownerName || "SwapWear User",
        owner_name: row.listing.ownerName || "SwapWear User",
        brand: row.listing.brand || "Unknown Brand",
        size: row.listing.size || "Free",
        condition: row.listing.condition || "Good",
        location: row.listing.location || "India",
        category: row.listing.category || "Fashion",
        points: Number(row.listing.points) || 0,
        likes: Number(row.listing.likes) || 0,
        views: Number(row.listing.views) || 0,
        video: row.listing.video || "",
        images: Array.isArray(row.listing.images)
          ? row.listing.images
          : row.listing.image
          ? [row.listing.image]
          : [],
        image:
          (Array.isArray(row.listing.images) && row.listing.images[0]) ||
          row.listing.image ||
          "/icons.svg",
        description: row.listing.description || "",
        user_id: row.listing.userId,
        created_at: row.listing.createdAt?.toISOString?.() || row.listing.createdAt,
        swap_status: String(row.listing.swapStatus || "AVAILABLE").toLowerCase(),
        active_swap_id: row.listing.activeSwapId || null,
        is_public: row.listing.isPublic !== false,
        is_available_for_swap:
          row.listing.swapStatus === "AVAILABLE" && row.listing.isPublic !== false,
      }
    : null;

  return {
    id: String(row.id),
    user_id: row.userId,
    listing_id: String(row.listingId),
    listing,
    created_at: row.createdAt?.toISOString?.() || row.createdAt,
  };
}

export async function getWishlist(userId) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { listing: true },
  });

  return Promise.all(items.map(formatWishlist));
}

export async function addWishlist(payload, user) {
  const listingId = parseListingId(payload.listing_id || payload.listingId);
  const listing = await fetchListingById(listingId);

  if (!listing) {
    const error = new Error("Listing not found");
    error.status = 404;
    throw error;
  }

  if (listing.user_id === user.id) {
    const error = new Error("You cannot wishlist your own item");
    error.status = 400;
    throw error;
  }

  const item = await prisma.wishlistItem.upsert({
    where: { userId_listingId: { userId: user.id, listingId } },
    update: {},
    create: { userId: user.id, listingId },
    include: { listing: true },
  });

  return formatWishlist(item);
}

export async function removeWishlist(id, user) {
  const wishlistId = parseListingId(id);
  const existing = await prisma.wishlistItem.findUnique({
    where: { id: wishlistId },
  });

  if (!existing) return true;

  if (existing.userId !== user.id && !["ADMIN", "OWNER"].includes(user.role)) {
    const error = new Error("You can only remove your own wishlist item");
    error.status = 403;
    throw error;
  }

  await prisma.wishlistItem.delete({ where: { id: wishlistId } });
  return true;
}
