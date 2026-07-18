import { asyncHandler, clearAuthCookies, sendAuthCookies } from "../../utils/http.js";
import { presentUser } from "../../utils/userPresenter.js";
import {
  completeOAuthLogin,
  createOAuthStart,
  loginUser,
  refreshAuth,
  registerUser,
  requestPasswordReset,
  requestPhoneOtp,
  resetPassword,
  verifyPhoneOtp,
} from "./auth.service.js";
import { appConfig } from "../../config/app.config.js";
import crypto from "node:crypto";

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

export const oauthStart = asyncHandler(async (req, res) => {
  const state = crypto.randomBytes(24).toString("hex");
  const payload = createOAuthStart(req.params.provider, state);

  res.cookie("swapwear_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
  });

  res.redirect(payload.url);
});

export const oauthCallback = asyncHandler(async (req, res) => {
  const expectedState = req.cookies?.swapwear_oauth_state;
  const receivedState = req.query.state;

  res.clearCookie("swapwear_oauth_state", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (!expectedState || expectedState !== receivedState) {
    return res.redirect(`${appConfig.clientUrl}/login?oauth=failed&reason=state`);
  }

  try {
    const payload = await completeOAuthLogin({
      provider: req.params.provider,
      code: req.query.code,
    });

    sendAuthCookies(res, { refreshToken: payload.session.refresh_token });
    return res.redirect(`${appConfig.clientUrl}/login?oauth=success`);
  } catch (error) {
    const reason = encodeURIComponent(error.message || "oauth_failed");
    return res.redirect(`${appConfig.clientUrl}/login?oauth=failed&reason=${reason}`);
  }
});

export const sendPhoneOtp = asyncHandler(async (req, res) => {
  const payload = await requestPhoneOtp(req.body);
  res.json({ success: true, data: payload });
});

export const confirmPhoneOtp = asyncHandler(async (req, res) => {
  const payload = await verifyPhoneOtp(req.body);
  sendSession(res, payload);
});
