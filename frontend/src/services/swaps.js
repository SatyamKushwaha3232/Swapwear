import { backendRequest } from "../lib/backendApi";

function formatSwap(swap = {}) {
  return {
    ...swap,
    id: swap.id,
    requester_id: swap.requester_id || swap.requesterId,
    owner_id: swap.owner_id || swap.ownerId,
    requester_item_id: String(swap.requester_item_id || swap.requesterItemId || ""),
    owner_item_id: String(swap.owner_item_id || swap.ownerItemId || ""),
    requester_item: swap.requester_item || swap.requesterItem || null,
    owner_item: swap.owner_item || swap.ownerItem || null,
    status: String(swap.status || "pending").toLowerCase(),
    events: swap.events || [],
    confirmations: swap.confirmations || [],
    disputes: swap.disputes || [],
    deliveries: swap.deliveries || [],
  };
}

async function swapRequest(path, options = {}) {
  const data = await backendRequest(path, options);
  return formatSwap(data);
}

export async function getSwapById(id) {
  try {
    return { success: true, data: await swapRequest(`/swaps/${id}`) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to load swap", data: null };
  }
}

export async function createSwapRequest(payload) {
  try {
    const data = await backendRequest("/swaps", { method: "POST", body: JSON.stringify(payload) });
    return { success: true, data: formatSwap(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to create swap request" };
  }
}

export async function getMySwaps(userId) {
  try {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const data = await backendRequest(`/swaps${params}`);
    return { success: true, data: (data || []).map(formatSwap) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to load swaps", data: [] };
  }
}

export async function setSwapDeliveryMethod(id, method) {
  try {
    return { success: true, data: await swapRequest(`/swaps/${id}/delivery-method`, { method: "PATCH", body: JSON.stringify({ method }) }) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to set delivery method" };
  }
}

export async function confirmSwapHandover(id, note = "") {
  try {
    return { success: true, data: await swapRequest(`/swaps/${id}/handover`, { method: "POST", body: JSON.stringify({ note }) }) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to confirm handover" };
  }
}

export async function confirmSwapReceived(id, note = "") {
  try {
    return { success: true, data: await swapRequest(`/swaps/${id}/received`, { method: "POST", body: JSON.stringify({ note }) }) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to confirm received" };
  }
}

export async function openSwapDispute(id, reason = "") {
  try {
    return { success: true, data: await swapRequest(`/swaps/${id}/dispute`, { method: "POST", body: JSON.stringify({ reason }) }) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to open dispute" };
  }
}

export async function getOpenSwapDisputes() {
  try {
    const data = await backendRequest("/swaps/disputes/open");
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: error.message || "Unable to load disputes", data: [] };
  }
}

export async function resolveSwapDispute(disputeId, decision, resolution = "") {
  try {
    return { success: true, data: await swapRequest(`/swaps/disputes/${disputeId}/resolve`, { method: "PATCH", body: JSON.stringify({ decision, resolution }) }) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to resolve dispute" };
  }
}

export async function updateSwapStatus(id, status, reason = "") {
  try {
    return { success: true, data: await swapRequest(`/swaps/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, reason }) }) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to update swap" };
  }
}

export async function deleteCompletedSwapItems(id) {
  try {
    return { success: true, data: await swapRequest(`/swaps/${id}/archive-items`, { method: "POST" }) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to archive swap items" };
  }
}

export const acceptSwap = (id) => updateSwapStatus(id, "accepted");
export const rejectSwap = (id) => updateSwapStatus(id, "rejected");
export const cancelSwap = (id) => updateSwapStatus(id, "cancelled");
export const completeSwap = (id) => updateSwapStatus(id, "completed");
