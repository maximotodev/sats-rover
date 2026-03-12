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
function normalizeProfile(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return undefined;
  }

  const displayName = raw.displayName || raw.display_name || raw.name;
  const image = raw.image || raw.picture;

  return {
    ...raw,
    displayName,
    image,
  };
}

export async function hydrateUserProfile(user) {
  if (!user) return undefined;
  if (user.profile !== undefined && user.profile !== null) {
    const profile = normalizeProfile(user.profile);
    user.profile = profile;
    return profile;
  }
  try {
    const profile = normalizeProfile(await user.fetchProfile());
    if (profile) {
      user.profile = profile;
      return profile;
    }
  } catch {
    // Keep graceful fallback behavior in UI.
  }
  return undefined;
}
