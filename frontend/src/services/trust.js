import { supabase } from "../lib/supabase";
import { backendAuthEnabled, backendRequest } from "../lib/backendApi";

export async function createMarketplaceReport(payload = {}) {
  if (backendAuthEnabled) {
    try {
      const data = await backendRequest("/trust/reports", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || "Unable to submit report" };
    }
  }

  try {
    const { data, error } = await supabase.rpc("create_marketplace_report", {
      p_listing_id: payload.listingId || null,
      p_swap_id: payload.swapId || null,
      p_reported_user_id: payload.reportedUserId || null,
      p_report_type: payload.reportType || "general",
      p_reason: payload.reason || "Marketplace issue reported",
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to submit report" };
  }
}

export async function submitSwapReview(swapId, rating, comment = "") {
  if (backendAuthEnabled) {
    try {
      const data = await backendRequest("/trust/reviews", {
        method: "POST",
        body: JSON.stringify({ swapId, rating, comment }),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || "Unable to submit review" };
    }
  }

  try {
    const { data, error } = await supabase.rpc("submit_swap_review", {
      p_swap_id: swapId,
      p_rating: rating,
      p_comment: comment || null,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to submit review" };
  }
}

export async function getUserReviews(userId) {
  if (backendAuthEnabled) {
    try {
      if (!userId) return { success: true, data: [] };
      const data = await backendRequest(`/trust/reviews/${userId}`);
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error.message || "Unable to load reviews", data: [] };
    }
  }

  try {
    if (!userId) return { success: true, data: [] };

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("reviewee_id", userId)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: error.message || "Unable to load reviews", data: [] };
  }
}
