import { backendRequest } from "../lib/backendApi";

export async function createMarketplaceReport(payload = {}) {
  try {
    const data = await backendRequest("/trust/reports", { method: "POST", body: JSON.stringify(payload) });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to submit report" };
  }
}

export async function submitSwapReview(swapId, rating, comment = "") {
  try {
    const data = await backendRequest("/trust/reviews", { method: "POST", body: JSON.stringify({ swapId, rating, comment }) });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to submit review" };
  }
}

export async function getUserReviews(userId) {
  try {
    if (!userId) return { success: true, data: [] };
    const data = await backendRequest(`/trust/reviews/${userId}`);
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: error.message || "Unable to load reviews", data: [] };
  }
}
