import { supabase } from "./supabase";

export async function createProfile(user) {
  try {
    if (!user?.id) return { success: false };

    const meta = user.user_metadata || {};

    const payload = {
      id: user.id,
      full_name: meta.full_name || meta.name || meta.user_name || "",
      username: meta.user_name || meta.preferred_username || "",
      email: user.email || "",
      avatar_url: meta.avatar_url || meta.picture || "",
      provider: user.app_metadata?.provider || "email",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      console.error("Profile upsert error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Profile create failed:", error);
    return { success: false, error: error.message };
  }
}