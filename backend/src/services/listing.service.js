import { appConfig } from "../config/app.config.js";
import { prisma } from "../config/prisma.js";
import { uploadToCloudinary } from "./cloudinary.service.js";

const SWAP_STATUS_TO_API = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  SWAPPED: "swapped",
  ARCHIVED: "archived",
  REMOVED: "removed",
  BLOCKED: "blocked",
};

const EDITABLE_STATUSES = new Set(["AVAILABLE"]);

function normalizeMediaUrl(url) {
  if (!url) return "";
  const value = String(url);
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/uploads/")) {
    return `${appConfig.publicFileBaseUrl.replace(/\/uploads\/?$/, "/uploads")}${value.slice("/uploads".length)}`;
  }
  return value;
}

function formatListing(item = {}) {
  const ownerName =
    item.ownerName ||
    item.user?.profile?.fullName ||
    item.user?.profile?.username ||
    item.user?.email?.split("@")[0] ||
    "SwapWear User";

  const imageList =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.image
      ? [item.image]
      : [];
  const mediaImages = imageList.map(normalizeMediaUrl).filter(Boolean);

  return {
    id: String(item.id),
    title: item.title || "Untitled Item",
    owner: ownerName,
    owner_name: ownerName,
    brand: item.brand || "Unknown Brand",
    size: item.size || "Free",
    condition: item.condition || "Good",
    location: item.location || "India",
    category: item.category || "Fashion",
    points: Number(item.points) || 0,
    likes: Number(item.likes) || 0,
    views: Number(item.views) || 0,
    video: normalizeMediaUrl(item.video || ""),
    images: mediaImages,
    image: mediaImages[0] || "",
    description: item.description || "",
    user_id: item.userId || null,
    created_at: item.createdAt?.toISOString?.() || item.createdAt || null,
    swap_status: SWAP_STATUS_TO_API[item.swapStatus] || "available",
    active_swap_id: item.activeSwapId || null,
    swap_completed_at:
      item.swapCompletedAt?.toISOString?.() || item.swapCompletedAt || null,
    archive_after: item.archiveAfter?.toISOString?.() || item.archiveAfter || null,
    archived_at: item.archivedAt?.toISOString?.() || item.archivedAt || null,
    delete_eligible_at:
      item.deleteEligibleAt?.toISOString?.() || item.deleteEligibleAt || null,
    is_public: item.isPublic !== false,
    is_available_for_swap:
      item.swapStatus === "AVAILABLE" && item.isPublic !== false,
  };
}

function parseListingId(id) {
  try {
    return BigInt(id);
  } catch {
    const error = new Error("Invalid listing id");
    error.status = 400;
    throw error;
  }
}

function ensureImageList(images) {
  if (Array.isArray(images)) return [...new Set(images.map(normalizeMediaUrl).filter(Boolean))].slice(0, 5);
  if (typeof images === "string" && images) return [images];
  return [];
}

function validateListingPayload(payload = {}, { partial = false } = {}) {
  const clean = {
    title: String(payload.title || "").trim(),
    brand: String(payload.brand || "").trim(),
    category: String(payload.category || "Fashion").trim(),
    size: String(payload.size || "").trim(),
    condition: String(payload.condition || "Good").trim(),
    location: String(payload.location || "").trim(),
    points: Number(payload.points),
    description: String(payload.description || "").trim(),
  };

  if (!partial || payload.title !== undefined) {
    if (!clean.title || clean.title.length < 3) {
      const error = new Error("Listing title must be at least 3 characters");
      error.status = 400;
      throw error;
    }
  }

  if (!partial || payload.brand !== undefined) {
    if (!clean.brand) {
      const error = new Error("Brand is required");
      error.status = 400;
      throw error;
    }
  }

  if (!partial || payload.size !== undefined) {
    if (!clean.size) {
      const error = new Error("Size is required");
      error.status = 400;
      throw error;
    }
  }

  if (!partial || payload.location !== undefined) {
    if (!clean.location) {
      const error = new Error("Location is required");
      error.status = 400;
      throw error;
    }
  }

  if (!Number.isFinite(clean.points) || clean.points < 0 || clean.points > 5000) {
    const error = new Error("Points must be between 0 and 5000");
    error.status = 400;
    throw error;
  }

  if (clean.description.length > 500) {
    const error = new Error("Description must be 500 characters or less");
    error.status = 400;
    throw error;
  }

  return clean;
}

export async function uploadListingFile(file, folder, userId) {
  const safeFolder = folder === "videos" ? "videos" : "images";
  const { url } = await uploadToCloudinary(file, {
    folder: `swapwear/listings/${userId}/${safeFolder}`,
  });
  return url;
}

export async function fetchListings(userId = null, options = {}) {
  const where = {};

  if (userId) where.userId = userId;

  if (options.onlyAvailable !== false) {
    where.swapStatus = "AVAILABLE";
    where.isPublic = true;
  }

  if (options.query) {
    where.OR = [
      { title: { contains: options.query, mode: "insensitive" } },
      { brand: { contains: options.query, mode: "insensitive" } },
      { category: { contains: options.query, mode: "insensitive" } },
      { location: { contains: options.query, mode: "insensitive" } },
      { description: { contains: options.query, mode: "insensitive" } },
    ];
  }

  if (options.category && options.category !== "All") {
    where.category = options.category;
  }

  if (options.size && options.size !== "All") {
    where.size = options.size;
  }

  if (options.condition && options.condition !== "All") {
    where.condition = options.condition;
  }

  if (options.maxPoints) {
    where.points = { lte: Number(options.maxPoints) || 5000 };
  }

  const orderBy =
    options.sort === "points-low"
      ? { points: "asc" }
      : options.sort === "points-high"
      ? { points: "desc" }
      : options.sort === "liked"
      ? { likes: "desc" }
      : options.sort === "brand"
      ? { brand: "asc" }
      : { createdAt: "desc" };

  const listings = await prisma.listing.findMany({
    where,
    orderBy,
    include: { user: { include: { profile: true } } },
  });

  return listings.map(formatListing);
}

export async function fetchListingById(id) {
  const listing = await prisma.listing.update({
    where: { id: parseListingId(id) },
    data: { views: { increment: 1 } },
    include: { user: { include: { profile: true } } },
  }).catch((error) => {
    if (error.code === "P2025") return null;
    throw error;
  });

  return listing ? formatListing(listing) : null;
}

export async function createListingInDb(payload, user) {
  const imageList = ensureImageList(payload.images);
  const clean = validateListingPayload(payload);

  if (imageList.length < 1) {
    const error = new Error("Upload at least 1 product image");
    error.status = 400;
    throw error;
  }

  const listing = await prisma.listing.create({
    data: {
      title: clean.title,
      brand: clean.brand,
      category: clean.category || "Fashion",
      size: clean.size,
      condition: clean.condition || "Good",
      location: clean.location,
      points: clean.points,
      description: clean.description || null,
      image: imageList[0] || "",
      images: imageList,
      video: payload.video || null,
      ownerName: payload.owner_name || payload.ownerName || null,
      userId: user.id,
      swapStatus: "AVAILABLE",
      isPublic: true,
    },
    include: { user: { include: { profile: true } } },
  });

  return formatListing(listing);
}

export async function updateListingInDb(id, payload, user) {
  const listingId = parseListingId(id);
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });

  if (!listing) {
    const error = new Error("Listing not found");
    error.status = 404;
    throw error;
  }

  if (listing.userId !== user.id && !["ADMIN", "OWNER"].includes(user.role)) {
    const error = new Error("You can only update your own listing");
    error.status = 403;
    throw error;
  }

  if (!EDITABLE_STATUSES.has(listing.swapStatus)) {
    const error = new Error("Reserved, swapped or archived listings cannot be edited");
    error.status = 409;
    throw error;
  }

  const clean = validateListingPayload(
    {
      title: payload.title ?? listing.title,
      brand: payload.brand ?? listing.brand,
      category: payload.category ?? listing.category,
      size: payload.size ?? listing.size,
      condition: payload.condition ?? listing.condition,
      location: payload.location ?? listing.location,
      points: payload.points ?? listing.points,
      description: payload.description ?? listing.description,
    },
    { partial: true }
  );
  const imageList = ensureImageList(payload.images);

  const updated = await prisma.listing.update({
    where: { id: listingId },
    data: {
      title: clean.title,
      brand: clean.brand,
      category: clean.category || "Fashion",
      size: clean.size,
      condition: clean.condition || "Good",
      location: clean.location,
      points: clean.points,
      description: clean.description || null,
      ...(imageList.length
        ? {
            image: imageList[0],
            images: imageList,
          }
        : {}),
      ...(payload.video !== undefined ? { video: payload.video || null } : {}),
    },
    include: { user: { include: { profile: true } } },
  });

  return formatListing(updated);
}

export async function deleteListingFromDb(id, user) {
  const listingId = parseListingId(id);
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });

  if (!listing) {
    const error = new Error("Listing not found");
    error.status = 404;
    throw error;
  }

  if (listing.userId !== user.id && !["ADMIN", "OWNER"].includes(user.role)) {
    const error = new Error("You can only delete your own listing");
    error.status = 403;
    throw error;
  }

  if (listing.swapStatus !== "AVAILABLE") {
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        swapStatus: "ARCHIVED",
        isPublic: false,
        archivedAt: new Date(),
      },
    });

    return true;
  }

  await prisma.listing.delete({ where: { id: listingId } });
  return true;
}
