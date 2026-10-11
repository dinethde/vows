# apps/worker/src

A Nest application with no HTTP listener. `main.ts` builds it with
`NestFactory.createApplicationContext()`, so the modules, providers and
dependency injection are the same as `apps/api` — only the transport is gone.

```
main.ts     creates the context, starts pg-boss, registers every queue
jobs/       one folder per queue — see jobs/README.md
lib/        the pg-boss wrapper, the R2 client, the sharp pipeline
config/     environment parsing, with Zod
```

Why share Nest with the API rather than write a small script: the services that
do the work — writing a photograph row, sending an email — already exist there,
with their own providers and their own tests. A second dependency-injection
story would mean two of each.
