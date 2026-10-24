import { sql } from 'drizzle-orm';
import { bigint, index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

import { album } from './album';
import { timestamps } from './columns';
import { photoStatus } from './enums';

/** One uploaded original. Position 0 is the cover, 1 to 18 the gallery. */
export const photo = pgTable(
  'photo',
  {
    id: text('id').primaryKey(),
    albumId: text('album_id')
      .notNull()
      .references((): AnyPgColumn => album.id, { onDelete: 'cascade' }),
    originalKey: text('original_key').notNull().unique(),
    // The browser sends one per file and repeats it on a retry.
    idempotencyKey: text('idempotency_key').unique(),
    width: integer('width'),
    height: integer('height'),
    bytes: bigint('bytes', { mode: 'number' }),
    mime: text('mime'),
    thumbhash: text('thumbhash'),
    alt: text('alt'),
    position: integer('position').notNull(),
    status: photoStatus('status').notNull().default('pending'),
    errorCode: text('error_code'),
    replacesPhotoId: text('replaces_photo_id').references((): AnyPgColumn => photo.id, {
      onDelete: 'set null',
    }),
    supersededAt: timestamp('superseded_at', { withTimezone: true }),
    removedAt: timestamp('removed_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    // One live photograph per slot. A replaced or removed row keeps its
    // position for the record, so it has to sit outside the constraint.
    uniqueIndex('photo_album_position_idx')
      .on(table.albumId, table.position)
      .where(sql`${table.removedAt} is null and ${table.supersededAt} is null`),
    // What the Studio polls: normally a handful of rows, usually none.
    index('photo_status_idx')
      .on(table.status)
      .where(sql`${table.status} <> 'ready'`),
  ],
);
