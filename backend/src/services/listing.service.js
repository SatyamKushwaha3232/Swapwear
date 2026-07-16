import fs from "node:fs/promises";
import path from "node:path";

import { appConfig } from "../config/app.config.js";
import { prisma } from "../config/prisma.js";

const SWAP_STATUS_TO_API = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  SWAPPED: "swapped",
  ARCHIVED: "archived",
  REMOVED: "removed",
  BLOCKED: "blocked",
};

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
    views: item.views || "0",
    video: item.video || "",
    images: imageList,
    image: imageList[0] || "",
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

function safeFileName(file) {
  const ext = file.originalname.split(".").pop() || "bin";
  const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, "") || "bin";
  return `${Date.now()}-${Math.random().toString(36).slice(2)}.${cleanExt}`;
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
  if (Array.isArray(images)) return images.filter(Boolean);
  if (typeof images === "string" && images) return [images];
  return [];
}

export async function uploadListingFile(file, folder, userId) {
  const safeFolder = folder === "videos" ? "videos" : "images";
  const relativeFolder = path.join("listings", userId, safeFolder);
  const absoluteFolder = path.resolve(appConfig.uploadDir, relativeFolder);

  await fs.mkdir(absoluteFolder, { recursive: true });

  const fileName = safeFileName(file);
  const absolutePath = path.join(absoluteFolder, fileName);
  await fs.writeFile(absolutePath, file.buffer);

  const publicPath = ["listings", userId, safeFolder, fileName]
    .map(encodeURIComponent)
    .join("/");

  return `${appConfig.publicFileBaseUrl}/${publicPath}`;
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
  const listing = await prisma.listing.findUnique({
    where: { id: parseListingId(id) },
    include: { user: { include: { profile: true } } },
  });

  return listing ? formatListing(listing) : null;
}

export async function createListingInDb(payload, user) {
  const imageList = ensureImageList(payload.images);

  const listing = await prisma.listing.create({
    data: {
      title: payload.title,
      brand: payload.brand || null,
      category: payload.category || "Fashion",
      size: payload.size || null,
      condition: payload.condition || "Good",
      location: payload.location || null,
      points: Number(payload.points) || 0,
      description: payload.description || null,
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
