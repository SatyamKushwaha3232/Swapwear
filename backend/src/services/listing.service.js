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

const DEV_FALLBACK_LISTINGS = [
  {
    id: "demo-1",
    title: "Vintage Denim Jacket",
    owner: "Rohit Sharma",
    owner_name: "Rohit Sharma",
    brand: "Levi's",
    size: "M",
    condition: "Excellent",
    location: "Mumbai",
    category: "Jackets",
    points: 1200,
    likes: 248,
    views: "3.2k",
    video: "https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4",
    images: [
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=900&auto=format&fit=crop",
    ],
    image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "demo-2",
    title: "Beige Oversized Hoodie",
    owner: "Sneha Patel",
    owner_name: "Sneha Patel",
    brand: "Zara",
    size: "L",
    condition: "Good",
    location: "Delhi",
    category: "Hoodies",
    points: 900,
    likes: 186,
    views: "2.1k",
    video: "",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578681994506-b8f463449011?q=80&w=900&auto=format&fit=crop",
    ],
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "demo-3",
    title: "Minimal White Sneakers",
    owner: "Aman Verma",
    owner_name: "Aman Verma",
    brand: "Adidas",
    size: "42",
    condition: "Like New",
    location: "Bangalore",
    category: "Sneakers",
    points: 1500,
    likes: 322,
    views: "4.7k",
    video: "https://videos.pexels.com/video-files/4812207/4812207-hd_1920_1080_25fps.mp4",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=900&auto=format&fit=crop",
    ],
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "demo-4",
    title: "Floral Summer Dress",
    owner: "Priya Mehta",
    owner_name: "Priya Mehta",
    brand: "Mango",
    size: "S",
    condition: "Like New",
    location: "Chennai",
    category: "Dresses",
    points: 1300,
    likes: 211,
    views: "2.8k",
    video: "",
    images: [
      "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=900&auto=format&fit=crop",
    ],
    image: "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=900&auto=format&fit=crop",
  },
].map((item) => ({
  ...item,
  description: "Demo listing shown while local PostgreSQL is unavailable.",
  user_id: null,
  created_at: new Date().toISOString(),
  swap_status: "available",
  active_swap_id: null,
  swap_completed_at: null,
  archive_after: null,
  archived_at: null,
  delete_eligible_at: null,
  is_public: true,
  is_available_for_swap: true,
  source: "demo-fallback",
}));

function isDatabaseUnavailable(error) {
  const message = String(error?.message || "");
  return (
    error?.code === "P1001" ||
    error?.name === "PrismaClientInitializationError" ||
    message.includes("Can't reach database server") ||
    message.includes("Environment variable not found: DATABASE_URL")
  );
}

function filterFallbackListings(options = {}) {
  let items = [...DEV_FALLBACK_LISTINGS];

  if (options.query) {
    const query = String(options.query).toLowerCase();
    items = items.filter((item) =>
      [item.title, item.brand, item.category, item.location, item.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }

  if (options.category && options.category !== "All") {
    items = items.filter((item) => item.category === options.category);
  }

  if (options.size && options.size !== "All") {
    items = items.filter((item) => item.size === options.size);
  }

  if (options.condition && options.condition !== "All") {
    items = items.filter((item) => item.condition === options.condition);
  }

  if (options.maxPoints) {
    const maxPoints = Number(options.maxPoints) || 5000;
    items = items.filter((item) => item.points <= maxPoints);
  }

  if (options.sort === "points-low") return items.sort((a, b) => a.points - b.points);
  if (options.sort === "points-high") return items.sort((a, b) => b.points - a.points);
  if (options.sort === "liked") return items.sort((a, b) => b.likes - a.likes);
  if (options.sort === "brand") return items.sort((a, b) => a.brand.localeCompare(b.brand));

  return items;
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

  try {
    const listings = await prisma.listing.findMany({
      where,
      orderBy,
      include: { user: { include: { profile: true } } },
    });

    return listings.map(formatListing);
  } catch (error) {
    if (isDatabaseUnavailable(error) && appConfig.env !== "production") {
      console.warn("Database unavailable; returning development listing fallback.");
      return filterFallbackListings(options);
    }

    throw error;
  }
}

export async function fetchListingById(id) {
  const fallbackListing = DEV_FALLBACK_LISTINGS.find((item) => item.id === String(id));
  if (fallbackListing) return fallbackListing;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: parseListingId(id) },
      include: { user: { include: { profile: true } } },
    });

    return listing ? formatListing(listing) : null;
  } catch (error) {
    if (isDatabaseUnavailable(error) && appConfig.env !== "production") {
      console.warn("Database unavailable; returning development listing fallback.");
      return DEV_FALLBACK_LISTINGS.find((item) => item.id === String(id)) || null;
    }

    throw error;
  }
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
