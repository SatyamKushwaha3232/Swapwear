import { prisma } from "../../config/prisma.js";

export async function getProfile(userId) {
  return prisma.profile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      provider: "email",
    },
  });
}

export async function updateUserProfile(userId, payload = {}) {
  const data = {
    fullName: payload.full_name ?? payload.fullName ?? undefined,
    username: payload.username ?? undefined,
    phone: payload.phone ?? undefined,
    city: payload.city ?? undefined,
    location: payload.location ?? undefined,
    website: payload.website ?? undefined,
    bio: payload.bio ?? undefined,
    avatarUrl: payload.avatar_url ?? payload.avatarUrl ?? undefined,
    provider: payload.provider ?? undefined,
  };

  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

  return prisma.profile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
      provider: data.provider || "email",
    },
  });
}
