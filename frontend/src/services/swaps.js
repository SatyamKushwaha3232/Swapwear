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
    completed_at: item.completed_at || null,
    delete_eligible_at: item.delete_eligible_at || null,
    items_deleted_at: item.items_deleted_at || null,
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

    return { success: true, data: (data || []).map(formatSwap) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to fetch swaps", data: [] };
  }
}

export async function updateSwapStatus(id, status) {
  try {
    const nextStatus = normalizeStatus(status);
    const swap = await getSwapById(id);
    const listingIds = swapListingIds(swap);
    const patch = { status: nextStatus, updated_at: new Date().toISOString() };

    if (nextStatus === "accepted") {
      await ensureListingsAvailable(listingIds);
      patch.accepted_at = new Date().toISOString();
    }

    if (nextStatus === "completed") {
      patch.completed_at = new Date().toISOString();
      patch.delete_eligible_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
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

    if (["rejected", "cancelled"].includes(nextStatus) && swap.status === "accepted") {
      await releaseListingsFromSwap(listingIds, id);
    }

    if (nextStatus === "completed") {
      await markListingsCompletedForSwap(listingIds, id);
    }

    if (["accepted", "rejected", "cancelled", "completed"].includes(nextStatus)) {
      const recipientId =
        nextStatus === "cancelled" ? updatedSwap.owner_id : updatedSwap.requester_id;
      const actorId =
        nextStatus === "cancelled" ? updatedSwap.requester_id : updatedSwap.owner_id;

      await notifySwapStatus({
        userId: recipientId,
        actorId,
        status: nextStatus,
        itemTitle:
          nextStatus === "cancelled"
            ? updatedSwap.owner_item?.title
            : updatedSwap.requester_item?.title || updatedSwap.owner_item?.title,
        swapId: updatedSwap.id,
      });
    }

    return { success: true, data: updatedSwap };
  } catch (error) {
    return { success: false, error: error.message || "Unable to update swap status" };
  }
}

export async function deleteCompletedSwapItems(id) {
  try {
    const swap = await getSwapById(id);

    if (swap.status !== "completed") {
      throw new Error("Only completed swap items can be deleted");
    }

    const listingIds = swapListingIds(swap);
    const deleteResponse = await deleteSwapListings(listingIds);

    if (!deleteResponse.success) throw new Error(deleteResponse.error);

    const { data, error } = await supabase
      .from("swaps")
      .update({
        items_deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return { success: true, data: formatSwap(data) };
  } catch (error) {
    return { success: false, error: error.message || "Unable to delete completed items" };
  }
}

export const acceptSwap = (id) => updateSwapStatus(id, "accepted");
export const rejectSwap = (id) => updateSwapStatus(id, "rejected");
export const cancelSwap = (id) => updateSwapStatus(id, "cancelled");
export const completeSwap = (id) => updateSwapStatus(id, "completed");
