import { z } from 'zod';

/**
 * Every code the API can answer with. A code never changes once shipped,
 * because the web app switches on it.
 */
export const ERROR_CODES = [
  'bad_request',
  'unauthorized',
  'forbidden',
  'not_found',
  'album_not_found',
  'photo_not_found',
  'enquiry_not_found',
  'slug_taken',
  'album_not_publishable',
  'album_not_published',
  'photo_not_uploaded',
  'photo_slot_taken',
  'unsupported_media_type',
  'file_too_large',
  'rate_limited',
  'internal_error',
] as const;

export const errorCode = z.enum(ERROR_CODES);
export type ErrorCode = z.infer<typeof errorCode>;

export const errorEnvelope = z.object({
  error: z.object({
    code: errorCode,
    message: z.string(),
    requestId: z.string(),
    fields: z.record(z.string()).optional(),
  }),
});
export type ErrorEnvelope = z.infer<typeof errorEnvelope>;
