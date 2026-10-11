# 0002 — pg-boss for the job queue

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 11

## The problem

Uploading forty photographs cannot happen inside an HTTP request. Something has
to resize, build a ThumbHash, write derivatives to R2 and retry the ones that
fail, without the browser waiting.

## What we decided

pg-boss, running on the same Neon Postgres the application already uses. The
worker is a separate Fly app with no HTTP listener.

## Why

We already pay for Postgres. pg-boss adds a schema, not a service: no second
database to back up, no second set of credentials, no second thing to be down.
Job state is visible with the same SQL as everything else, which matters a lot
at three in the morning.

## What we did not do

- **BullMQ with Redis** — better throughput than we will ever need, at the price
  of a Redis instance to pay for, secure and monitor.
- **SQS** — cheap and reliable, but it puts the queue in a third cloud and makes
  local development need credentials.

## What this costs us

Job polling keeps a connection open, which is exactly the thing that burns Neon
compute hours (chapter 32). Throughput is bounded by Postgres, so a very large
batch processes steadily rather than quickly.

## How we would undo it

Job payloads are plain Zod-validated objects and handlers do not know what
delivered them. Moving to another queue means rewriting the thin layer in
`apps/worker/src/lib`.
