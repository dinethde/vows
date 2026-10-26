import { Inject, Injectable } from "@nestjs/common";
import { and, eq, inArray, isNotNull, lt, or, sql } from "drizzle-orm";

import { album, photo, photoDerivative } from "@vows/db";
import type { Db } from "@vows/db";

import { DB } from "../../database/database.module";
import { StorageService } from "../../storage/storage.service";

const DAY_MS = 24 * 60 * 60 * 1000;
/** A photograph someone could have been looking at gets thirty days. */
export const GRACE_DAYS = 30;
/** One that never finished processing has nothing to look at, so seven. */
export const UNFINISHED_GRACE_DAYS = 7;

/**
 * The only thing in the system that deletes a photograph. A row qualifies when
 * it was removed or replaced long enough ago and is nobody's cover. Anything
 * that does not qualify is left alone for the next run.
 */
@Injectable()
export class CleanupService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly storage: StorageService,
  ) {}

  async run(albumId?: string, now = new Date()): Promise<number> {
    const finished = new Date(now.getTime() - GRACE_DAYS * DAY_MS);
    const unfinished = new Date(now.getTime() - UNFINISHED_GRACE_DAYS * DAY_MS);
    const goneAt = sql<Date>`coalesce(${photo.removedAt}, ${photo.supersededAt})`;

    const rows = await this.db
      .select({ id: photo.id, originalKey: photo.originalKey })
      .from(photo)
      .where(
        and(
          albumId ? eq(photo.albumId, albumId) : undefined,
          or(isNotNull(photo.removedAt), isNotNull(photo.supersededAt)),
          or(lt(goneAt, finished), and(sql`${photo.status} <> 'ready'`, lt(goneAt, unfinished))),
          sql`not exists (select 1 from ${album} where ${album.coverPhotoId} = ${photo.id})`,
        ),
      );
    if (rows.length === 0) return 0;

    const ids = rows.map((row) => row.id);
    const files = await this.db
      .select({ key: photoDerivative.key })
      .from(photoDerivative)
      .where(inArray(photoDerivative.photoId, ids));

    // Files first. If this stops halfway the rows are still there, and the next
    // run deletes the same keys again, which R2 treats as done.
    await this.storage.deletePublic(files.map((file) => file.key));
    await this.storage.deleteOriginals(rows.map((row) => row.originalKey));
    await this.db.delete(photo).where(inArray(photo.id, ids));
    return rows.length;
  }
}
