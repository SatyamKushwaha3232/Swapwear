import { backendRequest } from "../lib/backendApi";

export async function getCurrentProfile() {
  try {
    const data = await backendRequest("/users/me/profile");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message, data: null };
  }
}

export async function updateProfile(profileData) {
  try {
    const data = await backendRequest("/users/me/profile", { method: "PATCH", body: JSON.stringify(profileData) });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message, data: null };
  }
}

export async function uploadAvatar(file) {
  if (!file?.type?.startsWith("image/")) return { success: false, error: "Please upload an image file" };
  return { success: false, error: "Avatar upload will be added to backend uploads next." };
}
