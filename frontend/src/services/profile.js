import { backendRequest } from "../lib/backendApi";
import { resolveMediaUrl } from "../utils/media";

function normalizeProfile(profile) {
  if (!profile) return profile;
  return {
    ...profile,
    avatar_url: resolveMediaUrl(profile.avatar_url),
  };
}

export async function getCurrentProfile() {
  try {
    const data = await backendRequest("/users/me/profile");
    return { success: true, data: normalizeProfile(data) };
  } catch (error) {
    return { success: false, error: error.message, data: null };
  }
}

export async function updateProfile(profileData) {
  try {
    const data = await backendRequest("/users/me/profile", {
      method: "PATCH",
      body: JSON.stringify(profileData),
    });
    return { success: true, data: normalizeProfile(data) };
  } catch (error) {
    return { success: false, error: error.message, data: null };
  }
}

export async function uploadAvatar(file) {
  if (!file?.type?.startsWith("image/")) {
    return { success: false, error: "Please upload an image file" };
  }

  const body = new FormData();
  body.append("avatar", file);

  try {
    const data = await backendRequest("/users/me/avatar", { method: "POST", body });
    const avatar = resolveMediaUrl(data?.avatar_url);
    return { success: true, avatar, data: { ...data, avatar_url: avatar } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
