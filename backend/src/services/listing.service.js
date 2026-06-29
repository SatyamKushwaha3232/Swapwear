import { supabase } from "../config/supabase.js";

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
    owner: item.owner_name || "SwapWear User",
    owner_name: item.owner_name || "SwapWear User",
    brand: item.brand || "Unknown Brand",
    size: item.size || "Free",
    condition: item.condition || "Good",
    location: item.location || "India",
    category: item.category || "Fashion",
    points: Number(item.points) || 0,
    likes: Number(item.likes) || 0,
    views: item.views || "0",
    video: item.video || "",
    images: imageList,
    image: imageList[0] || "",
    description: item.description || "",
    user_id: item.user_id || null,
    created_at: item.created_at || null,
  };
}

function safeFileName(file) {
  const ext = file.originalname.split(".").pop();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
}

export async function uploadListingFile(file, folder) {
  const filePath = `${folder}/${safeFileName(file)}`;

  const { error } = await supabase.storage
    .from("listings")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("listings").getPublicUrl(filePath);

  return data.publicUrl;
}

export async function fetchListings(userId = null) {
  let query = supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(formatListing);
}

export async function fetchListingById(id) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data ? formatListing(data) : null;
}

export async function createListingInDb(payload) {
  const { data, error } = await supabase
    .from("listings")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;

  return formatListing(data);
}

export async function deleteListingFromDb(id) {
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw error;
  return true;
}