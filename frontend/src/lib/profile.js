export async function createProfile(user) {
  return { success: Boolean(user?.id), data: user || null };
}
