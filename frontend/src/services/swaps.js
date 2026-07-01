import { supabase } from "../lib/supabase";

function formatSwap(item = {}) {
  return {
    id: item.id,
    requester_id: item.requester_id,
    owner_id: item.owner_id,
    requester_name: item.requester_name || "Requester",
    owner_name: item.owner_name || "Owner",
    requester_item: item.requester_item || null,
    owner_item: item.owner_item || null,
    status: item.status || "pending",
    message: item.message || "",
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

export async function createSwapRequest(payload) {
  try {
    const body = {
      requester_id: payload.requesterId,
      owner_id: payload.ownerId,
      requester_name: payload.requesterName,
      owner_name: payload.ownerName,
      requester_item: payload.requesterItem,
      owner_item: payload.ownerItem,
      status: "pending",
      message: payload.message || "",
    };

    const { data, error } = await supabase
      .from("swaps")
      .insert([body])
      .select("*")
      .single();

    if (error) throw error;

    return { success: true, data: formatSwap(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to create swap request" };
  }
}

export async function getMySwaps(userId) {
  try {
    const { data, error } = await supabase
      .from("swaps")
      .select("*")
      .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: (data || []).map(formatSwap) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to fetch swaps", data: [] };
  }
}

export async function updateSwapStatus(id, status) {
  try {
    const { data, error } = await supabase
      .from("swaps")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return { success: true, data: formatSwap(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to update swap status" };
  }
}

export const acceptSwap = (id) => updateSwapStatus(id, "accepted");
export const rejectSwap = (id) => updateSwapStatus(id, "rejected");
export const cancelSwap = (id) => updateSwapStatus(id, "cancelled");
export const completeSwap = (id) => updateSwapStatus(id, "completed");