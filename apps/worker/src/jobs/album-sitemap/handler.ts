import type { INestApplicationContext } from "@nestjs/common";

import { RevalidateService } from "@vows/server";

/** Nightly, in case a publish's own rebuild was the one that got lost. */
export function albumSitemap(app: INestApplicationContext): () => Promise<void> {
  const revalidate = app.get(RevalidateService);
  return () => revalidate.revalidate(["/sitemap.xml", "/"]);
}
