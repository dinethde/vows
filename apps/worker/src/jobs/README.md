# Jobs

One folder per queue, named after it with the dot written as a hyphen — so
`photo-derive/` handles the `photo.derive` queue and nothing else. The catalogue
in chapter 11 of `architecture.md` is the list of queue names in use; a folder
here that is not in that table is a bug in one of the two.

```
photo-derive/
  handler.ts   the function pg-boss calls
  payload.ts   the Zod schema for the job payload
  index.ts     { queue, schema, handler, options }
```

| Folder | Queue | Runs when |
|---|---|---|
| `photo-derive` | `photo.derive` | an upload is confirmed |
| `album-revalidate` | `album.revalidate` | publish, unpublish or a slug change |
| `enquiry-notify` | `enquiry.notify` | a new enquiry arrives |
| `photo-cleanup` | `photo.cleanup` | a photograph is removed, and after a publish |
| `album-sitemap` | `album.sitemap` | cron, 03:00 Asia/Colombo |
| `housekeeping-archive` | `housekeeping.archive` | cron, 03:30 Asia/Colombo |
| `housekeeping-orphans` | `housekeeping.orphans` | cron, Sunday 04:00 — deletes R2 objects with no row |
| `db-backup` | `db.backup` | cron, Sunday 02:00 — pg_dump to the backups bucket |

Four rules, from chapter 11:

1. **Every handler is safe to run twice.** pg-boss can deliver a job more than
   once. Check whether the work is already done before doing it.
2. **The payload is trusted for nothing but an id.** Validate it with Zod, then
   read current state from the database — by the time the job runs the row may
   have changed.
3. **Throwing is how a handler reports failure.** Returning normally marks the
   job complete. A permanent failure throws `PermanentJobError` so pg-boss does
   not retry something that can never succeed.
4. **Retries, timeout and concurrency are declared in `index.ts`,** not
   scattered through the handler.

A scheduled job reports to the dead-man's switch *after* the work. One that
stops running produces no error, only silence, and the heartbeat is the only
thing that notices.

`housekeeping-orphans` deletes storage objects that no row points at. During a
database restore that is the wrong thing to do — see the restore runbook in
chapter 30, which turns it off until the gap has been re-uploaded.
