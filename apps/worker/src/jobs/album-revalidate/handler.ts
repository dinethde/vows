import type { INestApplicationContext } from '@nestjs/common';
import type { JobPayload } from '@vows/contracts';
import { RevalidateService } from '@vows/server';

/** An HTTP call to the web app that can fail and should retry, so it is a job. */
export function albumRevalidate(
  app: INestApplicationContext,
): (payload: JobPayload<'album.revalidate'>) => Promise<void> {
  const revalidate = app.get(RevalidateService);
  // Only the id is trusted. The slugs say where the album was, not where it is.
  return ({ albumId, slug, oldSlug }) =>
    revalidate.revalidateAlbum(albumId, { slug, ...(oldSlug ? { oldSlug } : {}) });
}
