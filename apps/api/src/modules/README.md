# Modules

One folder per resource, each with the same four files when it needs them:

```
albums/
  albums.module.ts
  albums.controller.ts   # HTTP only — parse, authorise, delegate
  albums.service.ts      # the actual work, and the only place Drizzle is used
  albums.schema.ts       # re-exports the Zod schemas from @vows/contracts
```

The controller never touches the database and the service never touches the
request object. `queue/` is the only module allowed to call `pg-boss.send()` —
everything else asks it to.

Chapter 12 of `architecture.md` has the full list and what each one owns.
