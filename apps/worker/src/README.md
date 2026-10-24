# apps/worker/src

A Nest application with no HTTP listener. `main.ts` builds it with
`NestFactory.createApplicationContext()` from the `AppModule` in
`packages/server`, so the modules, providers and dependency injection are the
same as the API's; only the transport is gone.

```
main.ts     declares itself the worker, starts the queue, registers each handler
jobs/       one folder per queue, see jobs/README.md
lib/        derive-image.ts: the sharp pipeline and the blur hash
scripts/    seed-album.ts: puts a folder of photographs through the real pipeline
```

The queue wrapper, storage client, configuration and the services the jobs
call all live in `packages/server`. Configuration is parsed there, once, with
Zod; a deployed worker refuses to start without the database URL for backups,
the backups bucket, the Resend key and the sender address.

Why share Nest with the API rather than write a small script: the services that
do the work — writing a photograph row, sending an email — already exist there,
with their own providers and their own tests. A second dependency-injection
story would mean two of each.
