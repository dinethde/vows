# Jobs

One folder per queue, named after it with the dot written as a hyphen — so
`photo-derive/` handles the `photo.derive` queue and nothing else. The catalogue
in chapter 11 of `architecture.md` is the list of queue names in use; a folder
here that is not in that table is a bug in one of the two.

Each folder has a `handler.ts` that takes the Nest application and returns the
function the queue calls. The payload schemas are in `packages/contracts`
(`JOBS`); retries, timeouts, concurrency and schedules are in the catalogue in
`packages/server/src/queue/catalogue.ts`.

| Folder                 | Queue                  | Runs when                                                    |
| ---------------------- | ---------------------- | ------------------------------------------------------------ |
| `photo-derive`         | `photo.derive`         | an upload is confirmed                                       |
| `album-revalidate`     | `album.revalidate`     | any change to a published album, or a photograph on it ready |
| `enquiry-notify`       | `enquiry.notify`       | a new enquiry arrives                                        |
| `photo-cleanup`        | `photo.cleanup`        | a photograph is removed, and nightly                         |
| `album-sitemap`        | `album.sitemap`        | cron, 03:00 Asia/Colombo                                     |
| `housekeeping-archive` | `housekeeping.archive` | cron, 03:30 — deletes enquiries older than 24 months         |
| `housekeeping-orphans` | `housekeeping.orphans` | cron, Sunday 04:00 — counts R2 objects with no row           |
| `db-backup`            | `db.backup`            | cron, Sunday 02:00 — pg_dump to the backups bucket           |

Four rules, from chapter 11:

1. **Every handler is safe to run twice.** pg-boss can deliver a job more than
   once. Check whether the work is already done before doing it.
2. **The payload is trusted for nothing but an id.** Read current state from
   the database; by the time the job runs the row may have changed.
3. **Throwing is how a handler reports failure.** Returning normally marks the
   job complete. A permanent failure throws `PermanentJobError`, so the queue
   does not retry something that can never succeed. A handler is told when an
   attempt is the last one, so `photo.derive` can mark the photograph failed.
4. **Retries, timeout and concurrency are declared in the catalogue,** not
   scattered through the handlers.

`housekeeping-orphans` deletes nothing: it reports how many stored files no row
points at. It is safe to leave on during a database restore.
