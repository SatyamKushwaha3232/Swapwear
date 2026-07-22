import {
  API_BASE_URL,
  backendRequest,
  getBackendAccessToken,
  setBackendAccessToken,
} from "../lib/backendApi";

const AUTH_TIMEOUT_MS = 90000;

function saveSession(data) {
  const session = data?.session || null;
  const user = data?.user || null;

  setBackendAccessToken(session?.access_token || "");

  if (user) {
    localStorage.setItem("swapwear_backend_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("swapwear_backend_user");
  }

  return { session, user };
}

export function getStoredBackendUser() {
  try {
    return JSON.parse(localStorage.getItem("swapwear_backend_user") || "null");
  } catch {
    return null;
  }
}


export async function getBackendSession() {
  if (!getBackendAccessToken()) {
    return { session: null, user: null };
  }

  try {
    const data = await backendRequest("/auth/me");

    const user = data?.user || null;

    if (user) {
      localStorage.setItem(
        "swapwear_backend_user",
        JSON.stringify(user)
      );
    }

    return {
      session: {
        access_token: getBackendAccessToken(),
        token_type: "bearer",
      },
      user,
    };
  } catch (err) {

    // Access token expire ho gaya
    if (err.status === 401) {

      try {

        // Cookie se naya access token le lo
        const refreshData = await backendRequest("/auth/refresh", {
          method: "POST",
          timeoutMs: AUTH_TIMEOUT_MS,
        });

        saveSession(refreshData);

        // Dobara /me call karo
        const me = await backendRequest("/auth/me");

        const user = me?.user || null;

        if (user) {
          localStorage.setItem(
            "swapwear_backend_user",
            JSON.stringify(user)
          );
        }

        return {
          session: {
            access_token: getBackendAccessToken(),
            token_type: "bearer",
          },
          user,
        };

      } catch {

        setBackendAccessToken("");
        localStorage.removeItem("swapwear_backend_user");

        return {
          session: null,
          user: null,
        };
      }
    }

    setBackendAccessToken("");
    localStorage.removeItem("swapwear_backend_user");

    return {
      session: null,
      user: null,
    };
  }
}


export async function loginWithBackend(email, password) {
  const data = await backendRequest("/auth/login", {
    method: "POST",
    timeoutMs: AUTH_TIMEOUT_MS,
    body: JSON.stringify({ email, password }),
  });

  return saveSession(data);
}

export async function signupWithBackend({ fullName, email, password }) {
  const data = await backendRequest("/auth/register", {
    method: "POST",
    timeoutMs: AUTH_TIMEOUT_MS,
    body: JSON.stringify({ fullName, email, password }),
  });

  return saveSession(data);
}

export async function requestBackendPasswordReset(email) {
  return backendRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetBackendPassword({ token, password }) {
  return backendRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export function startBackendOAuth(provider) {
  window.location.assign(`${API_BASE_URL}/auth/oauth/${provider}/start`);
}

export async function completeBackendOAuthSession() {
  const data = await backendRequest("/auth/refresh", {
    method: "POST",
    timeoutMs: AUTH_TIMEOUT_MS,
  });
  return saveSession(data);
}

export async function requestBackendPhoneOtp(phone) {
  return backendRequest("/auth/phone/request-otp", {
    method: "POST",
    timeoutMs: AUTH_TIMEOUT_MS,
    body: JSON.stringify({ phone }),
  });
}

export async function verifyBackendPhoneOtp({ phone, code, fullName }) {
  const data = await backendRequest("/auth/phone/verify-otp", {
    method: "POST",
    timeoutMs: AUTH_TIMEOUT_MS,
    body: JSON.stringify({ phone, code, fullName }),
  });

  return saveSession(data);
}

export async function logoutBackend() {
  try {
    await backendRequest("/auth/logout", { method: "POST" });
  } finally {
    setBackendAccessToken("");
    localStorage.removeItem("swapwear_backend_user");
  }
}
