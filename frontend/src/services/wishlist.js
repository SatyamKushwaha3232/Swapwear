import { supabase } from "../lib/supabase";
import { backendAuthEnabled, backendRequest } from "../lib/backendApi";

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
  if (backendAuthEnabled) {
    try {
      if (!userId) return [];
      const data = await backendRequest(`/wishlist?userId=${encodeURIComponent(userId)}`);
      return (data || []).map(formatWishlist);
    } catch (error) {
      console.error("Wishlist fetch failed:", error.message || error);
      return [];
    }
  }

  try {
    if (!userId) return [];

    const { data, error } = await supabase
      .from("wishlists")
      .select("*, listing:listings(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(formatWishlist);
  } catch (error) {
    console.error("Wishlist fetch failed:", error.message || error);
    return [];
  }
}

export async function addWishlist(user_id, listing_id) {
  if (backendAuthEnabled) {
    try {
      const data = await backendRequest("/wishlist", {
        method: "POST",
        body: JSON.stringify({ listing_id }),
      });

      return { success: true, data: formatWishlist(data) };
    } catch (error) {
      return { success: false, error: error.message || "Unable to save wishlist" };
    }
  }

  try {
    const { data, error } = await supabase
      .from("wishlists")
      .upsert(
        [{ user_id, listing_id }],
        { onConflict: "user_id,listing_id", ignoreDuplicates: false }
      )
      .select("*")
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to save wishlist" };
  }
}

export async function removeWishlist(id) {
  if (backendAuthEnabled) {
    try {
      await backendRequest(`/wishlist/${id}`, { method: "DELETE" });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Unable to remove wishlist" };
    }
  }

  try {
    const { error } = await supabase.from("wishlists").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Unable to remove wishlist" };
  }
}
