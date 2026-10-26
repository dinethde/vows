import { Inject, Injectable } from "@nestjs/common";
import { album } from "@vows/db";
import type { Db } from "@vows/db";
import { eq } from "drizzle-orm";
import { createHmac } from "node:crypto";

import { ENV } from "../../config/env";
import type { Env } from "../../config/env";
import { DB } from "../../database/database.module";

const TIMEOUT_MS = 20_000;

/** The pages an album appears on: its own, the home page and the sitemap. */
export function pathsFor(slug: string, oldSlug?: string): string[] {
  const paths = [`/albums/${slug}`, "/", "/sitemap.xml"];
  return oldSlug ? [...paths, `/albums/${oldSlug}`] : paths;
}

export function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

/**
 * Tells the web app which pages are out of date. The secret never travels: it
 * signs the body, and the body carries the time so a captured call goes stale.
 */
@Injectable()
export class RevalidateService {
  constructor(
    @Inject(ENV) private readonly env: Env,
    @Inject(DB) private readonly db: Db,
  ) {}

  /**
   * Rebuilds an album's pages at the address it has now. The payload's slug is
   * only what was true when the job was written; by the time it runs, or
   * retries, the album may have moved, and then that address is stale too.
   */
  async revalidateAlbum(
    albumId: string,
    written: { slug: string; oldSlug?: string },
  ): Promise<void> {
    const row = await this.db.query.album.findFirst({
      where: eq(album.id, albumId),
      columns: { slug: true },
    });
    const slug = row?.slug ?? written.slug;
    const stale = [written.slug, written.oldSlug].filter(
      (old): old is string => old !== undefined && old !== slug,
    );
    const paths = [...pathsFor(slug), ...stale.map((old) => `/albums/${old}`)];
    await this.revalidate([...new Set(paths)]);
  }

  async revalidate(paths: string[], now = Date.now()): Promise<void> {
    const body = JSON.stringify({ paths, issuedAt: now });
    const response = await fetch(`${this.env.SITE_URL.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-vows-signature": sign(body, this.env.REVALIDATE_SECRET),
      },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // Throwing is how the job retries. A 404 here means the two secrets differ.
    if (!response.ok) throw new Error(`The rebuild endpoint answered ${String(response.status)}.`);
  }
}
