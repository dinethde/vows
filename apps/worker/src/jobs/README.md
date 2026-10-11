# Jobs

One folder per queue. The folder name is the queue name, so `photo-process/`
handles the `photo-process` queue and nothing else.

Each folder holds:

```
photo-process/
  handler.ts   # the function pg-boss calls
  payload.ts   # the Zod schema for the job payload
  index.ts     # { queue, schema, handler, options }
```

Four rules, from chapter 13 of `architecture.md`:

1. **Every handler is safe to run twice.** pg-boss can deliver a job more than
   once. Check whether the work is already done before doing it.
2. **The payload is validated with Zod before anything else happens.** A bad
   payload fails loudly and immediately, not halfway through.
3. **No handler talks to another handler.** If one job needs to cause another,
   it sends a new job.
4. **Retries and timeouts are declared in `index.ts`,** not scattered inside
   the handler.
