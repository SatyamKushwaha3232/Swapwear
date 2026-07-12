import { asyncHandler } from "../../utils/http.js";
import { presentProfile } from "../../utils/userPresenter.js";
import { getProfile, updateUserProfile } from "./user.service.js";

export const currentProfile = asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user.id);
  res.json({ success: true, data: presentProfile(profile, req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await updateUserProfile(req.user.id, req.body);
  res.json({ success: true, data: presentProfile(profile, req.user) });
});
