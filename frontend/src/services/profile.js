import { supabase } from "../lib/supabase";
import { backendAuthEnabled, backendRequest } from "../lib/backendApi";

function getFallbackName(user) {
  return (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.user_name ||
    user?.email?.split("@")[0] ||
    "SwapWear User"
  );
}

function getFallbackAvatar(user) {
  return (
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    ""
  );
}

function getProvider(user) {
  return user?.app_metadata?.provider || "email";
}

export async function getCurrentProfile() {
  if (backendAuthEnabled) {
    try {
      const data = await backendRequest("/users/me/profile");
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message, data: null };
    }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) return { success: false, error: userError.message, data: null };
  if (!user) return { success: false, error: "User not logged in", data: null };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return { success: false, error: error.message, data: null };
  if (data) return { success: true, data };

  const profilePayload = {
    id: user.id,
    full_name: getFallbackName(user),
    username: user?.user_metadata?.user_name || "",
    email: user.email || "",
    phone: user.phone || "",
    avatar_url: getFallbackAvatar(user),
    city: "",
    location: "",
    website: "",
    bio: "",
    provider: getProvider(user),
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
  if (backendAuthEnabled) {
    try {
      const data = await backendRequest("/users/me/profile", {
        method: "PATCH",
        body: JSON.stringify(profileData),
      });

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message, data: null };
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "User not logged in", data: null };

  const payload = {
    id: user.id,
    full_name: profileData.full_name || getFallbackName(user),
    username: profileData.username || "",
    email: user.email || profileData.email || "",
    phone: profileData.phone || "",
    city: profileData.city || "",
    location: profileData.location || "",
    website: profileData.website || "",
    bio: profileData.bio || "",
    avatar_url: profileData.avatar_url || getFallbackAvatar(user),
    provider: profileData.provider || getProvider(user),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert([payload], { onConflict: "id" })
    .select("*")
    .single();

  if (error) return { success: false, error: error.message, data: null };

  return { success: true, data };
}

export async function uploadAvatar(file) {
  if (backendAuthEnabled) {
    return {
      success: false,
      error: "Avatar upload will move to backend uploads in the listings/uploads batch",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "User not logged in" };

  if (!file?.type?.startsWith("image/")) {
    return { success: false, error: "Please upload an image file" };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, { upsert: true });

  if (uploadError) return { success: false, error: uploadError.message };

  const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
  const avatarUrl = data.publicUrl;

  const { data: updatedProfile, error } = await supabase
    .from("profiles")
    .upsert(
      [
        {
          id: user.id,
          full_name: getFallbackName(user),
          email: user.email || "",
          avatar_url: avatarUrl,
          provider: getProvider(user),
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (error) return { success: false, error: error.message };

  return { success: true, avatar: avatarUrl, data: updatedProfile };
}
