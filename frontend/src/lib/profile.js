import { supabase } from "./supabase";

export async function createProfile(user) {
  if (!user) return;

  // check profile exists
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return;

  const meta = user.user_metadata || {};

  await supabase.from("profiles").insert({
    id: user.id,
    full_name:
      meta.full_name ||
      meta.name ||
      meta.user_name ||
      "",

    username:
      meta.user_name ||
      meta.preferred_username ||
      "",

    email: user.email,

    avatar_url:
      meta.avatar_url ||
      meta.picture ||
      "",

    provider:
      user.app_metadata?.provider || "email",
  });
}