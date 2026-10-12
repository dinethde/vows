import { z } from 'zod';

/**
 * The only file in the web app that reads process.env. Each name is written
 * out in full, because Next replaces `process.env.NEXT_PUBLIC_*` at build time
 * and cannot see through a dynamic lookup.
 */
const schema = z.object({
  API_URL: z.string().url(),
  SITE_URL: z.string().url(),
  MEDIA_URL: z.string().url(),
});

const parsed = schema.safeParse({
  // On the server the private name wins; the browser only has the public one.
  API_URL: process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL,
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  MEDIA_URL: process.env.NEXT_PUBLIC_MEDIA_URL,
});

if (!parsed.success) {
  const missing = Object.keys(parsed.error.flatten().fieldErrors).join(', ');
  throw new Error(`Invalid environment. Refusing to start. Check: ${missing}`);
}

export const env = parsed.data;

/** Server only: signs nothing here, it is what the rebuild endpoint checks against. */
export function revalidateSecret(): string {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || secret.length < 32) throw new Error('REVALIDATE_SECRET is missing or too short.');
  return secret;
}
