import { supabase } from "../lib/supabase";

export async function createSwapRequest({
  requesterId,
  ownerId,
  requesterName,
  ownerName,
  requesterItem,
  ownerItem,
}) {
  try {
    const { error } = await supabase.from("swap_requests").insert([
      {
        requester_id: requesterId,
        owner_id: ownerId,
        requester_name: requesterName,
        owner_name: ownerName,
        requester_item_id: requesterItem?.id || null,
        owner_item_id: ownerItem?.id || null,
        requester_item_title: requesterItem?.title || "My offered item",
        owner_item_title: ownerItem?.title || "Requested item",
        requester_item_image:
          requesterItem?.images?.[0] || requesterItem?.image || "",
        owner_item_image: ownerItem?.images?.[0] || ownerItem?.image || "",
        requester_points: Number(requesterItem?.points || 0),
        owner_points: Number(ownerItem?.points || 0),
        status: "Pending",
      },
    ]);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getSwapRequests(userId = null) {
  try {
    let query = supabase
      .from("swap_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.or(`requester_id.eq.${userId},owner_id.eq.${userId}`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function acceptSwap(id) {
  return updateSwapStatus(id, "Accepted");
}

export async function declineSwap(id) {
  return updateSwapStatus(id, "Declined");
}

async function updateSwapStatus(id, status) {
  try {
    const { error } = await supabase
      .from("swap_requests")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
