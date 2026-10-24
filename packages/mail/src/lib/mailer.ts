import type { RenderedMail } from './render';

const ENDPOINT = 'https://api.resend.com/emails';
const TIMEOUT_MS = 20_000;

export interface Mailer {
  /** The key makes a retry harmless: Resend sends one email per key. */
  send: (to: string, mail: RenderedMail, idempotencyKey: string) => Promise<void>;
}

export interface MailerOptions {
  apiKey: string;
  from: string;
}

/** The one place that talks to Resend. Nothing else in the repository sends mail. */
export function createMailer({ apiKey, from }: MailerOptions): Mailer {
  return {
    async send(to, mail, idempotencyKey) {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
          'idempotency-key': idempotencyKey,
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      // Throwing is what lets the job retry.
      if (!response.ok) {
        // Resend's own sentence says which rule refused it ("domain not
        // verified", "testing emails go only to your own address"). It can
        // name an address, so any address is masked before it reaches a log.
        const reason = await response
          .json()
          .then((body: unknown) => (body as { message?: unknown } | null)?.message)
          .catch(() => undefined);
        const detail =
          typeof reason === 'string' ? ` ${reason.replaceAll(/\S+@\S+/g, '<address>')}` : '';
        throw new Error(`Resend answered ${String(response.status)}.${detail}`);
      }
    },
  };
}
