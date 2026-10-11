import { date, index, pgTable, text } from 'drizzle-orm/pg-core';

import { timestamps } from './columns';
import { enquiryStatus } from './enums';

export const enquiry = pgTable(
  'enquiry',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    // Stored exactly as typed. Sri Lankan numbers arrive in four shapes.
    phone: text('phone'),
    weddingDate: date('wedding_date'),
    weddingPlace: text('wedding_place'),
    notes: text('notes'),
    status: enquiryStatus('status').notNull().default('new'),
    // SHA-256 of the address with a server-side salt. Never shown.
    ipHash: text('ip_hash'),
    userAgent: text('user_agent'),
    ...timestamps,
  },
  (table) => [
    index('enquiry_inbox_idx').on(table.status, table.createdAt.desc()),
    index('enquiry_ip_recent_idx').on(table.ipHash, table.createdAt.desc()),
    index('enquiry_email_recent_idx').on(table.email, table.createdAt.desc()),
  ],
);
