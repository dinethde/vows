# 0003 — Cloudflare R2 for storage

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 10, 16

## The problem

A wedding is a few gigabytes of originals and several times that in
derivatives, served to guests who open the album on their phones and scroll. The
bill that kills a project like this is egress, not storage.

## What we decided

Cloudflare R2, two buckets: originals (private, never served) and derivatives
(behind `cdn.vows.lk`). The browser uploads straight to a presigned URL.

## Why

R2 charges nothing for egress. Every alternative charges per gigabyte served,
and an album that gets shared on a wedding day is exactly the traffic shape that
turns into a surprise invoice. The S3 API means the AWS SDK works unchanged.

## What we did not do

- **S3** — the reference implementation, and the egress line is the whole
  objection.
- **Supabase Storage** — pleasant, but we are not using the rest of Supabase,
  and its egress is metered.

## What this costs us

Class A operations (writes) are billed, so the image pipeline should not write
more derivatives than it needs. R2's consistency and tooling are a step behind
S3's, and lifecycle rules are simpler than S3's.

## How we would undo it

The SDK is the same. Swapping to S3 is a credential change plus a copy, and the
only code that knows is `apps/worker/src/lib` and the presign endpoint.
