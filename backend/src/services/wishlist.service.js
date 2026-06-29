import { supabase } from "../config/supabase.js";

export async function getWishlist(userId) {
  const { data, error } = await supabase
    .from("wishlist")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function addWishlist(payload) {
  const { data, error } = await supabase
    .from("wishlist")
    .insert([
      {
        user_id: payload.user_id,
        listing_id: payload.listing_id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function removeWishlist(id) {
  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}