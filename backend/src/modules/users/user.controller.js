import { asyncHandler } from "../../utils/http.js";
import { presentProfile } from "../../utils/userPresenter.js";
import { getProfile, updateUserProfile } from "./user.service.js";
import { uploadToCloudinary } from "../../services/cloudinary.service.js";

export const currentProfile = asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user.id);
  res.json({ success: true, data: presentProfile(profile, req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await updateUserProfile(req.user.id, req.body);
  res.json({ success: true, data: presentProfile(profile, req.user) });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: "Please upload an image file" });
    return;
  }

  const { url: avatarUrl } = await uploadToCloudinary(req.file, {
    folder: `swapwear/avatars/${req.user.id}`,
  });
  const profile = await updateUserProfile(req.user.id, { avatar_url: avatarUrl });

  res.json({
    success: true,
    data: {
      avatar_url: avatarUrl,
      profile: presentProfile(profile, req.user),
    },
  });
});
