import { createHmac } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { ENV } from '../../config/env';
import type { Env } from '../../config/env';

const TIMEOUT_MS = 20_000;

/** The pages an album appears on: its own, the home page and the sitemap. */
export function pathsFor(slug: string, oldSlug?: string): string[] {
  const paths = [`/albums/${slug}`, '/', '/sitemap.xml'];
  return oldSlug ? [...paths, `/albums/${oldSlug}`] : paths;
}

export function sign(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

/**
 * Tells the web app which pages are out of date. The secret never travels: it
 * signs the body, and the body carries the time so a captured call goes stale.
 */
@Injectable()
export class RevalidateService {
  constructor(@Inject(ENV) private readonly env: Env) {}

  async revalidate(paths: string[], now = Date.now()): Promise<void> {
    const body = JSON.stringify({ paths, issuedAt: now });
    const response = await fetch(`${this.env.SITE_URL.replace(/\/$/, '')}/api/revalidate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-vows-signature': sign(body, this.env.REVALIDATE_SECRET),
      },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // Throwing is how the job retries. A 404 here means the two secrets differ.
    if (!response.ok) throw new Error(`The rebuild endpoint answered ${String(response.status)}.`);
  }
}
