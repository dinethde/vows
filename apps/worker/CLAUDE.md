# apps/worker

The same NestJS application as `apps/api`, started without an HTTP listener.
It imports the same modules and calls the same services — it never reimplements
them.

Every handler:

- is **safe to run twice** — upsert, or overwrite the same object key;
- **trusts its payload for nothing but an id**, and reads current state from the
  database;
- **throws to fail**. Returning normally marks the job complete and the work is
  silently lost;
- throws `PermanentJobError` for something that can never succeed, so pg-boss
  does not retry it;
- logs one line per meaningful event, carrying the request id from the payload.

A scheduled handler reports to its dead-man's switch **after** the work, never
before. Silence is the failure mode these jobs have.

Full rules: `architecture.md` chapters 10, 11 and 15.
