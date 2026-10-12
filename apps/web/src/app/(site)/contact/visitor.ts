import { createHmac } from 'node:crypto';

import { headers } from 'next/headers';

import { revalidateSecret } from '@/config/env';

/**
 * The visitor's address, signed for the API. The form posts from this server,
 * so without this the API's hourly limit would count every visitor as one.
 * Vercel writes `x-forwarded-for` itself and puts the visitor first; a value
 * the visitor sent is replaced, not kept. The API ignores an unsigned address.
 */
export async function visitorHeaders(): Promise<Record<string, string> | undefined> {
  const incoming = await headers();
  const forwarded = incoming.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded ?? incoming.get('x-real-ip') ?? undefined;
  if (!ip) return undefined;
  const signature = createHmac('sha256', revalidateSecret()).update(`visitor:${ip}`).digest('hex');
  return { 'x-vows-visitor-ip': ip, 'x-vows-visitor-signature': signature };
}
