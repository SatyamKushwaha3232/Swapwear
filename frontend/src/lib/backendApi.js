export const backendAuthEnabled =
  String(import.meta.env.VITE_AUTH_PROVIDER || "supabase").toLowerCase() === "backend";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

let accessToken = localStorage.getItem("swapwear_access_token") || "";

export function setBackendAccessToken(token) {
  accessToken = token || "";

  if (accessToken) {
    localStorage.setItem("swapwear_access_token", accessToken);
  } else {
    localStorage.removeItem("swapwear_access_token");
  }
}

export function getBackendAccessToken() {
  return accessToken;
}

export async function backendRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.error || "Request failed");
  }

  return result.data ?? result;
}
