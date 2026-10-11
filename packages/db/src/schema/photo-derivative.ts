import { integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';

import { timestamps } from './columns';
import { imageFormat } from './enums';
import { photo } from './photo';

/** A file the worker made from an original. Rows, so markup can name exactly what exists. */
export const photoDerivative = pgTable(
  'photo_derivative',
  {
    id: text('id').primaryKey(),
    photoId: text('photo_id')
      .notNull()
      .references(() => photo.id, { onDelete: 'cascade' }),
    format: imageFormat('format').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    key: text('key').notNull().unique(),
    bytes: integer('bytes').notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex('derivative_lookup_idx').on(table.photoId, table.format, table.width)],
);
