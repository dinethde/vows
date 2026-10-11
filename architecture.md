---
source:     Figma — Architecture.md (page 2388:2315)
reflects:   version 2.2
written:    2026-10-11
authority:  reflection only. Figma is the source of truth.
---

# Vows — architecture

This file repeats what the Figma page decided, so an agent working in this
repository can follow it. If this file and the Figma page disagree, **the Figma
page is right** and this file needs rewriting — in the same pull request as the
code that depends on the change.

Chapter numbers below match the Figma page, so "chapter 11" means the same
thing in both places.

---

## 02 · Product and surfaces

Two halves, one database, almost nothing else shared.

| Surface | Who | What they do | How it is built |
| --- | --- | --- | --- |
| `vows.lk` | Couples, planners, strangers | Browse albums, read, send an enquiry | Static pages, rebuilt on publish, served from the edge |
| `vows.lk/studio` | The photographer | Make albums, upload photographs, read enquiries | Signed-in app. Never cached, never indexed |

**Deliberately not built:** no client logins or private galleries, no payments,
no general CMS, no second language, no native app. Each "no" is weight the
system does not carry, and several later decisions depend on them.

**Size being built for:** ~40 albums (headroom 500), 30–120 photographs per
album (headroom 400), ~4,000 photographs total (headroom 100,000), 5–20
enquiries a month, under 50 concurrent readers, 1 Studio user (headroom 5).

---

## 03 · The shape of the system

Five things run. Everything else is a library inside one of them.

```
Visitor ──► Cloudflare CDN ──► Next.js (Vercel) ──► NestJS API (Fly) ──► Postgres (Neon)
                   │                                      │                    ▲
                   │                                      ▼                    │
                   └──── images ◄──── R2 (public) ◄── Worker (Fly) ────────────┘
                                      R2 (private originals)
```

Five rules hold the shape together:

1. A visitor's request never reaches Postgres. Public pages are files.
2. Only the API writes to the database. Not the web app, not a script, not a
   hand-run migration against production.
3. Photographs never pass through the API. The browser uploads straight to R2;
   the worker reads straight from R2.
4. Anything slower than ~300 ms becomes a job.
5. The worker and the API are one codebase deployed twice. They differ by an
   environment variable and an entry point.

Nothing stores state in memory between requests. Both processes can be killed
at any moment without losing work.

---

## 04 · Tech stack

| Layer | Choice | Version |
| --- | --- | --- |
| Framework | Next.js, App Router | 15.x |
| UI | React | 19.x |
| Language | TypeScript, strict | 5.6 |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui, copied into `packages/ui` | — |
| Motion | Motion | 11.x |
| API | NestJS | 11.x |
| Runtime | Node | 22 LTS |
| Validation | Zod | 3.x |
| Server state | TanStack Query — **Studio only** | 5.x |
| Database access | Drizzle ORM | 0.3x |
| Database | PostgreSQL on Neon | 17 |
| Job queue | pg-boss (a schema inside the same database) | 10.x |
| Object storage | Cloudflare R2 | — |
| Image processing | sharp | 0.33 |
| Blur placeholder | thumbhash | — |
| Auth | Clerk | — |
| Mail | Resend + React Email | — |
| Analytics | Cloudflare Web Analytics | — |
| Secrets | Bitwarden | — |
| Errors | Sentry | — |
| Logs | pino | 9.x |
| Monorepo | pnpm workspaces + Turborepo | — |
| Tests | Vitest + Playwright | — |

Versions are pinned exactly in `package.json`. No carets, no tildes. CI installs
with a frozen lockfile.

**Not in the stack, on purpose:** Redis (the queue lives in Postgres), a state
library (there is no global store), an image CDN service (derivatives are built
once at upload), Prisma, axios.

---

## 05 · Repository layout

```
apps/web        every route a browser can reach. The single API client lives
                in src/lib/api — nothing else calls fetch against the API
apps/api        controllers, services, guards. The only writer to the database
apps/worker     job handlers. The same Nest modules, no HTTP listener
packages/db         Drizzle tables, migrations, seed, the typed client factory
packages/contracts  Zod schemas and the types inferred from them. Depends on zod and nothing else
packages/tokens     generated from Figma. Never edited by hand
packages/ui         the Figma library in React, built on copied shadcn primitives
packages/mail       React Email templates and a thin Resend wrapper
packages/config     shared eslint, tsconfig and tailwind presets
infra           fly.api.toml, fly.worker.toml, r2-bucket-policy.json
docs/adr        one markdown file per decision
docs/incidents  two or three lines, written the same day
.claude         rules, skills, agents, commands and hooks — chapter 28
.github         ci.yml, deploy.yml, the pull request template, CODEOWNERS
.husky          commit-msg and pre-commit
```

At the root: `architecture.md` and `design.md` (both reflections of Figma),
`CLAUDE.md`, `turbo.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`,
`eslint.config.js`, `commitlint.config.js`, `.lintstagedrc.json` and
`.env.example`.

Rules between packages: applications never import from other applications;
`packages/contracts` stays dependency-free so both sides can use it;
`packages/db` is a data layer, not a service layer.

---

## 06 · Environments and configuration

Four environments: local, preview (one per pull request, with its own Neon
branch), staging, production.

Every variable is listed in `.env.example`. Nothing outside a config module
touches `process.env`: each app has one file that parses the shape it needs with
Zod and throws before the server starts listening. A missing variable is a crash
in the first second, not a null three hours later.

**Secrets:** Bitwarden holds the only readable copy. Vercel, Fly and GitHub are
deployment targets — nothing is typed into them that was not written in the
vault first, and when the two disagree the vault is right. Fly and GitHub are
write-only by design, which is exactly why the vault has to exist. Local
development injects from the vault (`bws run -- pnpm dev`) rather than keeping a
production value on disk.

A new variable lands in four places in the same pull request: a Bitwarden item,
`.env.example`, the Zod schema, and the table in chapter 06 of the Figma page.

---

## 07 · Data model

Seven tables of ours, plus whatever pg-boss creates for itself.

| Table | What it is |
| --- | --- |
| `album` | One finished wedding. slug, title, couple_names, shot_on, location, story, cover_photo_id, status, published_at, sort_index, seo_title, seo_description |
| `photo` | album_id, original_key, width, height, bytes, mime, thumbhash, alt, position, status, error_code, replaces_photo_id, superseded_at, removed_at |
| `photo_derivative` | photo_id, format, width, height, key, bytes |
| `enquiry` | name, email, phone, wedding_date, wedding_place, notes, status, ip_hash, user_agent |
| `slug_redirect` | from_slug → to_album_id, written automatically when a slug changes |
| `setting` | key/value. Studio-editable bits: notify address, phone, social links, pinned album |
| `audit_log` | actor_clerk_id, action, entity, entity_id, diff |

Conventions that apply everywhere:

- Primary keys are prefixed text ids generated in the application: `alb_`,
  `pho_`, `drv_`, `enq_`.
- Every table carries `created_at` and `updated_at`, both `timestamptz`, always
  UTC. Converting to Colombo time happens in the view layer and nowhere else.
- snake_case, singular table names. Drizzle maps to camelCase in TypeScript.
- Postgres enum types, not free text with a check constraint.
- Nothing is hard-deleted except derivative rows during cleanup. Albums and
  enquiries move to an archived status.
- Foreign keys are always declared, always with an explicit on-delete rule.

**Nothing in the application deletes an album row.** There is no endpoint for it
and no button in the Studio, which is why `cover_photo_id` is the only pointer
that ever has to be repaired. Taking a wedding off the site is unpublishing it.
Removing it for good is a developer at the database, through the runbook in
chapter 30, with a backup taken first — the cascade on `photo.album_id` means
that one row carries every photograph with it.

`replaces_photo_id` is set on the new row when a photograph replaces another. It
makes the history readable a year later, and it is what lets the album cover
follow the replacement in the same transaction.

---

## 08 · API design

REST over HTTPS, prefixed `/v1`. Plural nouns, kebab-case, no verbs in paths.
camelCase JSON. Dates as ISO 8601 in UTC. Collections are always wrapped
(`{ data, nextCursor }`); single items are returned bare. Mutations return the
object as it now is.

Status codes, and only these: 200, 201, 202, 204, 400, 401, 403, 404, 409, 422,
429, 500.

Every failure uses one envelope:

```json
{ "error": { "code": "album_missing_cover", "message": "…", "requestId": "req_…",
             "fields": { "coverPhotoId": "Required" } } }
```

`code` is a stable snake_case string the client may switch on. `message` is
written for the photographer, never containing a stack trace or a table name.
`requestId` is on every response, including successes.

Routes: `GET /v1/albums`, `GET /v1/albums/:slug`, `POST /v1/enquiries`, and
under `/v1/studio/`: albums (list, create, patch, publish, order), photos
(upload-url, uploaded, patch, delete), enquiries (list, patch). Plus `/healthz`
and `/readyz`.

Pagination is cursor-based, never offset. Upload endpoints accept an
`Idempotency-Key`. Every request body is parsed by its Zod schema from
`packages/contracts` before a controller sees it.

---

## 09 · Authentication

Clerk. The browser holds a cookie; Clerk turns it into a short-lived signed
token; the token travels in the `Authorization` header; the API verifies the
signature against cached JWKS and checks the claims; the role comes out of the
verified payload. Roles: `owner`, `editor`. There are no customer accounts.

---

## 10 · Image pipeline

One photograph becomes twelve objects in storage and eleven rows.

1. The browser checks type and size locally, refusing anything over 60 MB.
2. It asks the API for somewhere to put it. The API creates a `photo` row with
   status `pending` and returns a presigned PUT valid for five minutes.
3. The browser uploads straight to the private bucket. The bytes never touch the
   API or Vercel.
4. The browser confirms; the API checks the object exists, then enqueues
   `photo.derive` **inside the same transaction** that flips the row to
   `processing`.
5. The worker reads the original, takes the real dimensions from the bytes, and
   produces five widths (320, 640, 1024, 1600, 2400) in AVIF and WebP, plus a
   1200 × 630 share card. EXIF is stripped apart from orientation.
6. ThumbHash produces ~25 bytes that live in a column, not a file.
7. All files are written, then the derivative rows and the photo update land in
   one transaction.

Keys contain ids, never filenames:
`originals/{albumId}/{photoId}.{ext}` and `d/{photoId}/{width}.{format}`.
Keys are immutable — replacing a photograph creates a new photo id — which is
what makes `cache-control: immutable` safe on derivatives.

Replacing and removing a photograph both look like one action in the Studio and
are not:

- **Replacing** creates a new `photo` row with a new id and new keys, recording
  `replaces_photo_id`. It inherits the old row's position and alt text. If the
  album's `cover_photo_id` pointed at the old row it is repointed at the new one
  **in the same transaction** — there is never a moment where an album points at
  a photograph on its way out. The old row gets `superseded_at`.
- **Removing** sets `removed_at`, closes up the positions after it, and leaves
  every file in R2. For thirty days it can be undone by clearing that column.
  After thirty days `photo.cleanup` deletes the ten derivatives and the original,
  and that is the point of no return. A photograph that never finished processing
  is cleaned after seven days instead, because there is nothing to look at.

If the removed photograph was the cover, `cover_photo_id` empties — it is `on
delete set null` — and the publish checks refuse an album with no cover, so a
coverless album cannot go out by accident.

---

## 11 · Background jobs

pg-boss is a library, not a server. It creates a `pgboss` schema inside the
database we already run. Enqueuing is an INSERT, so a job and the row it refers
to are written in one transaction — the guarantee that makes this worth more
than Redis.

| Job | Enqueued by | Retries | Timeout |
| --- | --- | --- | --- |
| `photo.derive` | API, when an upload is confirmed | 3 | 5 min |
| `album.revalidate` | API, on publish, unpublish or slug change | 5 | 30 s |
| `enquiry.notify` | API, on a new enquiry | 5 | 30 s |
| `photo.cleanup` | API, when a photograph is deleted, and after a publish | 3 | 2 min |
| `album.sitemap` | Cron, 03:00 Asia/Colombo | 2 | 60 s |
| `housekeeping.archive` | Cron, 03:30 Asia/Colombo | 1 | 60 s |
| `housekeeping.orphans` | Cron, Sunday 04:00 Asia/Colombo | 1 | 10 min |
| `db.backup` | Cron, Sunday 02:00 Asia/Colombo | 2 | 15 min |

Retries back off 30 s, 2 m, 8 m, 32 m with jitter. A job that reaches `failed`
is never retried automatically: it sits in the table with its error and alerts.

Rules every handler follows:

- **Safe to run twice.** A worker can die after the work and before marking the
  job done. Upsert rather than insert; overwrite the same key rather than append.
- **Never trust the payload beyond an id.** Read current state from the database.
- **Payloads carry ids, never objects.**
- **Throwing is how a handler reports failure.** Never catch and return quietly.
- A permanent failure throws `PermanentJobError` and is not retried.
- Scheduled jobs report to a dead-man's-switch after the work, so silence is
  detectable.

### What gets backed up, and what does not

`db.backup` copies the database once a week, not the photographs: a compressed
`pg_dump` of every table, written to a separate R2 bucket under the date,
keeping the last eight. Neon's own restore already covers the last few days;
this covers the case where the Neon account itself is the problem, which is the
only case a backup inside the same provider cannot help with.

**The photographs are deliberately not backed up.** A second copy of fifty
gigabytes would cost more every month than the database backup costs in a year,
and the originals already sit in two unrelated places: R2, which is durable
storage rather than a scratch disk, and the photographer's own drives, which is
where they came from. That is the trade, written down so it is a decision and
not an oversight.

A backup is only real once it has been restored. The steps are in chapter 30 and
they get run in the first week, from a real backup file into a fresh Neon branch
— not the first time something is wrong.

---

## 12 · Rendering and caching

Public pages are files on a CDN, rebuilt when the photographer publishes and at
no other time. Publishing calls `album.revalidate`, which calls the rebuild
endpoint in Next with a shared secret plus an `issuedAt` inside a five-minute
window, so the call cannot be replayed.

Studio pages are dynamic and never cached. Every authenticated fetch carries
`cache: 'no-store'` — the client sets it automatically whenever a token is
present. Without it, Next can cache an authenticated response and two signed-in
people see each other's data.

**Share cards.** Every page declares a 1200 × 630 image: an album shows its
cover with the couple's names and the date; other pages show the studio card; an
album with no cover falls back to a static card. Width and height are declared,
URLs are absolute, and the album page emits `ImageGallery` JSON-LD while the
home page emits `LocalBusiness`.

---

## 13 · Enquiry flow

Six fields, no account, no captcha. The form validates with the same Zod schema
the API uses. The API checks a honeypot field is empty, that the form was open
for more than three seconds, and that the IP hash has not sent five enquiries in
the last hour. The row is written and `enquiry.notify` is enqueued in one
transaction; the API returns 202 in about 300 ms. The worker then sends two
emails: the notification to the studio and an auto-reply to the couple.

If spam appears, Cloudflare Turnstile goes in front of the submit button — half
a day of work, and not before it is needed.

**Deliverability is part of launch:** SPF, DKIM and DMARC records on `vows.lk`,
and a real test to a Gmail address confirmed to land in the inbox.

---

## 14 · Frontend architecture

Server Components by default. `"use client"` only when a hook or an event
handler forces it, and then as far down the tree as it goes.

```
apps/web/src/app/
├─ (site)/            public, shares the navbar and footer
│  ├─ page.tsx        home — also mounts the first-load sound gate
│  ├─ albums/[slug]/page.tsx
│  ├─ about/ contact/ privacy/
├─ studio/            signed in, no shared chrome, no-store
├─ api/revalidate/route.ts
├─ not-found.tsx      404 — real status
├─ error.tsx          500 — the client boundary, owns reset()
├─ global-error.tsx   500 in the root layout — renders its own <html>
├─ sitemap.ts  robots.ts  middleware.ts
```

**One API client.** `apps/web/src/lib/api` — transport plus one typed method per
endpoint. It mounts the base URL, the Authorization header, `no-store` when a
token is present, the idempotency key, the request id, the Zod parse and the
error envelope. `serverApi()` and `browserApi()` differ only in where the token
comes from. Nothing else calls `fetch` against the API; a lint rule enforces it.

**TanStack Query is a cache, not a transport.** It never makes a request — every
`queryFn` calls the client above. It is mounted in the Studio layout only,
because a Server Component renders once and is gone, so there is no later in
which a refetch could happen. Public pages `await` the client directly.

**State:** the URL holds anything that should survive a refresh. React state
holds what is genuinely local. There is no global store. Two things persist:
whether the music is paused (sessionStorage) and the gallery view (localStorage),
both read inside try/catch with a sensible default.

**Error pages** return real status codes. The numeral is decorative and
`aria-hidden`; the headline is the only `h1`.

**The music** loads with `preload="none"`, from the public bucket, after the
visitor chooses. See `design.md` and chapter 14 of the Figma page.

---

## 15 · Backend architecture

Two processes, one codebase. Four layers, and what each may do:

| Layer | May | May not |
| --- | --- | --- |
| Controller | Parse, authorise, call one service, shape the response | Contain business rules or touch the database |
| Service | Business rules, transactions, enqueue jobs | Know about HTTP |
| Repository | Drizzle queries | Decide anything |
| Job handler | Call the same services | Duplicate a service's logic |

The worker imports the same Nest modules and is started without an HTTP
listener. Neither process holds an HTTP client for our own API, and neither has
TanStack Query. Errors cross the boundary once, in a global exception filter
that produces the envelope.

---

## 16 · Design system in code

See `design.md`. The short version: tokens are generated from Figma, never
hand-edited, and CI fails if the build output differs from what is committed.

---

## 17 · Accessibility

WCAG 2.2 AA is the floor. The interesting part on a photography site is that the
content is images: **an album cannot be published with a photograph that has no
description.** That is a publish gate, not a lint warning. Focus is visible,
focus order follows reading order, and `prefers-reduced-motion` is honoured.

---

## 18 · Performance budgets

Measured on a throttled connection, enforced in CI, per route rather than per
site. The public site ships no data library and no third-party script except the
Cloudflare Web Analytics beacon. Adding another is an architecture decision, not
a ticket.

---

## 19 · Security

- Nothing secret is committed. `.env.example` holds names with empty values. A
  pre-commit hook runs gitleaks.
- Two buckets: originals private and never served, derivatives public.
- **No rate limit is ever counted in process memory.** A counter inside one API
  process is correct only while there is one process; the moment Fly runs a
  second machine the limit quietly doubles. The general limits are a Cloudflare
  rule at the edge, where a flood is stopped before it costs anything to serve.
  The enquiry form counts rows written in the last hour, because the database is
  one shared memory by definition and the form is already writing to it.
- **Security headers are off for now, deliberately.** The target set — CSP,
  HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` — is
  drafted in chapter 19 of the Figma page and none of it is set. A CSP is the one
  header that breaks a working site in silence: Next injects inline scripts that
  need a per-request nonce, Clerk loads from its own host, and Google Fonts
  serves from a second origin. It goes on as its own pull request, assembled in
  middleware rather than `next.config.ts` because a static header cannot carry a
  per-request nonce, and checked on staging with the console open.
- **Photographs can be downloaded, and that is the decision.** Web sizes are
  display copies; the originals are never served.
- A secret that has appeared anywhere it should not is dead. Rotate it.

---

## 20 · Observability

One log format (pino, JSON lines, to stdout), one request id threaded through
every line and into every job payload, and six alerts that are allowed to
interrupt someone. `/healthz` says the process is alive; `/readyz` checks
Postgres, R2 and the queue. A liveness check never touches the database.

All six alerts are Sentry rules, and they arrive as a push notification on the
phone through the Sentry mobile app. One tool runs the whole table: the error and
error-rate rules read the events the three apps already send; *site is down* and
*certificate expiry* are a Sentry uptime monitor on the home page, which checks
the certificate on the same pass; the two queue rules are metric alerts on the
counts the worker reports. Only the two *wake someone* rules send a push — the
rest send email, so the phone stays quiet for what can wait until morning.

---

## 21 · Testing

Enough tests that a refactor is not frightening, few enough that nobody deletes
them in a hurry. No coverage percentage to hit. The journeys that must have an
end-to-end test: publish an album and see it on the site, upload a photograph
and watch it become ready, send an enquiry and receive both emails, sign in to
the Studio, and a 404 for an album that does not exist.

---

## 22 · Git workflow

Trunk-based, squash merges, linear history.

| Branch | What it is |
| --- | --- |
| `main` | The released state. Receives release merges from `dev-v2` and nothing else |
| `dev-v2` | The integration branch. Every pull request lands here first |
| `type/short-description` | One piece of work, hours to three days |

**During the v2 build** the loop is different, deliberately: the work happens in
the `V2` worktree on the single long-lived branch `feat/implementation-v2`. That
is the one documented exception to the three-day branch rule, because v2 is a
rebuild rather than a change. Pull requests target `dev-v2`, permanently.

Branches are updated by rebasing onto the base, never by merging into them.
Force-push with `--force-with-lease`, never plain `--force`.

---

## 23 · Commit guidelines

Conventional Commits: `type(scope): subject`, checked by commitlint locally and
in CI.

- The subject says the **effect**, not the file. Imperative, lowercase, no full
  stop, 60 characters or fewer.
- Most commits have no body. If there is one, it must say at least one thing the
  diff cannot: the reason, the constraint, what you tried first, who asked.
- Never open with "This commit", "This change" or "This PR".
- No filler adjectives, no emoji, **no tool attribution of any kind**.
- No numbers you did not measure.

The full rules, the word list and the five-question check are in
`.claude/skills/writing-commits/SKILL.md`, which Claude Code loads before writing
any message. A `commit-msg` hook rejects attribution, filler words and the dead
openings.

---

## 24 · Pull request guidelines

Base branch `dev-v2`. The title becomes the squash commit, so it follows the
commit rules. The description answers four questions in prose — what was wrong,
what you did, what you ruled out, how you know it works — in under 200 words,
with one line on risk and a link to the Figma node or the chapter it implements.

"All tests pass" is not evidence. Name the command, the screen, the screenshot.
A pull request can be sent back for its description alone.

---

## 25 · CI and deployment

GitHub Actions on every push: typecheck, lint, unit, integration, build, e2e,
lighthouse, axe, and `tokens:build` diff. On merge, Vercel takes the web app and
Fly takes the API and the worker, with migrations running between the two so the
database is always ahead of the code that needs it. That ordering is what makes
rollback possible: a migration is additive first, destructive only in a later
release.

---

## 26 · Definition of done

Code, tests, interface, operations, documentation — and the honest version: the
change works for the photographer on her own machine, the architecture page and
these reflections are still true, and nothing was left for "later" that is
really "never".

---

## 27 · Coding standards

TypeScript strict, no exceptions. Specific house rules:

- Spacing with flexbox and `gap`. No margins between siblings.
- A component file stays under 250 lines.
- Avoid `useEffect`. Reach for it only for a genuine subscription to something
  outside React.
- Memoise only after measuring.
- Shared logic becomes a custom hook; markup and logic live apart.
- Import order: third-party → react → aliases → relative.
- Keys are stable and unique across the app, never an array index.
- Props use a named exported interface in a `.types.ts` beside the component,
  never inline in the signature.

---

## 28 · How Claude Code is set up here

Everything an agent needs is in `.claude/` at the repository root, and the root
is the only place `settings.json` is read from — it does **not** inherit from a
parent directory. Inside a worktree, the worktree root is the working directory,
so `V2/.claude/settings.json` is the file that applies there.

`CLAUDE.md` is different: it inherits upward, so the root file applies
everywhere and each app's `CLAUDE.md` adds only what is true of that app. That
is why the per-app `.claude/` folders hold **skills only** — a `settings.json`
in `apps/web/.claude/` would never be read.

```
.claude/
  settings.json   permissions, and the three hooks below
  rules/          eight rules, loaded as context: api-client, components,
                  database-writes, generated-files, jobs, secrets,
                  studio-no-store, tokens
  skills/         eight procedures: adding-an-api-endpoint,
                  adding-a-background-job, adding-a-shadcn-primitive,
                  running-a-migration, syncing-design-tokens,
                  writing-an-adr, writing-commits, opening-a-pull-request
  agents/         design-reviewer, architecture-auditor, test-planner
  commands/       /ready, /pr, /adr, /tokens
  hooks/          guard-generated.sh, guard-commit.sh, format-edited.sh
```

The three hooks, and what each one refuses:

| Hook | When | What it stops |
| --- | --- | --- |
| `guard-generated.sh` | before a write | editing a generated file — `packages/tokens/css/*`, `packages/db/migrations/*`, anything with the generated banner |
| `guard-commit.sh` | before a bash command | a commit whose message carries tool attribution, a filler word, or "this commit" |
| `format-edited.sh` | after a write | nothing — it runs prettier on what was just written |

Two standing rules that are not in any file because they are absolute: **no tool
attribution anywhere** — not in a commit, a trailer, or a pull request body — and
**pull requests open against `dev-v2`, never `main`**.

---

## 29 · Decision log

Fifteen decisions, each with a file in `docs/adr`:

| # | Decision | Chosen over |
| --- | --- | --- |
| 001 | Clerk for authentication | Better Auth, Auth0, writing it ourselves |
| 002 | pg-boss for the job queue | BullMQ with Redis, SQS |
| 003 | Cloudflare R2 for storage | S3, Supabase Storage |
| 004 | Drizzle over Prisma | Prisma, raw pg |
| 005 | Static pages with on-demand rebuilds | Server rendering every request |
| 006 | Derivatives built at upload | Resizing on request through a CDN worker |
| 007 | Monorepo with pnpm and Turborepo | Separate repositories |
| 008 | Cloudflare Web Analytics, no cookie banner | Plausible (paid), Google Analytics (banner) |
| 009 | One API client, TanStack Query in the Studio only | A generic request() helper, axios interceptors |
| 010 | Bitwarden as the source of truth for secrets | 1Password, Doppler, no readable copy |
| 011 | Music, but only after the visitor asks for it | Autoplay, no music at all |
| 012 | No way to delete an album, anywhere in the product | A delete button with a confirmation, a soft delete with an archive |
| 013 | Weekly database backup; the photographs are not backed up | Backing up everything, backing up nothing, a copy at a second provider |
| 014 | Rate limits are never counted in memory | An in-process counter, pinning the API to one machine, adding Redis |
| 015 | Security headers ship after launch, not before | Shipping the drafted CSP now, shipping no headers at all |

---

## 30 · Runbooks

Ten, in chapter 30 of the Figma page: photographs stuck on uploading; an album
published but the site unchanged; enquiry emails not arriving; the database
refusing connections; R2 costs jumping; something deployed that should not have
been; nobody able to sign in; a secret leaked or someone with access leaving;
the database restored from a backup; an album removed for good.

Two of those are worth knowing before they are needed. **Restoring the
database** stops writes first (`fly scale count 0` on both apps), restores into
a *new* Neon branch rather than over the broken one, and ends by turning
`housekeeping.orphans` off until the photographer has re-uploaded — anything
uploaded after the backup has files in R2 with no row, which is exactly what
that sweep deletes. **Removing an album** starts by asking whether unpublish is
enough, takes a manual `db.backup` first, and decides what happens to the files
before the row goes, because the cascade removes the photograph rows without
enqueuing any cleanup.

---

## 31 · Glossary

Chapter 31 of the Figma page is a glossary of the terms used here — derivative,
ThumbHash, revalidate, presigned URL, dead-man's switch and the rest. It is not
repeated in this file; read it there when a word is unfamiliar.

---

## Appendix · Launch checklist

Not a chapter of the Figma page — a working list assembled from chapters 18, 19,
20 and 32. In order, because several of these depend on the one above.

**Domain and mail**

- `vows.lk` pointed at Vercel; `cdn.vows.lk` at the R2 derivatives bucket
- Resend domain verified, and the three records that make mail deliverable:
  **SPF**, **DKIM**, and a **DMARC** record at `_dmarc.vows.lk`
  (`v=DMARC1; p=quarantine; rua=mailto:dmarc@vows.lk`)
- a test enquiry sent to a Gmail address and a Yahoo address, and both arrived
  in the inbox rather than the spam folder

**Secrets and access**

- every production value in the Bitwarden vault, under `vows/`
- the same values pushed to Vercel, Fly and GitHub Actions, each read from the
  vault inline
- vault export taken and stored offline; recovery tried once, from the export,
  before it is needed

**The applications**

- Neon production branch created, migrations applied by the deploy workflow
- `vows-api` and `vows-worker` deployed, `/health` green, one job processed end
  to end
- R2 CORS applied; an upload from the real domain completes
- Clerk production instance, both studio users invited and signed in once

**Before anyone is told about it**

- Cloudflare Web Analytics script live, and a pageview visible
- Sentry receiving from all three apps, with a release tagged
- the six Sentry alert rules configured, push on in the Sentry mobile app, and
  each rule fired deliberately once
- `db.backup` run by hand, and the restore rehearsed into a throwaway Neon
  branch
- 404, 500 and 403 checked on the real domain
- share cards checked in WhatsApp, Messenger and iMessage — the three places a
  wedding link actually gets sent
- Lighthouse on the home page and one album page, against the budgets in
  chapter 18
- the privacy page live and linked from the footer
- one album published, opened on a real phone on mobile data, scrolled to the
  end

---

## 32 · Cost and billing

Roughly USD 30–55 a month plus about USD 27 a year for the domain. Two settings
decide most of it: whether Neon is allowed to suspend compute, and whether the
API machine auto-stops when idle. The only line that grows with use is R2
storage, at about 0.06 US cents per photograph per month, because R2 egress is
free.

---

## What to do when this file is wrong

Say so, and fix it in the pull request that noticed — after fixing the Figma
page, which is the thing this file reflects. A stale reflection is worse than no
reflection, because it is believed.
