import { supabase } from "../lib/supabase";

function getFallbackName(user) {
  return (
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "SwapWear User"
  );
}

export async function getCurrentProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { success: false, error: userError.message, data: null };
  }

  if (!user) {
    return { success: false, error: "User not logged in", data: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  if (data) {
    return { success: true, data };
  }

  const profilePayload = {
    id: user.id,
    full_name: getFallbackName(user),
    avatar_url: "",
    city: "",
    bio: "",
  };

  const { data: createdProfile, error: createError } = await supabase
    .from("profiles")
    .upsert([profilePayload], { onConflict: "id" })
    .select("*")
    .single();

  if (createError) {
    return { success: false, error: createError.message, data: null };
  }

  return { success: true, data: createdProfile };
}

export async function updateProfile(profileData) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not logged in" };
  }

  const payload = {
    id: user.id,
    full_name: profileData.full_name || getFallbackName(user),
    city: profileData.city || "",
    bio: profileData.bio || "",
    avatar_url: profileData.avatar_url || "",
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert([payload], { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data };
}

export async function uploadAvatar(file) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not logged in" };
  }

  if (!file?.type?.startsWith("image/")) {
    return { success: false, error: "Please upload an image file" };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
  const avatarUrl = data.publicUrl;

  const { data: updatedProfile, error } = await supabase
    .from("profiles")
    .upsert(
      [
        {
          id: user.id,
          full_name: getFallbackName(user),
          avatar_url: avatarUrl,
        },
      ],
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, avatar: avatarUrl, data: updatedProfile };
}
