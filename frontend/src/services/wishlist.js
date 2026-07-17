import { backendRequest } from "../lib/backendApi";

function formatWishlist(row = {}) {
  return {
    id: row.id,
    user_id: row.user_id,
    listing_id: row.listing_id,
    listing: row.listing || null,
    created_at: row.created_at,
  };
}

export async function getWishlist(userId) {
  try {
    if (!userId) return [];
    const data = await backendRequest(`/wishlist?userId=${encodeURIComponent(userId)}`);
    return (data || []).map(formatWishlist);
  } catch {
    return [];
  }
}

export async function addWishlist(_userId, listingId) {
  try {
    const data = await backendRequest("/wishlist", {
      method: "POST",
      body: JSON.stringify({ listing_id: listingId }),
    });
    return { success: true, data: formatWishlist(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to save wishlist" };
  }
}

export async function removeWishlist(id) {
  try {
    await backendRequest(`/wishlist/${id}`, { method: "DELETE" });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Unable to remove wishlist" };
  }
}
