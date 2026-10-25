/**
 * Query keys shared by more than one feature. A feature that changes data another feature shows
 * invalidates the key here instead of importing that feature.
 */
export const queryKeys = {
  myProfile: ['me', 'profile'] as const,
  config: ['config'] as const,
};
