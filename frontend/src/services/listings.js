const API_URL = "http://localhost:5000/api/listings";

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
    views: item.views || "0",
    hasVideo: Boolean(item.video),
    video: item.video || "",
    images: imageList,
    image: imageList[0] || "",
    description: item.description || "",
    user_id: item.user_id || null,
    created_at: item.created_at || null,
  };
}

export async function getListings(userId = null) {
  try {
    const url = userId ? `${API_URL}?userId=${userId}` : API_URL;
    const res = await fetch(url);
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to fetch listings");
    }

    return {
      success: true,
      data: (result.data || []).map(formatListing),
    };
  } catch (err) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function getListingById(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to fetch listing");
    }

    return {
      success: true,
      data: result.data ? formatListing(result.data) : null,
    };
  } catch (err) {
    return { success: false, error: err.message, data: null };
  }
}

export async function createListing(data, imageFiles, videoFile) {
  try {
    const form = new FormData();

    form.append("title", data.title || "");
    form.append("brand", data.brand || "");
    form.append("category", data.category || "Fashion");
    form.append("size", data.size || "");
    form.append("condition", data.condition || "Good");
    form.append("location", data.location || "");
    form.append("points", Number(data.points) || 0);
    form.append("description", data.description || "");
    form.append("owner_name", data.owner_name || "SwapWear User");
    form.append("user_id", data.user_id || "");

    Array.from(imageFiles || []).forEach((file) => {
      form.append("images", file);
    });

    if (videoFile) {
      form.append("video", videoFile);
    }

    const res = await fetch(API_URL, {
      method: "POST",
      body: form,
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to create listing");
    }

    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteListing(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to delete listing");
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
