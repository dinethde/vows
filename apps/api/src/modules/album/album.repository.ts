import { Inject, Injectable } from '@nestjs/common';
import { album, newId, photo, photoDerivative, slugRedirect } from '@vows/db';
import type { Db, DbOrTx } from '@vows/db';
import { and, asc, desc, eq, inArray, isNull, ne } from 'drizzle-orm';

import { DB } from '../../database/database.module';

export type AlbumRow = typeof album.$inferSelect;
export type PhotoRow = typeof photo.$inferSelect;
export type DerivativeRow = typeof photoDerivative.$inferSelect;
export type PhotoWithFiles = PhotoRow & { derivatives: DerivativeRow[] };
export type AlbumChanges = Partial<typeof album.$inferInsert>;

/** A photograph still in its slot: not removed, not replaced. */
const live = and(isNull(photo.removedAt), isNull(photo.supersededAt));

@Injectable()
export class AlbumRepository {
  constructor(@Inject(DB) private readonly db: Db) {}

  findById(id: string, tx: DbOrTx = this.db): Promise<AlbumRow | undefined> {
    return tx.query.album.findFirst({ where: eq(album.id, id) });
  }

  findBySlug(slug: string, tx: DbOrTx = this.db): Promise<AlbumRow | undefined> {
    return tx.query.album.findFirst({ where: eq(album.slug, slug) });
  }

  async findByOldSlug(slug: string): Promise<AlbumRow | undefined> {
    const [row] = await this.db
      .select({ album })
      .from(slugRedirect)
      .innerJoin(album, eq(album.id, slugRedirect.toAlbumId))
      .where(eq(slugRedirect.fromSlug, slug));
    return row?.album;
  }

  listPublished(): Promise<AlbumRow[]> {
    return this.db
      .select()
      .from(album)
      .where(eq(album.status, 'published'))
      .orderBy(desc(album.sortIndex), desc(album.shotOn));
  }

  listAll(): Promise<AlbumRow[]> {
    return this.db.select().from(album).orderBy(desc(album.sortIndex), asc(album.id));
  }

  /** Live photographs of these albums with their files, in slot order. */
  async photosOf(albumIds: string[], tx: DbOrTx = this.db): Promise<PhotoWithFiles[]> {
    if (albumIds.length === 0) return [];
    const rows = await tx
      .select()
      .from(photo)
      .where(and(inArray(photo.albumId, albumIds), live))
      .orderBy(asc(photo.position));
    if (rows.length === 0) return [];
    const files = await tx
      .select()
      .from(photoDerivative)
      .where(
        inArray(
          photoDerivative.photoId,
          rows.map((row) => row.id),
        ),
      )
      .orderBy(asc(photoDerivative.width));
    return rows.map((row) => ({
      ...row,
      derivatives: files.filter((file) => file.photoId === row.id),
    }));
  }

  async slugTaken(slug: string, exceptAlbumId: string, tx: DbOrTx): Promise<boolean> {
    const rows = await tx
      .select({ id: album.id })
      .from(album)
      .where(and(eq(album.slug, slug), ne(album.id, exceptAlbumId)))
      .limit(1);
    return rows.length > 0;
  }

  async update(tx: DbOrTx, id: string, changes: AlbumChanges): Promise<AlbumRow> {
    const [row] = await tx.update(album).set(changes).where(eq(album.id, id)).returning();
    if (!row) throw new Error(`Album ${id} vanished during an update.`);
    return row;
  }

  /** The old address keeps working. A redirect out of the new one would loop, so it goes. */
  async redirect(tx: DbOrTx, fromSlug: string, toSlug: string, albumId: string): Promise<void> {
    await tx.delete(slugRedirect).where(eq(slugRedirect.fromSlug, toSlug));
    await tx
      .insert(slugRedirect)
      .values({ id: newId('redirect'), fromSlug, toAlbumId: albumId })
      .onConflictDoUpdate({ target: slugRedirect.fromSlug, set: { toAlbumId: albumId } });
  }
}
