---
paths: ['apps/worker/**']
---

A job handler must be safe to run twice, must read current state from the
database rather than trusting its payload beyond an id, and must report failure
by throwing. Never catch an error and return quietly — that marks the job done
and the work is lost. Payloads carry ids, never objects.
