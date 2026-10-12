import type { INestApplicationContext } from '@nestjs/common';
import type { JobPayload } from '@vows/contracts';
import { pathsFor, RevalidateService } from '@vows/server';

/** An HTTP call to the web app that can fail and should retry, so it is a job. */
export function albumRevalidate(
  app: INestApplicationContext,
): (payload: JobPayload<'album.revalidate'>) => Promise<void> {
  const revalidate = app.get(RevalidateService);
  return ({ slug, oldSlug }) => revalidate.revalidate(pathsFor(slug, oldSlug));
}
