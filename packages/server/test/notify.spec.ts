import type { INestApplicationContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { enquiry, newId } from '@vows/db';
import type { Db } from '@vows/db';
import type { RenderedMail } from '@vows/mail';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module';
import { DB } from '../src/database/database.module';
import { MAILER, NotifyService } from '../src/modules/enquiry/notify.service';

import { hasDatabase } from './harness';

interface Sent {
  to: string;
  mail: RenderedMail;
  key: string;
}

describe.skipIf(!hasDatabase)('enquiry.notify', () => {
  let app: INestApplicationContext;
  let db: Db;
  const sent: Sent[] = [];
  const id = newId('enquiry');

  beforeAll(async () => {
    // The real service with a mailer that records instead of sending.
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MAILER)
      .useValue({
        send: (to: string, mail: RenderedMail, key: string) =>
          Promise.resolve(sent.push({ to, mail, key })),
      })
      .compile();
    app = await module.init();
    db = app.get<Db>(DB);
    await db.insert(enquiry).values({
      id,
      name: 'Benali Perera',
      email: 'benali.notify@example.com',
      phone: '+94 71 657 0999',
      weddingDate: '2027-02-14',
      notes: 'Outdoor ceremony at sunset.',
    });
  });

  afterAll(async () => {
    await db.delete(enquiry).where(eq(enquiry.id, id));
    await app.close();
  });

  it('sends the studio the enquiry and the couple a confirmation', async () => {
    await app.get(NotifyService).send(id);
    expect(sent.map((item) => item.to)).toEqual([
      'info.vowslk@gmail.com',
      'benali.notify@example.com',
    ]);
    expect(sent[0]?.mail.subject).toBe('New enquiry — Benali Perera, 14 February 2027');
    expect(sent[0]?.mail.text).toContain(`/studio/enquiries?open=${id}`);
    expect(sent[1]?.mail.subject).toBe('We have your message — Vows');
  });

  it('uses the same two keys on a second run, so Resend sends nothing twice', async () => {
    await app.get(NotifyService).send(id);
    expect(sent.slice(2).map((item) => item.key)).toEqual(sent.slice(0, 2).map((item) => item.key));
    expect(sent[0]?.key).toBe(`enquiry-notify/${id}`);
  });

  it('does nothing for an enquiry that no longer exists', async () => {
    const before = sent.length;
    await app.get(NotifyService).send('enq_gone000000');
    expect(sent).toHaveLength(before);
  });
});
