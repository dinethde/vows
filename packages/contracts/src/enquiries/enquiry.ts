import { z } from 'zod';

import { isoDate, isoDateTime } from '../shared/dates';
import { enquiryId } from '../shared/ids';
import { page } from '../shared/pagination';

export const ENQUIRY_STATUSES = ['new', 'read', 'replied', 'archived'] as const;
export const enquiryStatus = z.enum(ENQUIRY_STATUSES);
export type EnquiryStatus = z.infer<typeof enquiryStatus>;

/** A submission younger than this was not typed by a person. */
export const MIN_FORM_OPEN_MS = 3000;
export const NOTES_MAX = 2000;

/**
 * The contact form and the API both parse with this. The messages are the ones
 * the form shows under a field, so they say what to do.
 */
export const createEnquiry = z.object({
  name: z.string().trim().min(2, 'Tell us your name.').max(120),
  email: z
    .string()
    .trim()
    .max(254)
    .email('That does not look like a full email address. Try name@example.com'),
  phone: z.string().trim().min(5, 'We need a number in case we cannot reach you by email.').max(32),
  weddingDate: isoDate,
  weddingPlace: z.string().trim().max(160).optional(),
  notes: z.string().trim().max(NOTES_MAX).optional(),
  /** Honeypot. A person never sees it, so it must come back empty. */
  website: z.string().max(0),
  /** When the form was shown, in milliseconds since the epoch. */
  openedAt: z.number().int().positive(),
});
export type CreateEnquiry = z.infer<typeof createEnquiry>;

export const enquiryAccepted = z.object({ id: enquiryId });
export type EnquiryAccepted = z.infer<typeof enquiryAccepted>;

export const enquiry = z.object({
  id: enquiryId,
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  weddingDate: isoDate.nullable(),
  weddingPlace: z.string().nullable(),
  notes: z.string().nullable(),
  status: enquiryStatus,
  createdAt: isoDateTime,
});
export type Enquiry = z.infer<typeof enquiry>;

export const enquiryList = page(enquiry);
export type EnquiryList = z.infer<typeof enquiryList>;

export const enquiryListQuery = z.object({
  status: enquiryStatus.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().min(1).max(512).optional(),
});
export type EnquiryListQuery = z.infer<typeof enquiryListQuery>;

export const updateEnquiry = z.object({ status: enquiryStatus });
export type UpdateEnquiry = z.infer<typeof updateEnquiry>;
