---
name: adding-an-api-endpoint
description: The full path for adding an endpoint to the Vows API — contract, controller, service, repository, client method and test. Use when the Studio or the site needs something the API does not expose yet.
---

# Adding an API endpoint

Six files, in this order. Skipping the first one is how the two sides drift.

## 1 · The contract

`packages/contracts/src/<resource>.ts` — the Zod schema for the request body and
for the response, plus the inferred types. This package depends on `zod` and
nothing else, so both the browser and the API can import it.

## 2 · The controller

`apps/api/src/<resource>/<resource>.controller.ts` — parse, authorise, call one
service, shape the response. No business rules, no database.

- The route follows chapter 08: plural nouns, kebab-case, no verbs.
- Studio routes live under `/v1/studio/`.
- The Zod schema runs in a pipe before the controller sees the body.

## 3 · The service

Business rules, transactions, enqueuing. If the work takes longer than ~300 ms,
the service enqueues a job and returns 202 — it does not wait.

## 4 · The repository

Drizzle queries. It decides nothing.

## 5 · The client method

`apps/web/src/lib/api/<resource>.ts` — one typed method, returning the type
inferred from the contract. Nothing else in `apps/web` calls `fetch`.

## 6 · The test

An integration test against a real Neon branch, not a mock: the happy path, the
403 for the wrong role, and the 400 for a body the schema rejects.

## Before you open the PR

- Does the error envelope come back in the house shape, with a `requestId`?
- Does the status code match the table in chapter 08 — 202 for enqueued work,
  409 for a conflict, 422 when the shape is right but the meaning is wrong?
- Is the route in the chapter 08 table in `architecture.md`? Add it there in the
  same pull request, and in the Figma page it reflects.
