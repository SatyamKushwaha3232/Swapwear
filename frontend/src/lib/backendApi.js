import { ApiError } from "./errors";

export const backendAuthEnabled =
  String(import.meta.env.VITE_AUTH_PROVIDER || "backend").toLowerCase() === "backend";

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
  const isFormData = options.body instanceof FormData;
  const timeoutMs = Number(options.timeoutMs || 20000);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
  } catch (error) {
    window.clearTimeout(timeout);
    if (error?.name === "AbortError") {
      throw new ApiError("Request timed out. Please check that the backend is running.", { status: 0 });
    }
    throw new ApiError(error, { status: 0 });
  }
  window.clearTimeout(timeout);

  const result = await response.json().catch(() => ({
    success: false,
    error: `Request failed with status ${response.status}`,
  }));

  if (!response.ok || result.success === false) {
    throw new ApiError(result.error || `Request failed with status ${response.status}`, {
      status: response.status,
      payload: result,
    });
  }

  return result.data ?? result;
}
