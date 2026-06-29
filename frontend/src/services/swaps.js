const API_URL = "http://localhost:5000/api/swaps";

export async function createSwapRequest(payload) {
  try {
    const body = {
      requester_id: payload.requesterId,
      owner_id: payload.ownerId,
      requester_name: payload.requesterName,
      owner_name: payload.ownerName,
      requester_item_id: payload.requesterItem?.id,
      owner_item_id: payload.ownerItem?.id,
      requester_item_title: payload.requesterItem?.title,
      owner_item_title: payload.ownerItem?.title,
      requester_item_image:
        payload.requesterItem?.image || payload.requesterItem?.images?.[0] || "",
      owner_item_image:
        payload.ownerItem?.image || payload.ownerItem?.images?.[0] || "",
      requester_points: Number(payload.requesterItem?.points) || 0,
      owner_points: Number(payload.ownerItem?.points) || 0,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to send swap request");
    }

    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getSwapRequests(userId = null) {
  try {
    let safeUserId = userId;

    if (!safeUserId) {
      const raw = localStorage.getItem("supabase.auth.token");
      safeUserId = raw ? JSON.parse(raw)?.currentSession?.user?.id : null;
    }

    const res = await fetch(`${API_URL}?userId=${safeUserId || ""}`);
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to fetch swap requests");
    }

    return { success: true, data: result.data || [] };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function acceptSwap(id) {
  try {
    const res = await fetch(`${API_URL}/${id}/accept`, {
      method: "PATCH",
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to accept swap");
    }

    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function declineSwap(id) {
  try {
    const res = await fetch(`${API_URL}/${id}/reject`, {
      method: "PATCH",
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to decline swap");
    }

    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
