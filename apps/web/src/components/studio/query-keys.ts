/** One place for the cache keys, so an invalidation cannot miss by a typo. */
export const studioKeys = {
  album: (id: string) => ["studio", "album", id] as const,
  photos: (albumId: string) => ["studio", "album", albumId, "photos"] as const,
};

/** The worker is asked every three seconds while a photograph is being made. */
export const PHOTO_POLL_MS = 3000;
