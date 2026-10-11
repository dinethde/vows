import { index, jsonb, pgTable, text } from 'drizzle-orm/pg-core';

import { album } from './album';
import { timestamps } from './columns';

/** Written whenever a slug changes, so an old link still resolves. */
export const slugRedirect = pgTable('slug_redirect', {
  id: text('id').primaryKey(),
  fromSlug: text('from_slug').notNull().unique(),
  toAlbumId: text('to_album_id')
    .notNull()
    .references(() => album.id, { onDelete: 'cascade' }),
  ...timestamps,
});

/** The few things the studio edits that are not content. */
export const setting = pgTable('setting', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  ...timestamps,
});

/** Append only. The actor is a Clerk id, not a row here. */
export const auditLog = pgTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    actorClerkId: text('actor_clerk_id').notNull(),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id').notNull(),
    diff: jsonb('diff'),
    ...timestamps,
  },
  (table) => [index('audit_entity_idx').on(table.entity, table.entityId, table.createdAt.desc())],
);
