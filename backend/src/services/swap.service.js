import { supabase } from "../config/supabase.js";

export async function createSwapRequest(payload) {
  const { data, error } = await supabase
    .from("swap_requests")
    .insert([
      {
        requester_id: payload.requester_id,
        owner_id: payload.owner_id,
        requester_name: payload.requester_name,
        owner_name: payload.owner_name,
        requester_item_id: payload.requester_item_id,
        owner_item_id: payload.owner_item_id,
        requester_item_title: payload.requester_item_title,
        owner_item_title: payload.owner_item_title,
        requester_item_image: payload.requester_item_image,
        owner_item_image: payload.owner_item_image,
        requester_points: Number(payload.requester_points) || 0,
        owner_points: Number(payload.owner_points) || 0,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchSwapRequests(userId) {
  const { data, error } = await supabase
    .from("swap_requests")
    .select("*")
    .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateSwapStatus(id, status) {
  const { data, error } = await supabase
    .from("swap_requests")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}