/**
 * Explicit runtime shim for node:test without TS transpilation.
 * Mirrors src/lib/session-hydration.ts behavior for contract testing.
 */
export async function hydrateUserProfile(user) {
  if (!user) return undefined;
  if (user.profile) return user.profile;
  try {
    const profile = await user.fetchProfile();
    if (profile) {
      user.profile = profile;
      return profile;
    }
  } catch {
    // Keep graceful fallback behavior in UI.
  }
  return undefined;
}
