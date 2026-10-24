# 0014 — Rate limits are never counted in memory

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 19

## The problem

A rate limit needs somewhere to remember what it has already seen. The first
draft kept that count inside the API process, which is correct for exactly as
long as there is one process.

## What we decided

No limit is ever counted in process memory. The general limits are a Cloudflare
rate-limiting rule at the edge. The enquiry form counts rows written in the last
hour, in the database.

## Why

An in-process counter fails quietly. The moment Fly runs a second machine the
limit doubles and nothing anywhere reports it — the system keeps working and the
protection is gone. Counting at the edge is also cheaper than counting in the
API, because a flood that Cloudflare rejects never reaches Fly and never costs
anything to serve. The form is the exception that proves the rule: it is already
writing a row, and the database is one shared memory by definition.

## What we did not do

- **An in-process counter** — the bug this decision exists to prevent.
- **Pin the API to one machine** — makes the counter correct by refusing to
  grow. A rule enforced by not scaling is not a rule.
- **Add Redis** — a shared counter in a fast store. Redis was removed from this
  project deliberately (see 0002) and one counter is not a reason to bring back a
  service to pay for, secure and monitor.

## What this costs us

The limits live in two places rather than one, so changing a number means
touching Cloudflare as well as the code. Local development has no edge in front
of it and therefore no general limit, which has to be remembered when testing
anything that depends on a 429.

## How we would undo it

Nothing to undo — this is a constraint, not a component.
