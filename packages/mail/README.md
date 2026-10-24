# @vows/mail

Every email Vows sends, and the one Resend client that sends them.

```
src/templates/   one React Email component per message, and the shared layout
src/lib/         render (HTML and plain text) and the mailer that calls Resend
```

The messages:

| Template           | Trigger          | To         |
| ------------------ | ---------------- | ---------- |
| `enquiry-received` | the contact form | the couple |
| `enquiry-notify`   | the contact form | the studio |

Rules:

- **Nothing calls Resend except this package.** The API stores the enquiry and
  enqueues `enquiry.notify` in the same transaction; the worker's handler
  renders both messages here and sends them.
- Each send carries an idempotency key, so a retried job does not send twice.
- Every template has a plain-text version. Some clients never render the HTML.
- The DNS records that make these deliverable — SPF, DKIM, DMARC — are on the
  launch checklist in `architecture.md`.
- Never put a real address in a template preview. Use `couple@example.com`.
