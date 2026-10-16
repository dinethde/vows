# 0005 — Static pages with on-demand rebuilds

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 12

## The problem

The public site changes rarely and is read often. An album published once may
be opened a thousand times in a weekend, by people on hotel wifi.

## What we decided

Public pages are statically generated and revalidated on demand: publishing an
album, or editing site copy, triggers a revalidate for the paths it touched.
Nothing on the public site renders per request.

## Why

A static page is the fastest thing we can serve and the cheapest thing Vercel
can bill us for. It also means a Neon cold start never sits between a guest and
the photographs — the data was read at build time.

## What we did not do

- **Server rendering every request** — simpler to reason about, but it puts the
  database in the path of every visitor and makes the site as slow as its
  slowest query.

## What this costs us

Anything that changes outside our own write paths will not appear until
something revalidates. Every write that affects a public page must remember to
revalidate it, and forgetting is a silent bug.

## How we would undo it

Per-route. Changing one page from static to dynamic is an export line, not an
architecture change.
