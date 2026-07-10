import { supabase } from "../lib/supabase";
import {
  deleteSwapListings,
  getListingsByIds,
  LISTING_SWAP_STATUS,
  markListingsCompletedForSwap,
  markListingsLockedForSwap,
  releaseListingsFromSwap,
} from "./listings";
import { notifySwapRequest, notifySwapStatus } from "./notifications";

function itemId(item) {
  return item?.id || item?.listing_id || null;
}

function swapListingIds(swap = {}) {
  return [
    swap.requester_item_id || itemId(swap.requester_item),
    swap.owner_item_id || itemId(swap.owner_item),
  ].filter(Boolean);
}

function normalizeStatus(status) {
  return String(status || "pending").toLowerCase();
}

function isMissingRpc(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return error?.code === "42883" || message.includes("function") || message.includes("schema cache");
}

function formatSwap(item = {}) {
  return {
    id: item.id,
    requester_id: item.requester_id,
    owner_id: item.owner_id,
    requester_name: item.requester_name || "Requester",
    owner_name: item.owner_name || "Owner",
    requester_item_id: item.requester_item_id || itemId(item.requester_item),
    owner_item_id: item.owner_item_id || itemId(item.owner_item),
    requester_item: item.requester_item || null,
    owner_item: item.owner_item || null,
    status: normalizeStatus(item.status),
    message: item.message || "",
    delivery_method: item.delivery_method || "",
    accepted_at: item.accepted_at || null,
    cancelled_at: item.cancelled_at || null,
    expires_at: item.expires_at || null,
    last_action_at: item.last_action_at || null,
    completed_at: item.completed_at || null,
    archive_after: item.archive_after || item.delete_eligible_at || null,
    delete_eligible_at: item.delete_eligible_at || item.archive_after || null,
    items_deleted_at: item.items_deleted_at || null,
    archived_at: item.archived_at || null,
    cancel_reason: item.cancel_reason || "",
    confirmations: item.confirmations || item.swap_confirmations || [],
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

async function getSwapById(id) {
  const { data, error } = await supabase
    .from("swaps")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return formatSwap(data);
}

async function ensureListingsAvailable(listingIds = []) {
  const response = await getListingsByIds(listingIds);
  if (!response.success) throw new Error(response.error);

  const listings = response.data || [];
  const missing = listingIds.filter(
    (id) => !listings.some((listing) => String(listing.id) === String(id))
  );

  if (missing.length > 0) {
    throw new Error("One of these items is no longer available");
  }

  const blocked = listings.find(
    (listing) => listing.swap_status && listing.swap_status !== LISTING_SWAP_STATUS.AVAILABLE
  );

  if (blocked) {
    throw new Error(`${blocked.title || "This item"} is already locked in another swap`);
  }

  return listings;
}

async function getCurrentUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id || null;
}

async function runSwapRpc(name, args = {}) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return formatSwap(data);
}

async function cancelCompetingPendingSwaps(acceptedSwap) {
  const listingIds = swapListingIds(acceptedSwap);
  if (listingIds.length === 0) return;

  const { error } = await supabase
    .from("swaps")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .neq("id", acceptedSwap.id)
    .eq("status", "pending")
    .or(
      listingIds
        .map((id) => `requester_item_id.eq.${id},owner_item_id.eq.${id}`)
        .join(",")
    );

  if (error) throw error;
}

async function reviveEligibleExpiredSwaps(cancelledSwap) {
  const listingIds = swapListingIds(cancelledSwap);
  if (listingIds.length === 0) return;

  const { data: expiredSwaps, error } = await supabase
    .from("swaps")
    .select("*")
    .neq("id", cancelledSwap.id)
    .eq("status", "expired")
    .or(
      listingIds
        .map((id) => `requester_item_id.eq.${id},owner_item_id.eq.${id}`)
        .join(",")
    );

  if (error) throw error;

  for (const swap of expiredSwaps || []) {
    const ids = swapListingIds(swap);
    if (ids.length < 2) continue;

    try {
      await ensureListingsAvailable(ids);

      await supabase
        .from("swaps")
        .update({
          status: "pending",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          last_action_at: new Date().toISOString(),
        })
        .eq("id", swap.id)
        .eq("status", "expired");
    } catch {
      // Keep this request expired if either product is still unavailable.
    }
  }
}

export async function createSwapRequest(payload) {
  try {
    const requesterItemId = itemId(payload.requesterItem);
    const ownerItemId = itemId(payload.ownerItem);

    if (!requesterItemId || !ownerItemId) {
      throw new Error("Both swap items are required");
    }

    if (String(requesterItemId) === String(ownerItemId)) {
      throw new Error("You cannot swap the same item");
    }

    await ensureListingsAvailable([requesterItemId, ownerItemId]);

    const { data: duplicate, error: duplicateError } = await supabase
      .from("swaps")
      .select("id")
      .eq("requester_id", payload.requesterId)
      .eq("owner_id", payload.ownerId)
      .eq("requester_item_id", requesterItemId)
      .eq("owner_item_id", ownerItemId)
      .in("status", ["pending", "accepted"])
      .maybeSingle();

    if (duplicateError) throw duplicateError;
    if (duplicate) throw new Error("You already have an active request for these items");

    const body = {
      requester_id: payload.requesterId,
      owner_id: payload.ownerId,
      requester_name: payload.requesterName,
      owner_name: payload.ownerName,
      requester_item_id: requesterItemId,
      owner_item_id: ownerItemId,
      requester_item: payload.requesterItem,
      owner_item: payload.ownerItem,
      status: "pending",
      message: payload.message || "",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      last_action_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("swaps")
      .insert([body])
      .select("*")
      .single();

    if (error) throw error;

    const createdSwap = formatSwap(data);

    await notifySwapRequest({
      ownerId: createdSwap.owner_id,
      requesterId: createdSwap.requester_id,
      requesterName: createdSwap.requester_name,
      ownerItem: createdSwap.owner_item,
      swapId: createdSwap.id,
    });

    return { success: true, data: createdSwap };
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

    const swaps = (data || []).map(formatSwap);
    const ids = swaps.map((swap) => swap.id).filter(Boolean);

    if (ids.length === 0) return { success: true, data: swaps };

    const { data: confirmations, error: confirmationError } = await supabase
      .from("swap_confirmations")
      .select("*")
      .in("swap_id", ids);

    if (confirmationError && confirmationError.code !== "42P01") {
      throw confirmationError;
    }

    const confirmationsBySwap = (confirmations || []).reduce((acc, item) => {
      acc[item.swap_id] = acc[item.swap_id] || [];
      acc[item.swap_id].push(item);
      return acc;
    }, {});

    return {
      success: true,
      data: swaps.map((swap) => ({
        ...swap,
        confirmations: confirmationsBySwap[swap.id] || [],
      })),
    };
  } catch (error) {
    return { success: false, error: error.message || "Unable to fetch swaps", data: [] };
  }
}

export async function setSwapDeliveryMethod(id, method) {
  try {
    const actorId = await getCurrentUserId();
    const updatedSwap = await runSwapRpc("set_swap_delivery_method", {
      p_swap_id: id,
      p_actor_id: actorId,
      p_delivery_method: method,
    });

    return { success: true, data: updatedSwap };
  } catch (error) {
    return { success: false, error: error.message || "Unable to update delivery method" };
  }
}

export async function confirmSwapHandover(id, note = "") {
  try {
    const actorId = await getCurrentUserId();
    const updatedSwap = await runSwapRpc("confirm_swap_handover", {
      p_swap_id: id,
      p_actor_id: actorId,
      p_note: note || null,
    });

    await notifyForStatus(updatedSwap, "shipped");
    return { success: true, data: updatedSwap };
  } catch (error) {
    return { success: false, error: error.message || "Unable to confirm handover" };
  }
}

export async function confirmSwapReceived(id, note = "") {
  try {
    const actorId = await getCurrentUserId();
    const updatedSwap = await runSwapRpc("confirm_swap_received", {
      p_swap_id: id,
      p_actor_id: actorId,
      p_note: note || null,
    });

    await notifyForStatus(updatedSwap, "delivered");
    return { success: true, data: updatedSwap };
  } catch (error) {
    return { success: false, error: error.message || "Unable to confirm receipt" };
  }
}

export async function updateSwapStatus(id, status) {
  try {
    const nextStatus = normalizeStatus(status);
    const actorId = await getCurrentUserId();

    try {
      let updatedSwap = null;

      if (nextStatus === "accepted") {
        updatedSwap = await runSwapRpc("accept_swap_request", {
          p_swap_id: id,
          p_actor_id: actorId,
        });
      } else if (nextStatus === "completed") {
        updatedSwap = await runSwapRpc("complete_swap_request", {
          p_swap_id: id,
          p_actor_id: actorId,
        });
      } else if (["cancelled", "rejected", "failed"].includes(nextStatus)) {
        updatedSwap = await runSwapRpc("cancel_swap_request", {
          p_swap_id: id,
          p_actor_id: actorId,
          p_next_status: nextStatus,
          p_reason: null,
        });
      }

      if (updatedSwap) {
        await notifyForStatus(updatedSwap, nextStatus);
        return { success: true, data: updatedSwap };
      }
    } catch (rpcError) {
      if (!isMissingRpc(rpcError)) throw rpcError;
    }

    const swap = await getSwapById(id);
    const listingIds = swapListingIds(swap);
    const patch = { status: nextStatus, updated_at: new Date().toISOString() };

    if (nextStatus === "accepted") {
      await ensureListingsAvailable(listingIds);
      patch.accepted_at = new Date().toISOString();
      patch.last_action_at = patch.updated_at;
    }

    if (nextStatus === "completed") {
      patch.completed_at = new Date().toISOString();
      patch.archive_after = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      patch.delete_eligible_at = patch.archive_after;
      patch.last_action_at = patch.updated_at;
    }

    if (["cancelled", "rejected", "failed"].includes(nextStatus)) {
      patch.cancelled_at = patch.updated_at;
      patch.last_action_at = patch.updated_at;
    }

    const { data, error } = await supabase
      .from("swaps")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    const updatedSwap = formatSwap(data);

    if (nextStatus === "accepted") {
      await markListingsLockedForSwap(listingIds, id);
      await cancelCompetingPendingSwaps(updatedSwap);
    }

    if (["rejected", "cancelled"].includes(nextStatus) && ["accepted", "completed"].includes(swap.status)) {
      await releaseListingsFromSwap(listingIds, id);
      await reviveEligibleExpiredSwaps(updatedSwap);
    }

    if (nextStatus === "completed") {
      await markListingsCompletedForSwap(listingIds, id);
    }

    await notifyForStatus(updatedSwap, nextStatus);

    return { success: true, data: updatedSwap };
  } catch (error) {
    return { success: false, error: error.message || "Unable to update swap status" };
  }
}

export async function deleteCompletedSwapItems(id) {
  try {
    const actorId = await getCurrentUserId();

    try {
      const archivedSwap = await runSwapRpc("archive_completed_swap_items", {
        p_swap_id: id,
        p_actor_id: actorId,
      });

      return { success: true, data: archivedSwap };
    } catch (rpcError) {
      if (!isMissingRpc(rpcError)) throw rpcError;
    }

    const swap = await getSwapById(id);

    if (swap.status !== "completed") {
      throw new Error("Only completed swap items can be archived");
    }

    const listingIds = swapListingIds(swap);
    const deleteResponse = await deleteSwapListings(listingIds);

    if (!deleteResponse.success) throw new Error(deleteResponse.error);

    const { data, error } = await supabase
      .from("swaps")
      .update({
        items_deleted_at: new Date().toISOString(),
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return { success: true, data: formatSwap(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to archive completed items" };
  }
}

async function notifyForStatus(updatedSwap, nextStatus) {
  if (!["accepted", "rejected", "cancelled", "completed", "failed", "shipped", "delivered"].includes(nextStatus)) {
    return;
  }

  const actorId = await getCurrentUserId();
  const fallbackActor =
    nextStatus === "cancelled" ? updatedSwap.requester_id : updatedSwap.owner_id;
  const finalActorId = actorId || fallbackActor;
  const recipientId =
    String(finalActorId) === String(updatedSwap.requester_id)
      ? updatedSwap.owner_id
      : updatedSwap.requester_id;

  await notifySwapStatus({
    userId: recipientId,
    actorId: finalActorId,
    status: nextStatus,
    itemTitle:
      String(recipientId) === String(updatedSwap.owner_id)
        ? updatedSwap.owner_item?.title
        : updatedSwap.requester_item?.title || updatedSwap.owner_item?.title,
    swapId: updatedSwap.id,
  });
}

export const acceptSwap = (id) => updateSwapStatus(id, "accepted");
export const rejectSwap = (id) => updateSwapStatus(id, "rejected");
export const cancelSwap = (id) => updateSwapStatus(id, "cancelled");
export const completeSwap = (id) => updateSwapStatus(id, "completed");
