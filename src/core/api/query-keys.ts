/**
 * Query keys shared by more than one feature. A feature that changes data another feature shows
 * invalidates the key here instead of importing that feature.
 */
export const queryKeys = {
  /** GET /v1/me: the account (status decides onboarding vs the main app). */
  me: ['me'] as const,
  myProfile: ['me', 'profile'] as const,
  config: ['config'] as const,
};
