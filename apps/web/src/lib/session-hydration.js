/**
 * @typedef {{ [key: string]: any }} HydratableProfile
 *
 * @typedef {{
 *   profile?: any,
 *   fetchProfile: () => Promise<any>
 * }} HydratableUser
 */

/**
 * Deterministically hydrate user profile once for current auth session.
 * Returns undefined when no profile is available.
 *
 * @param {HydratableUser | null | undefined} user
 * @returns {Promise<any | undefined>}
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
