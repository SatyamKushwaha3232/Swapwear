import { asyncHandler, clearAuthCookies, sendAuthCookies } from "../../utils/http.js";
import { presentUser } from "../../utils/userPresenter.js";
import {
  loginUser,
  refreshAuth,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "./auth.service.js";

function sendSession(res, payload, status = 200) {
  sendAuthCookies(res, { refreshToken: payload.session.refresh_token });

  res.status(status).json({
    success: true,
    data: {
      user: presentUser(payload.user),
      session: payload.session,
    },
  });
}

export const register = asyncHandler(async (req, res) => {
  const payload = await registerUser(req.body);
  sendSession(res, payload, 201);
});

export const login = asyncHandler(async (req, res) => {
  const payload = await loginUser(req.body);
  sendSession(res, payload);
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.swapwear_refresh || req.body.refreshToken;
  const payload = await refreshAuth(token);
  sendSession(res, payload);
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookies(res);
  res.json({ success: true });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: presentUser(req.user) } });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const payload = await requestPasswordReset(req.body, {
    clientUrl: req.get("origin"),
  });

  res.json({
    success: true,
    data: {
      sent: true,
      // Until a mail provider is configured, local development can use this link.
      reset_url: payload.resetUrl || null,
      expires_at: payload.expiresAt || null,
    },
  });
});

export const confirmPasswordReset = asyncHandler(async (req, res) => {
  await resetPassword(req.body);
  res.json({ success: true, data: { reset: true } });
});
