export type HydratableProfile = {
  [key: string]: any;
};

export type HydratableUser = {
  profile?: any;
  fetchProfile: () => Promise<any>;
};

/**
 * Deterministically hydrate user profile once for current auth session.
 * Returns undefined when no profile is available.
 */
export async function hydrateUserProfile(
  user: HydratableUser | null | undefined,
): Promise<any | undefined> {
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
