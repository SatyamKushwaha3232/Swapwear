import { backendAuthEnabled, backendRequest } from "../lib/backendApi";

export async function getAddresses() {
  if (!backendAuthEnabled) return { success: true, data: [] };

  try {
    return { success: true, data: await backendRequest("/delivery/addresses") };
  } catch (error) {
    return { success: false, error: error.message || "Unable to load addresses", data: [] };
  }
}

export async function createAddress(payload) {
  if (!backendAuthEnabled) {
    return { success: false, error: "Address book is available in backend mode" };
  }

  try {
    const data = await backendRequest("/delivery/addresses", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to save address" };
  }
}

export async function setupSwapDelivery(swapId, method = "courier") {
  if (!backendAuthEnabled) return { success: true, data: [] };

  try {
    const data = await backendRequest(`/delivery/swaps/${swapId}`, {
      method: "POST",
      body: JSON.stringify({ method }),
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to setup delivery" };
  }
}

export async function getSwapDelivery(swapId) {
  if (!backendAuthEnabled) return { success: true, data: [] };

  try {
    return { success: true, data: await backendRequest(`/delivery/swaps/${swapId}`) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to load delivery", data: [] };
  }
}

export async function updateDeliveryTracking(orderId, payload) {
  if (!backendAuthEnabled) {
    return { success: false, error: "Tracking is available in backend mode" };
  }

  try {
    const data = await backendRequest(`/delivery/${orderId}/tracking`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to update tracking" };
  }
}

export async function addDeliveryProof(orderId, payload) {
  if (!backendAuthEnabled) {
    return { success: false, error: "Proof is available in backend mode" };
  }

  try {
    const data = await backendRequest(`/delivery/${orderId}/proof`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to save proof" };
  }
}
