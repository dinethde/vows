import { describe, expect, it, vi } from 'vitest';

import { createMailer, renderEnquiryNotify, renderEnquiryReceived } from './index';

const enquiry = {
  name: 'Benali Perera',
  email: 'benali.perera@example.com',
  phone: '+94 71 657 0999',
  weddingDate: '14 February 2027',
  weddingPlace: 'Mount Lavinia Hotel',
  notes: 'See <a href="https://phish.example">our site</a> for details.',
  receivedAt: '9 October 2026 at 14:03',
  studioUrl: 'https://vows.lk/studio/enquiries?open=enq_0041',
};

describe('the notification to the studio', () => {
  it('puts the name and the date in the subject', async () => {
    const mail = await renderEnquiryNotify(enquiry);
    expect(mail.subject).toBe('New enquiry — Benali Perera, 14 February 2027');
  });

  it('says "date TBC" when the couple has no date yet', async () => {
    const mail = await renderEnquiryNotify({ ...enquiry, weddingDate: null });
    expect(mail.subject).toBe('New enquiry — Benali Perera, date TBC');
  });

  it('shows a link typed into the notes as text, never as a link', async () => {
    const mail = await renderEnquiryNotify(enquiry);
    expect(mail.html).not.toContain('href="https://phish.example"');
    expect(mail.html).toContain('&lt;a href=');
  });

  it('carries every field and the way into the Studio, in HTML and in plain text', async () => {
    const mail = await renderEnquiryNotify(enquiry);
    for (const value of [enquiry.email, enquiry.phone, enquiry.weddingPlace]) {
      expect(mail.html).toContain(value);
      expect(mail.text).toContain(value);
    }
    expect(mail.text).toContain(enquiry.studioUrl);
  });
});

describe('the reply to the couple', () => {
  it('confirms the message arrived and says how long a reply takes', async () => {
    const mail = await renderEnquiryReceived({ name: 'Benali', phone: '+94 71 657 0999' });
    expect(mail.subject).toBe('We have your message — Vows');
    expect(mail.text).toContain('a reply usually takes a day or two');
    expect(mail.text).toContain('+94 71 657 0999');
  });
});

describe('a send Resend refuses', () => {
  it('says why, without the address', async () => {
    const reply = {
      message: 'You can only send testing emails to your own email address (owner@example.com).',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(reply), { status: 403 })),
    );
    const mailer = createMailer({ apiKey: 're_test', from: 'Vows <hello@resend.dev>' });
    const mail = { subject: 'Hello', html: '<p>Hello</p>', text: 'Hello' };
    const sending = mailer.send('couple@example.com', mail, 'key-1');
    await expect(sending).rejects.toThrow(
      'Resend answered 403. You can only send testing emails to your own email address <address>',
    );
    await expect(sending).rejects.not.toThrow('owner@example.com');
    vi.unstubAllGlobals();
  });
});
