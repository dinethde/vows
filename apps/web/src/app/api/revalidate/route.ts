import { createHmac, timingSafeEqual } from 'node:crypto';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';

import { revalidateSecret } from '@/config/env';

const MAX_AGE_MS = 5 * 60_000;
const MAX_PATHS = 20;
const payload = z.object({
  paths: z.array(z.string().startsWith('/')).max(MAX_PATHS),
  issuedAt: z.number(),
});

/** Not 401: a prober learns nothing, not even that this endpoint exists. */
const notFound = (): Response => new Response('Not found', { status: 404 });

function signedBy(body: string, signature: string): boolean {
  const expected = createHmac('sha256', revalidateSecret()).update(body).digest('hex');
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  // Constant time, so the signature cannot be guessed a character at a time.
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

/** A signed body that is not JSON is refused like any other bad call, not a 500. */
function parseJson(body: string): unknown {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

/**
 * The only way anything outside the web app can make it rebuild a page. The
 * secret signs the body and never travels, and the body carries its own time,
 * so a captured call is useless after five minutes.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  if (!signedBy(body, request.headers.get('x-vows-signature') ?? '')) return notFound();

  const parsed = payload.safeParse(parseJson(body));
  // Fresh within five minutes either way: a call dated in the future, from a
  // skewed clock or a crafted body, would otherwise never go stale.
  if (!parsed.success || Math.abs(Date.now() - parsed.data.issuedAt) > MAX_AGE_MS) {
    return notFound();
  }

  // The pages read the API through fetches tagged `albums`. Without this the
  // page would rebuild from the reply it already had.
  revalidateTag('albums');
  for (const path of parsed.data.paths) revalidatePath(path);

  return Response.json({ revalidated: parsed.data.paths.length });
}
