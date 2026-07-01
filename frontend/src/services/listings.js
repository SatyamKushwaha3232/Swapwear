import { supabase } from "../lib/supabase";

function formatListing(item = {}) {
  const imageList =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.image
      ? [item.image]
      : [];

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
  };
}

export async function getListings(userId = null) {
  try {
    let query = supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
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

export async function getListingById(id) {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    return {
      success: true,
      data: data ? formatListing(data) : null,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to fetch listing",
      data: null,
    };
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