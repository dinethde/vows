import { sql } from 'drizzle-orm';
import { date, index, integer, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

import { timestamps } from './columns';
import { albumStatus } from './enums';
import { photo } from './photo';

/** One wedding. The set is fixed at 22 rows, and nothing deletes one. */
export const album = pgTable(
  'album',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    coupleNames: text('couple_names'),
    shotOn: date('shot_on'),
    timeOfDay: text('time_of_day'),
    weddingType: text('wedding_type'),
    location: text('location'),
    story: text('story'),
    // Must belong to this album. The service enforces that; the schema cannot.
    coverPhotoId: text('cover_photo_id').references((): AnyPgColumn => photo.id, {
      onDelete: 'set null',
    }),
    // Where the cover is cropped around on a narrow screen, as percentages.
    coverFocalX: real('cover_focal_x'),
    coverFocalY: real('cover_focal_y'),
    status: albumStatus('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    sortIndex: integer('sort_index').notNull().default(0),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    ...timestamps,
  },
  (table) => [
    // The only set the public site asks for, so it stays small.
    index('album_published_idx')
      .on(table.status, table.sortIndex.desc(), table.shotOn.desc())
      .where(sql`${table.status} = 'published'`),
  ],
);
