import { Inject, Injectable } from "@nestjs/common";
import { and, eq, gte, isNull, sql } from "drizzle-orm";

import { album, newId, photo } from "@vows/db";
import type { Db, DbOrTx } from "@vows/db";

import { DB } from "../../database/database.module";

export type PhotoRow = typeof photo.$inferSelect;
export type NewPhoto = Pick<
  PhotoRow,
  "albumId" | "position" | "mime" | "idempotencyKey" | "alt" | "replacesPhotoId"
> & {
  extension: string;
};

const live = and(isNull(photo.removedAt), isNull(photo.supersededAt));
/** Far above any real slot, so a reorder can pass through it without a clash. */
const PARKED = 1000;

@Injectable()
export class PhotoRepository {
  constructor(@Inject(DB) private readonly db: Db) {}

  findById(id: string, tx: DbOrTx = this.db): Promise<PhotoRow | undefined> {
    return tx.query.photo.findFirst({ where: eq(photo.id, id) });
  }

  /**
   * A repeat of an upload request: the same key, for the same album and slot,
   * and still the slot's photograph. A key that comes back for another album,
   * or for a row that has since been replaced or removed, is a new request.
   */
  findRepeat(key: string, albumId: string, position: number): Promise<PhotoRow | undefined> {
    return this.db.query.photo.findFirst({
      where: and(
        eq(photo.idempotencyKey, key),
        eq(photo.albumId, albumId),
        eq(photo.position, position),
        live,
      ),
    });
  }

  findInSlot(tx: DbOrTx, albumId: string, position: number): Promise<PhotoRow | undefined> {
    return tx.query.photo.findFirst({
      where: and(eq(photo.albumId, albumId), eq(photo.position, position), live),
    });
  }

  /** The id decides the key, so the row and its object name are made together. */
  async insert(tx: DbOrTx, values: NewPhoto): Promise<PhotoRow> {
    const id = newId("photo");
    const { extension, ...columns } = values;
    const [row] = await tx
      .insert(photo)
      .values({ ...columns, id, originalKey: `originals/${values.albumId}/${id}.${extension}` })
      .returning();
    if (!row) throw new Error("The photo insert returned no row.");
    return row;
  }

  async update(
    tx: DbOrTx,
    id: string,
    changes: Partial<typeof photo.$inferInsert>,
  ): Promise<PhotoRow> {
    const [row] = await tx.update(photo).set(changes).where(eq(photo.id, id)).returning();
    if (!row) throw new Error(`Photo ${id} vanished during an update.`);
    return row;
  }

  async setCover(tx: DbOrTx, albumId: string, photoId: string | null): Promise<void> {
    await tx.update(album).set({ coverPhotoId: photoId }).where(eq(album.id, albumId));
  }

  /**
   * One live photograph per slot is a unique index, checked row by row, so the
   * gallery steps aside first and then takes its new places.
   */
  async reorder(tx: DbOrTx, albumId: string, slots: (string | null)[]): Promise<void> {
    await tx
      .update(photo)
      .set({ position: sql`${photo.position} + ${PARKED}` })
      .where(and(eq(photo.albumId, albumId), gte(photo.position, 1), live));
    for (const [index, id] of slots.entries()) {
      if (id)
        await tx
          .update(photo)
          .set({ position: index + 1 })
          .where(eq(photo.id, id));
    }
  }
}
