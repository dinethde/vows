# 0008 — Cloudflare Web Analytics, and no cookie banner

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 20

## The problem

The studio wants to know which albums get looked at and where enquiries come
from. A wedding site is also the last place anyone wants a consent dialog
covering the photographs.

## What we decided

Cloudflare Web Analytics, one script, no cookies, no cross-site identifiers, and
therefore no cookie banner.

## Why

It answers the only questions being asked — pageviews, referrers, Core Web
Vitals — for nothing, without storing anything on a visitor's device. No cookie
means no consent requirement, which removes a banner, a preferences store and a
category of legal risk at once.

## What we did not do

- **Plausible** — the same privacy story and better reports, but it is a paid
  subscription for numbers we will glance at monthly.
- **Google Analytics** — far more data than we need, a consent banner, and a
  visitor profile we did not ask to be responsible for.

## What this costs us

Shallow reporting: no funnels, no retention, no custom events worth the name. If
the studio ever wants to know _why_ an album underperforms, this will not tell
them.

## How we would undo it

One script tag in the site layout. Adding Plausible later is a one-line change
and a subscription.
