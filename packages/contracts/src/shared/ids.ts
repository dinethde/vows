import { z } from 'zod';

/** Every id is a prefix and a random tail, so a log line says what it is. */
export const ID_PREFIXES = {
  album: 'alb',
  photo: 'pho',
  derivative: 'drv',
  enquiry: 'enq',
  redirect: 'rdr',
  audit: 'aud',
} as const;

export type IdKind = keyof typeof ID_PREFIXES;

function prefixed(kind: IdKind): z.ZodString {
  return z.string().regex(new RegExp(`^${ID_PREFIXES[kind]}_[0-9a-z]{6,32}$`));
}

export const albumId = prefixed('album');
export const photoId = prefixed('photo');
export const derivativeId = prefixed('derivative');
export const enquiryId = prefixed('enquiry');

/** The URL part of an album: lower case words joined by hyphens. */
export const slug = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
