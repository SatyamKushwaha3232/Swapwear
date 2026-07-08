import { supabase } from "../lib/supabase";

export const LISTING_SWAP_STATUS = {
  AVAILABLE: "available",
  LOCKED: "locked",
  COMPLETED: "completed",
  REMOVED: "removed",
};

function formatListing(item = {}) {
  const imageList =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.image
      ? [item.image]
      : [];

  const swapStatus = item.swap_status || LISTING_SWAP_STATUS.AVAILABLE;

  return {
    id: item.id,
    title: item.title || "Untitled Item",
    owner: item.owner || item.owner_name || "SwapWear User",
    owner_name: item.owner_name || item.owner || "SwapWear User",
    brand: item.brand || "Unknown Brand",
    size: item.size || "Free",
    condition: item.condition || "Good",
    location: item.location || "India",
    category: item.category || "Fashion",
    points: Number(item.points) || 0,
    likes: Number(item.likes) || 0,
    views: Number(item.views) || 0,
    hasVideo: Boolean(item.video),
    video: item.video || "",
    images: imageList,
    image: imageList[0] || "/icons.svg",
    description: item.description || "",
    user_id: item.user_id || null,
    created_at: item.created_at || null,
    swap_status: swapStatus,
    active_swap_id: item.active_swap_id || null,
    swap_completed_at: item.swap_completed_at || null,
    delete_eligible_at: item.delete_eligible_at || null,
    is_available_for_swap: swapStatus === LISTING_SWAP_STATUS.AVAILABLE,
  };
}

export async function cleanupExpiredCompletedListings() {
  try {
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("swap_status", LISTING_SWAP_STATUS.COMPLETED)
      .lte("delete_eligible_at", new Date().toISOString());

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "Cleanup failed" };
  }
}

export async function getListings(userId = null, options = {}) {
  try {
    if (!userId && options.onlyAvailable !== false) {
      cleanupExpiredCompletedListings();
    }

    let query = supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (options.onlyAvailable !== false) {
      query = query.or("swap_status.is.null,swap_status.eq.available");
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: (data || []).map(formatListing),
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to fetch listings",
      data: [],
    };
  }
}

export async function getListingById(id, options = {}) {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    const listing = data ? formatListing(data) : null;

    if (listing && options.onlyAvailable && !listing.is_available_for_swap) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: listing,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to fetch listing",
      data: null,
    };
  }
}

export async function getListingsByIds(ids = []) {
  try {
    const cleanIds = ids.filter(Boolean);
    if (cleanIds.length === 0) return { success: true, data: [] };

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .in("id", cleanIds);

    if (error) throw error;

    return { success: true, data: (data || []).map(formatListing) };
  } catch (err) {
    return { success: false, error: err.message || "Unable to load listings", data: [] };
  }
}

export async function markListingsLockedForSwap(listingIds = [], swapId) {
  try {
    const cleanIds = listingIds.filter(Boolean);
    if (cleanIds.length === 0) return { success: true };

    const { error } = await supabase
      .from("listings")
      .update({
        swap_status: LISTING_SWAP_STATUS.LOCKED,
        active_swap_id: swapId,
        swap_completed_at: null,
        delete_eligible_at: null,
      })
      .in("id", cleanIds);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "Unable to lock listings" };
  }
}

export async function releaseListingsFromSwap(listingIds = [], swapId) {
  try {
    const cleanIds = listingIds.filter(Boolean);
    if (cleanIds.length === 0) return { success: true };

    const { error } = await supabase
      .from("listings")
      .update({
        swap_status: LISTING_SWAP_STATUS.AVAILABLE,
        active_swap_id: null,
        swap_completed_at: null,
        delete_eligible_at: null,
      })
      .in("id", cleanIds)
      .eq("active_swap_id", swapId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "Unable to release listings" };
  }
}

export async function markListingsCompletedForSwap(listingIds = [], swapId) {
  try {
    const cleanIds = listingIds.filter(Boolean);
    if (cleanIds.length === 0) return { success: true };

    const completedAt = new Date();
    const deleteEligibleAt = new Date(completedAt.getTime() + 3 * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from("listings")
      .update({
        swap_status: LISTING_SWAP_STATUS.COMPLETED,
        active_swap_id: swapId,
        swap_completed_at: completedAt.toISOString(),
        delete_eligible_at: deleteEligibleAt.toISOString(),
      })
      .in("id", cleanIds);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "Unable to complete listings" };
  }
}

export async function deleteSwapListings(listingIds = []) {
  try {
    const cleanIds = listingIds.filter(Boolean);
    if (cleanIds.length === 0) return { success: true };

    const { error } = await supabase.from("listings").delete().in("id", cleanIds);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "Unable to delete completed listings" };
  }
}

export async function createListing(data, imageFiles = [], videoFile = null) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("User not logged in");

    const uploadedImages = [];

    for (const file of Array.from(imageFiles || [])) {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/images/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("listings")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("listings")
        .getPublicUrl(filePath);

      uploadedImages.push(publicData.publicUrl);
    }

    let videoUrl = "";

    if (videoFile) {
      const ext = videoFile.name.split(".").pop() || "mp4";
      const videoPath = `${user.id}/videos/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const { error: videoUploadError } = await supabase.storage
        .from("listings")
        .upload(videoPath, videoFile, { upsert: true });

      if (videoUploadError) throw videoUploadError;

      const { data: videoPublicData } = supabase.storage
        .from("listings")
        .getPublicUrl(videoPath);

      videoUrl = videoPublicData.publicUrl;
    }

    const payload = {
      title: data.title || "",
      brand: data.brand || "",
      category: data.category || "Fashion",
      size: data.size || "",
      condition: data.condition || "Good",
      location: data.location || "",
      points: Number(data.points) || 0,
      description: data.description || "",
      owner_name:
        data.owner_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "SwapWear User",
      user_id: user.id,
      image: uploadedImages[0] || data.image || "",
      images: uploadedImages,
      video: videoUrl,
      views: 0,
      likes: 0,
      swap_status: LISTING_SWAP_STATUS.AVAILABLE,
      active_swap_id: null,
    };

    const { data: created, error } = await supabase
      .from("listings")
      .insert([payload])
      .select("*")
      .single();

    if (error) throw error;

    return {
      success: true,
      data: formatListing(created),
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to create listing",
    };
  }
}

export async function deleteListing(id) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("User not logged in");

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to delete listing",
    };
  }
}