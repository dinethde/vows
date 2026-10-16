import { timestamp } from 'drizzle-orm/pg-core';

/** Every table carries both, in UTC. Colombo time is a view-layer concern. */
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
