import { backendRequest } from "../lib/backendApi";

export const LISTING_SWAP_STATUS = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  LOCKED: "locked",
  SWAPPED: "swapped",
  COMPLETED: "completed",
  ARCHIVED: "archived",
  REMOVED: "removed",
  BLOCKED: "blocked",
};

function formatListing(item = {}) {
  const imageList = Array.isArray(item.images) && item.images.length > 0 ? item.images : item.image ? [item.image] : [];
  const rawSwapStatus = item.swap_status || LISTING_SWAP_STATUS.AVAILABLE;
  const swapStatus = rawSwapStatus === LISTING_SWAP_STATUS.LOCKED ? LISTING_SWAP_STATUS.RESERVED : rawSwapStatus === LISTING_SWAP_STATUS.COMPLETED ? LISTING_SWAP_STATUS.SWAPPED : rawSwapStatus;

  return {
    id: item.id,
    title: item.title || "Untitled Item",
    owner: item.owner || item.owner_name || "SwapWear User",
    owner_name: item.owner_name || item.owner || "SwapWear User",
    brand: item.brand || "Unknown Brand",
    size: item.size || "Free",
    condition: item.condition || "Good",
    location: item.location || "India",
    category: item.category || "Fashion",
    points: Number(item.points) || 0,
    likes: Number(item.likes) || 0,
    views: Number(item.views) || 0,
    hasVideo: Boolean(item.video),
    video: item.video || "",
    images: imageList,
    image: imageList[0] || "/icons.svg",
    description: item.description || "",
    user_id: item.user_id || null,
    created_at: item.created_at || null,
    swap_status: swapStatus,
    active_swap_id: item.active_swap_id || null,
    swap_completed_at: item.swap_completed_at || null,
    archive_after: item.archive_after || item.delete_eligible_at || null,
    archived_at: item.archived_at || null,
    delete_eligible_at: item.delete_eligible_at || null,
    is_public: item.is_public !== false,
    is_available_for_swap: swapStatus === LISTING_SWAP_STATUS.AVAILABLE && item.is_public !== false,
  };
}

export async function cleanupExpiredCompletedListings() {
  return { success: true, skipped: true };
}

export async function getListings(userId = null, options = {}) {
  try {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    if (options.onlyAvailable === false || options.includeUnavailable) params.set("onlyAvailable", "false");
    if (options.query) params.set("q", options.query);
    if (options.category && options.category !== "All") params.set("category", options.category);
    if (options.size && options.size !== "All") params.set("size", options.size);
    if (options.condition && options.condition !== "All") params.set("condition", options.condition);
    if (options.maxPoints) params.set("maxPoints", options.maxPoints);
    if (options.sort) params.set("sort", options.sort);

    const data = await backendRequest(`/listings${params.toString() ? `?${params}` : ""}`);
    return { success: true, data: (data || []).map(formatListing) };
  } catch (err) {
    return { success: false, error: err.message || "Failed to fetch listings", data: [] };
  }
}

export async function getListingById(id, options = {}) {
  try {
    const data = await backendRequest(`/listings/${id}`);
    const listing = data ? formatListing(data) : null;
    if (listing && options.onlyAvailable && !listing.is_available_for_swap) return { success: true, data: null };
    return { success: true, data: listing };
  } catch (err) {
    return { success: false, error: err.message || "Failed to fetch listing", data: null };
  }
}

export async function getListingsByIds(ids = []) {
  try {
    const results = await Promise.all(ids.filter(Boolean).map((id) => getListingById(id)));
    return { success: true, data: results.filter((result) => result.success && result.data).map((result) => result.data) };
  } catch (err) {
    return { success: false, error: err.message || "Unable to load listings", data: [] };
  }
}

export async function markListingsLockedForSwap(listingIds = [], swapId) {
  return { success: true, skipped: true, swapId, listingIds };
}

export async function releaseListingsFromSwap(listingIds = [], swapId) {
  return { success: true, skipped: true, swapId, listingIds };
}

export async function markListingsCompletedForSwap(listingIds = [], swapId) {
  return { success: true, skipped: true, swapId, listingIds };
}

export async function deleteSwapListings(listingIds = []) {
  return { success: true, skipped: true, listingIds };
}

export async function createListing(data, imageFiles = [], videoFile = null) {
  try {
    const formData = new FormData();
    Object.entries(data || {}).forEach(([key, value]) => formData.append(key, value ?? ""));
    Array.from(imageFiles || []).forEach((file) => formData.append("images", file));
    if (videoFile) formData.append("video", videoFile);

    const created = await backendRequest("/listings", { method: "POST", body: formData });
    return { success: true, data: formatListing(created) };
  } catch (err) {
    return { success: false, error: err.message || "Failed to create listing" };
  }
}

export async function deleteListing(id) {
  try {
    await backendRequest(`/listings/${id}`, { method: "DELETE" });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "Failed to delete listing" };
  }
}
