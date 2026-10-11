---
name: adding-a-background-job
description: How to add a pg-boss job to the Vows worker — the handler, the enqueue, retries and the rules that keep it safe to run twice. Use when work is too slow to do inside a request.
---

# Adding a background job

Anything slower than about 300 ms becomes a job. The queue is a schema inside
the same Postgres everything else uses, which is what lets a job and the row it
refers to be written in one transaction.

## The steps

1. **Name it `noun.verb`** — `photo.derive`, `album.revalidate`,
   `enquiry.notify`. The catalogue in chapter 11 is the list of names in use.
2. **Add the folder** `apps/worker/src/jobs/<name-with-hyphens>/` — the queue
   `photo.derive` lives in `photo-derive/` — holding `handler.ts`, `payload.ts`
   and `index.ts`. The handler calls the same services the API uses; it does not
   reimplement them. `jobs/README.md` has the table that maps the two.
3. **Enqueue inside the transaction** that changes the row:

   ```ts
   await db.transaction(async (tx) => {
     await tx.update(photo).set({ status: 'processing' }).where(eq(photo.id, id));
     await boss.send('photo.derive', { photoId: id });
   });
   ```

4. **Register it** with its retry count, timeout and concurrency, and add the
   row to the catalogue in `architecture.md` and the Figma page.
5. **Test it twice.** Literally: run the handler twice on the same payload and
   assert the second run changes nothing.

## The four rules

- **Safe to run twice.** A worker can die after the work and before marking the
  job done. Upsert, or overwrite the same key.
- **Trust the payload for nothing but an id.** Read current state from the
  database — by the time the job runs, the row may have changed.
- **Throw to fail.** Returning normally marks it complete. Never catch and
  return quietly.
- **Permanent failures throw `PermanentJobError`** so pg-boss does not retry
  something that can never succeed.

## If it is scheduled

Add the cron entry, and have the handler report to the dead-man's switch **after**
the work. A scheduled job that stops running produces no error — only silence —
and the heartbeat is the only thing that can tell you.
