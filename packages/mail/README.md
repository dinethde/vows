# @vows/mail

Every email Vows sends, and the one Resend client that sends them.

```
src/templates/   one React Email component per message
src/lib/         the Resend client, the from-addresses, the plain-text fallback
```

The messages, from chapter 18:

| Template | Trigger | To |
|---|---|---|
| `enquiry-received` | the contact form | the couple |
| `enquiry-notify` | the contact form | the studio |
| `album-ready` | an album is published | the couple |
| `album-link` | the studio shares an album | whoever they name |
| `download-ready` | a full-album zip finishes | whoever asked |

Rules:

- **nothing calls `resend.emails.send()` except this package.** The API and the
  worker both enqueue a `send-email` job; the worker's handler calls in here.
- every template has a plain-text version. Some clients never render the HTML.
- the DNS records that make these deliverable — SPF, DKIM, DMARC — are in
  chapter 18 and on the launch checklist in chapter 31.
- never put a real address in a template preview. Use `couple@example.com`.
