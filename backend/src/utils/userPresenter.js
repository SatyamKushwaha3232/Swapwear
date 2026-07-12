export function presentUser(user) {
  if (!user) return null;

  const profile = user.profile || {};
  const fullName =
    profile.fullName ||
    profile.full_name ||
    user.fullName ||
    user.email?.split("@")[0] ||
    "SwapWear User";

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    app_metadata: {
      role: String(user.role || "USER").toLowerCase(),
      provider: profile.provider || "email",
      is_admin: ["ADMIN", "OWNER", "MODERATOR"].includes(user.role),
    },
    user_metadata: {
      full_name: fullName,
      name: fullName,
      user_name: profile.username || "",
      avatar_url: profile.avatarUrl || profile.avatar_url || "",
    },
    profile: presentProfile(profile, user),
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

export function presentProfile(profile = {}, user = {}) {
  return {
    id: profile.userId || user.id || profile.id,
    user_id: profile.userId || user.id,
    full_name: profile.fullName || profile.full_name || "",
    username: profile.username || "",
    email: user.email || profile.email || "",
    phone: profile.phone || "",
    avatar_url: profile.avatarUrl || profile.avatar_url || "",
    city: profile.city || "",
    location: profile.location || "",
    website: profile.website || "",
    bio: profile.bio || "",
    provider: profile.provider || "email",
    is_premium: Boolean(profile.isPremium || profile.is_premium),
    total_swaps: profile.totalSwaps || profile.total_swaps || 0,
    rating: profile.rating || 0,
    created_at: profile.createdAt || profile.created_at,
    updated_at: profile.updatedAt || profile.updated_at,
  };
}
