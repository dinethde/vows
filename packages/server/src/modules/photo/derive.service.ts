import { Inject, Injectable } from "@nestjs/common";
import { album, newId, photo, photoDerivative } from "@vows/db";
import type { Db } from "@vows/db";
import { eq, sql } from "drizzle-orm";

import { DB } from "../../database/database.module";
import { QueueService } from "../../queue/queue.service";

export interface DerivedFile {
  format: "avif" | "webp" | "jpeg";
  width: number;
  height: number;
  key: string;
  bytes: number;
}

export interface DeriveResult {
  width: number;
  height: number;
  mime: string;
  thumbhash: string;
  files: DerivedFile[];
}

export type DeriveSubject = Pick<
  typeof photo.$inferSelect,
  "id" | "albumId" | "originalKey" | "position" | "status" | "supersededAt" | "removedAt"
>;

/** The database half of photo.derive. The worker makes the files; this records them. */
@Injectable()
export class DeriveService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly queue: QueueService,
  ) {}

  /** Current state, read fresh: by the time a job runs the row may have changed. */
  async subject(photoId: string): Promise<DeriveSubject | undefined> {
    return this.db.query.photo.findFirst({
      where: eq(photo.id, photoId),
      columns: {
        id: true,
        albumId: true,
        originalKey: true,
        position: true,
        status: true,
        supersededAt: true,
        removedAt: true,
      },
    });
  }

  /**
   * Rows land only after every file is stored, in one transaction. A second
   * run overwrites the same rows, so running twice changes nothing.
   */
  async complete(photoId: string, result: DeriveResult, requestId?: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .insert(photoDerivative)
        .values(result.files.map((file) => ({ ...file, id: newId("derivative"), photoId })))
        .onConflictDoUpdate({
          target: [photoDerivative.photoId, photoDerivative.format, photoDerivative.width],
          set: {
            height: sql`excluded.height`,
            key: sql`excluded.key`,
            bytes: sql`excluded.bytes`,
          },
        });
      const [row] = await tx
        .update(photo)
        .set({
          status: "ready",
          errorCode: null,
          width: result.width,
          height: result.height,
          mime: result.mime,
          thumbhash: result.thumbhash,
        })
        .where(eq(photo.id, photoId))
        .returning({ albumId: photo.albumId });
      if (!row) return;

      // A photograph replaced on a live album shows once it is ready.
      const owner = await tx.query.album.findFirst({ where: eq(album.id, row.albumId) });
      if (owner?.status === "published") {
        await this.queue.send(tx, "album.revalidate", {
          albumId: owner.id,
          slug: owner.slug,
          ...(requestId ? { requestId } : {}),
        });
      }
    });
  }

  /** What the slot shows as Failed. The code picks the sentence. */
  async fail(
    photoId: string,
    errorCode: "wrong_file_type" | "file_too_large" | "processing_failed",
  ): Promise<void> {
    await this.db.update(photo).set({ status: "failed", errorCode }).where(eq(photo.id, photoId));
  }
}
