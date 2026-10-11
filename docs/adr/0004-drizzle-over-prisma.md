# 0004 — Drizzle over Prisma

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 07

## The problem

We need typed database access in three places — the API, the worker, and
migrations — on a serverless Postgres where connection count and cold start both
cost money.

## What we decided

Drizzle, with the schema as TypeScript in `packages/db/src/schema` and
`drizzle-kit` generating plain SQL migrations.

## Why

Drizzle is a thin layer over SQL: the query you write is the query that runs,
which matters when you are reading a slow query log. The migrations it generates
are SQL files we can read and edit before they run. No engine binary, no
generate step before the types exist.

## What we did not do

- **Prisma** — nicer to write, but the query engine adds weight to a Fly image,
  and its migration files are less direct to review.
- **Raw `pg`** — honest and typeless. We would end up writing Drizzle badly.

## What this costs us

Less hand-holding. Drizzle will happily let you write a query that scans a
table, and relational queries are more verbose than Prisma's.

## How we would undo it

The schema is the hard part and it is plain table definitions. The migrations are
already SQL, so they survive any change of client.
