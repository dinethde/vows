import type { ErrorCode } from '@vows/contracts';

/** Adding an error is a class and one row here. Every route gets it at once. */
export const STATUS: Record<ErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  album_not_found: 404,
  photo_not_found: 404,
  enquiry_not_found: 404,
  slug_taken: 409,
  photo_slot_taken: 409,
  album_not_published: 409,
  album_not_publishable: 422,
  photo_not_uploaded: 422,
  unsupported_media_type: 422,
  file_too_large: 422,
  rate_limited: 429,
  internal_error: 500,
};
