import { enquiry } from '@vows/db';
import { like, sql } from 'drizzle-orm';
import request from 'supertest';
import type { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { signVisitor } from '../src/modules/enquiry/visitor';

import { hasDatabase, startApp } from './harness';
import type { Harness } from './harness';

const RUN = `it-${String(Date.now())}`;
let sequence = 0;

function body(change: Record<string, unknown> = {}): Record<string, unknown> {
  sequence += 1;
  return {
    name: 'Benali Perera',
    email: `${RUN}-${String(sequence)}@example.com`,
    phone: '+94 71 657 0999',
    weddingDate: '2027-02-14',
    notes: 'Outdoor ceremony at sunset.',
    website: '',
    openedAt: Date.now() - 10_000,
    ...change,
  };
}

describe.skipIf(!hasDatabase)('POST /v1/enquiries', () => {
  let harness: Harness;
  let http: App;

  beforeAll(async () => {
    harness = await startApp();
    http = harness.app.getHttpServer() as App;
  });

  afterAll(async () => {
    await harness.db.execute(
      sql`delete from pgboss.job where name = 'enquiry.notify' and data->>'enquiryId' in (select id from enquiry where email like ${`${RUN}%`})`,
    );
    await harness.db.delete(enquiry).where(like(enquiry.email, `${RUN}%`));
    await harness.app.close();
  });

  it('stores the enquiry and its notify job together, and answers 202', async () => {
    const response = await request(http)
      .post('/v1/enquiries')
      .set('x-forwarded-for', '203.0.113.10')
      .send(body());
    expect(response.status).toBe(202);
    expect(response.headers['x-request-id']).toMatch(/^req_/);

    const id = (response.body as { id: string }).id;
    const jobs = await harness.db.execute(
      sql`select state from pgboss.job where name = 'enquiry.notify' and data->>'enquiryId' = ${id}`,
    );
    expect(jobs.rows).toHaveLength(1);
  });

  it('returns the first enquiry when the same message arrives again within ten minutes', async () => {
    const same = body();
    const first = await request(http)
      .post('/v1/enquiries')
      .set('x-forwarded-for', '203.0.113.11')
      .send(same);
    const second = await request(http)
      .post('/v1/enquiries')
      .set('x-forwarded-for', '203.0.113.11')
      .send(same);
    expect(second.status).toBe(202);
    expect(second.body).toEqual(first.body);
  });

  it('refuses a filled honeypot with a field map', async () => {
    const response = await request(http)
      .post('/v1/enquiries')
      .send(body({ website: 'https://spam.example' }));
    expect(response.status).toBe(400);
    expect((response.body as { error: { code: string; fields: object } }).error).toMatchObject({
      code: 'bad_request',
      fields: { website: expect.any(String) as string },
    });
  });

  it('accepts a form from a visitor whose clock runs ten minutes fast', async () => {
    const response = await request(http)
      .post('/v1/enquiries')
      .set('x-forwarded-for', '203.0.113.12')
      .send(body({ openedAt: Date.now() + 600_000 }));
    expect(response.status).toBe(202);
  });

  it('refuses a form that was open for under three seconds', async () => {
    const response = await request(http)
      .post('/v1/enquiries')
      .send(body({ openedAt: Date.now() - 500 }));
    expect(response.status).toBe(400);
  });

  it('answers 429 with Retry-After on the sixth enquiry in an hour from one address', async () => {
    const send = () =>
      request(http).post('/v1/enquiries').set('x-forwarded-for', '203.0.113.99').send(body());
    for (let count = 0; count < 5; count += 1) expect((await send()).status).toBe(202);

    const sixth = await send();
    expect(sixth.status).toBe(429);
    expect(sixth.headers['retry-after']).toBe('3600');
    expect((sixth.body as { error: { code: string } }).error.code).toBe('rate_limited');
  });

  it('counts each visitor the web app vouches for, not the web server they all arrive through', async () => {
    const secret = process.env.REVALIDATE_SECRET ?? '';
    const from = (visitor: string, signature = signVisitor(visitor, secret)) =>
      request(http)
        .post('/v1/enquiries')
        .set('x-forwarded-for', '203.0.113.200')
        .set('x-vows-visitor-ip', visitor)
        .set('x-vows-visitor-signature', signature)
        .send(body());

    for (let count = 0; count < 5; count += 1)
      expect((await from('198.51.100.20')).status).toBe(202);
    expect((await from('198.51.100.20')).status).toBe(429);
    // Someone else, through the same web server, is not held up by them.
    expect((await from('198.51.100.21')).status).toBe(202);
  });

  it('does not let a caller name an address the web app never signed', async () => {
    const from = (visitor: string) =>
      request(http)
        .post('/v1/enquiries')
        .set('x-forwarded-for', '203.0.113.201')
        .set('x-vows-visitor-ip', visitor)
        .set('x-vows-visitor-signature', 'not-a-signature')
        .send(body());

    for (let count = 0; count < 5; count += 1)
      expect((await from(`198.51.100.${String(30 + count)}`)).status).toBe(202);
    expect((await from('198.51.100.99')).status).toBe(429);
  });
});
