import { z } from 'zod';

import { albumId, derivativeId, photoId } from '../shared/ids';

export const PHOTO_STATUSES = ['pending', 'processing', 'ready', 'failed'] as const;
export const photoStatus = z.enum(PHOTO_STATUSES);
export type PhotoStatus = z.infer<typeof photoStatus>;

export const IMAGE_FORMATS = ['avif', 'webp'] as const;
export const DERIVATIVE_WIDTHS = [320, 640, 1024, 1600, 2400] as const;

/** Slot 0 is the cover. Slots 1 to 18 are the gallery, in reading order. */
export const COVER_POSITION = 0;
export const GALLERY_SIZE = 18;
export const MAX_UPLOAD_BYTES = 60 * 1024 * 1024;
export const UPLOAD_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'] as const;
export const PHOTO_ERROR_CODES = [
  'wrong_file_type',
  'file_too_large',
  'processing_failed',
] as const;

export const photoPosition = z.number().int().min(COVER_POSITION).max(GALLERY_SIZE);

export const derivative = z.object({
  id: derivativeId,
  format: z.enum(IMAGE_FORMATS),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  url: z.string().url(),
  bytes: z.number().int().nonnegative(),
});
export type Derivative = z.infer<typeof derivative>;

export const photo = z.object({
  id: photoId,
  albumId,
  position: photoPosition,
  status: photoStatus,
  errorCode: z.enum(PHOTO_ERROR_CODES).nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  thumbhash: z.string().nullable(),
  alt: z.string().nullable(),
  derivatives: z.array(derivative),
});
export type Photo = z.infer<typeof photo>;

export const createUploadUrl = z.object({
  position: photoPosition,
  contentType: z.enum(UPLOAD_MIME_TYPES),
  bytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});
export type CreateUploadUrl = z.infer<typeof createUploadUrl>;

export const uploadTicket = z.object({
  photo,
  uploadUrl: z.string().url(),
  expiresAt: z.string().datetime(),
});
export type UploadTicket = z.infer<typeof uploadTicket>;

export const updatePhoto = z
  .object({ alt: z.string().trim().min(1).max(300).nullable() })
  .partial()
  .refine((body) => Object.keys(body).length > 0, 'Send at least one field.');
export type UpdatePhoto = z.infer<typeof updatePhoto>;

/** The whole gallery in one request: index 0 is slot 1. `null` is an empty slot. */
export const reorderPhotos = z.object({
  slots: z.array(photoId.nullable()).length(GALLERY_SIZE),
});
export type ReorderPhotos = z.infer<typeof reorderPhotos>;
