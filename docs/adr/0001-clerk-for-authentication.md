# 0001 — Clerk for authentication

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 09

## The problem

Two people sign in to the Studio. Nobody else ever signs in — couples reach
their album through a link, not an account. We still need sessions that survive
a browser restart, a password reset that works, and a token the NestJS API can
verify on its own.

## What we decided

Clerk handles sign-in, sessions and the password reset. The API verifies the
Clerk JWT; there is no user table of our own beyond a `studio_users` row keyed by
the Clerk user id.

## Why

Two users is far inside Clerk's free tier, and the whole surface — hosted pages,
session refresh, token verification in Node — is work we would otherwise write
and then have to be right about. Getting authentication subtly wrong is the one
bug class that cannot be patched quietly.

## What we did not do

- **Better Auth** — good, and self-hosted, but it puts session storage, email
  delivery and the reset flow back on us.
- **Auth0** — the free tier is generous but the paid step is steep, and it is
  heavier than two users need.
- **Writing it ourselves** — the cheapest option until the first mistake.

## What this costs us

A vendor in the sign-in path, and a monthly bill the day the studio grows past
the free tier. Clerk's components also pull their own CSS into the Studio, which
is why the CSP drafted in chapter 19 has to name Clerk's host when it is
turned on (decision 015).

## How we would undo it

The only Clerk-shaped thing in our data is a user id. Swapping providers means
changing the token verifier in `apps/api/src/common/guards` and re-inviting two
people.
