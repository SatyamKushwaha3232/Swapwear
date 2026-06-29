const API_URL = "http://localhost:5000/api/wishlist";

export async function getWishlist(userId) {
  try {
    const res = await fetch(`${API_URL}?userId=${userId}`);
    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function addWishlist(user_id, listing_id) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id,
        listing_id,
      }),
    });

    return await res.json();
  } catch (err) {
    console.log(err);
  }
}

export async function removeWishlist(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    return await res.json();
  } catch (err) {
    console.log(err);
  }
}
