import { supabase } from "../lib/supabase";
import { getCurrentProfile } from "./profile";

function formatListing(item) {
  if (!item) return null;

  const imageList =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : item.image
      ? [item.image]
      : [];

  return {
    id: item.id,
    title: item.title || "Untitled Item",
    owner: item.owner_name || "SwapWear User",
    ownerId: item.user_id || null,
    brand: item.brand || "Unknown Brand",
    size: item.size || "Free",
    condition: item.condition || "Good",
    location: item.location || "India",
    category: item.category || "Fashion",
    points: Number(item.points) || 0,
    likes: Number(item.likes || 0),
    views: item.views || "0",
    hasVideo: Boolean(item.video),
    video: item.video || "",
    images: imageList,
    image: imageList[0] || "",
    description: item.description || "",
    created_at: item.created_at,
  };
}

async function uploadFile(file, folder) {
  const fileExt = file.name.split(".").pop() || "file";
  const safeName = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("listings")
    .upload(safeName, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("listings").getPublicUrl(safeName);
  return data.publicUrl;
}

export async function createListing(data, imageFiles, videoFile) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Please login before publishing" };
    }

    const safeImages = Array.from(imageFiles || []);

    if (safeImages.length === 0) {
      return { success: false, error: "Upload at least 1 image" };
    }

    const imageUrls = [];

    for (const file of safeImages) {
      const url = await uploadFile(file, "images");
      imageUrls.push(url);
    }

    let videoUrl = "";
    if (videoFile) {
      videoUrl = await uploadFile(videoFile, "videos");
    }

    const profileResponse = await getCurrentProfile();
    const ownerName =
      profileResponse.data?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "SwapWear User";

    const { error } = await supabase.from("listings").insert([
      {
        title: data.title,
        brand: data.brand,
        category: data.category,
        size: data.size,
        location: data.location,
        points: Number(data.points),
        description: data.description,
        condition: data.condition || "Good",
        image: imageUrls[0] || "",
        images: imageUrls,
        video: videoUrl,
        owner_name: ownerName,
        user_id: user.id,
      },
    ]);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
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

    return { success: true, data: (data || []).map(formatListing).filter(Boolean) };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
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

    return { success: true, data: formatListing(data) };
  } catch (err) {
    return { success: false, error: err.message, data: null };
  }
}

export async function deleteListing(id) {
  try {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
