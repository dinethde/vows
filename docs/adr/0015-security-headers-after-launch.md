# 0015 — Security headers ship after launch, not before

- **Status:** accepted
- **Date:** 2026-10-11
- **Chapter:** 19

## The problem

The drafted Content-Security-Policy would have broken the site. It had no nonce
for the inline scripts Next injects, did not name Clerk's host, and limited
`font-src` to `'self'` while Google Fonts serves from a second origin. A CSP
that is wrong does not warn anyone: the page renders blank and the server log is
clean.

## What we decided

No security headers are set for now. The target set stays written down in
chapter 19, and turning it on is its own pull request, verified on staging with
the browser console open. The CSP is assembled in middleware, not
`next.config.ts`, because a static header cannot carry a per-request nonce.

## Why

The headers protect against clickjacking, MIME-sniffing and downgrade attacks.
On a site with no accounts, no payments and no user-submitted HTML, the exposure
in the weeks before launch hardening is small and well understood. A blank home
page in the first week is neither. Shipping the drafted policy as written would
have traded a small risk for a certain outage.

## What we did not do

- **Ship the drafted CSP now** — it breaks the site. That is the finding.
- **Ship no headers ever** — they are cheap and they belong on. This is a
  deferral with a date, not a dismissal.

## What this costs us

Until it lands the site runs without those protections, and the work has to stay
on the launch list — deferred hardening that is not written down is hardening
that never happens. The appendix in `architecture.md` carries the line.

## How we would undo it

Turn it on. Report-only first if the staging check is not conclusive: collect
reports for a few days, then flip to enforcing.
