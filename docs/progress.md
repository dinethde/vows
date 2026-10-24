# Vows v2 — build progress

This file and the git log are how a new session picks up the work. Read it
first. Update it when a milestone lands, when the plan changes, or when
something joins the "needs Dineth" list.

Last updated: 2026-10-24. The platforms are set up and checked. Staging waits
on one thing: Fly's trial has ended, and creating the two apps needs a card on
the Fly account (Dineth). Everything that does not need Fly is in place.

## Where things stand

- **Done:** milestones 0 to 4. Tokens, config, contracts, the database (22 fixed
  albums by migration), the API, the worker with all eight jobs, and the
  component library.
- **Done:** milestone 5, the public site. Every public screen is built and was
  compared with its Figma frame at 1440, 834 and 390 by the design reviewer;
  the clear mismatches are fixed and re-measured (see "Review findings").
  The contact form has its calendar and loads its code on open.
- **Done:** milestone 6, the Studio. Used signed in against the real API and
  a real Clerk instance on 2026-10-24: five end-to-end journeys pass (sign in,
  upload until ready, publish refused for a missing description, an album taken
  off the site and put back).
- **Done locally, waiting on the platforms:** milestone 7. CI and the staging
  deploy workflow are written. From the root, typecheck, lint, test and build
  pass; 28 Playwright tests pass in Chromium and WebKit; every server test
  passes live against Neon, R2 and a running worker. On CI the lint, unit,
  audit, prose and image jobs pass; the integration, end-to-end and build jobs
  need staging values and fail until those exist.
- **Not built, and why:** the enquiry inbox, settings and an albums index (no
  Figma frame); Sentry in the web app (a decision, see "Needs Dineth"); the
  signed-in end-to-end tests (need Clerk, see below).
- **Seeded and published:** album `alb_000001` (`benali-yasiru`) on the dev
  branch, with the cover and all 18 photographs from the Figma album page.
- **Cloud resources in use:** Neon project `vows-sg` (`plain-fog-47201137`,
  Singapore, Postgres 18) with branches `dev-claude` (migrated, seeded) and
  `staging` (migrated, empty). R2 buckets `vows-originals-dev` (CORS allows
  `PUT` from `http://localhost:3000`), `vows-media-dev` (public at
  `https://pub-2b21405facd34cbd996583485c36af84.r2.dev`), `vows-backups-dev`,
  and the three empty `-staging` buckets. No Fly apps, no Vercel project. The
  older Ohio Neon project `Vows` is no longer used.

## Milestones

Each one leaves something that runs.

| #   | Milestone                                                             | Leaves running                                         | State                     |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------- |
| 0   | Read the sources, check the tools, write this plan                    | `pnpm install`                                         | done                      |
| 1   | Tokens from Figma, `config`, `contracts`                              | `pnpm tokens:build`; 34 tests                          | done                      |
| 2   | Database schema, migrations, seed                                     | a seeded Neon branch with 22 albums                    | done                      |
| 3   | API and worker: config, guard, envelope, routes, the eight jobs       | `/healthz`, `/readyz`, one job end to end locally      | done bar the backup write |
| 4   | Component library in `packages/ui`                                    | each Figma component in every state, with visual tests | done                      |
| 5   | Public site: loader, music gate, home, album, contact, footer, errors | the site locally against the seeded API                | done                      |
| 6   | Studio: dashboard, album editor, confirmation scenarios               | sign in, edit, upload, publish locally                 | built, signed-in run owed |
| 7   | CI, staging, the end-to-end journeys                                  | staging green, journeys passing against it             | waits on the platforms    |

One pull request into `dev-v2`, opened as a draft after milestone 2 and updated
at the end of each later milestone.

## Tools

| Tool                | State                                                               |
| ------------------- | ------------------------------------------------------------------- |
| Figma               | Connected. Both pages open                                          |
| Browser screenshots | Works. Saves into `.playwright-mcp/` only, which is in `.gitignore` |
| `gh`                | Signed in as `dinethde`. No `workflow` scope; pushes go over SSH    |
| `vercel`            | Signed in as `dinethde`                                             |
| `fly`               | Signed in as `dev.dinethde@gmail.com`                               |
| `neonctl`           | Signed in as `dev.dinethde@gmail.com`                               |
| `wrangler`          | Signed in. R2 is on                                                 |
| Bitwarden           | Unlocked when Claude Code is started with `BW_SESSION` exported     |
| Node                | 22.23.3 through nvm, as `.nvmrc` asks                               |
| Commit signing      | Works once the SSH key is in the agent (`ssh-add -l` lists it)      |

## Staging: where it stands

Checked on 2026-10-24 with each key, printing results only:

- **Neon** (`neon/dev-secrets`): works. In GitHub as `NEON_API_KEY`, with
  `NEON_PROJECT_ID`; CI's integration job now passes on its own branch.
- **Clerk** (`clerk/dev-secrets`): development instance, session token carries
  `public_metadata`. A test owner is in the vault as `clerk/dev-test-owner`.
- **R2** (`r2/dev-secrets`): reads and writes all six buckets.
- **Resend** (`resend/dev-secrets`): a send-only key with a `resend.dev`
  sender, so Resend delivers only to the account's own address. Real
  delivery waits for a verified domain, which Dineth has put off.
- **Worker at 1 GB:** approved by Dineth on 2026-10-24.

Made for staging:

- Vault item `staging/app-secrets`: rebuild secret, IP salt, both staging
  database URLs.
- Neon branch `staging`: both migrations, 22 albums, no photographs yet.
- `vows-media-staging` public at
  `https://pub-dc564b44038b4f979f548ab1cd05ba1b.r2.dev`; upload CORS on
  `vows-originals-staging` for `https://vows-staging.vercel.app` only.
- Vercel project `vows-staging` (root `apps/web`, Next.js, Node 22) with its
  seven variables, read from the vault. Not deployed: its build reads the
  published albums from the staging API.
- GitHub: `DATABASE_URL_UNPOOLED` (staging), `STAGING_SITE_URL`,
  `STAGING_MEDIA_URL`.

**Blocked:** `fly apps create` answers "trial has ended, please add a credit
card". Once a card is on the account, in order:

1. me — create `vows-api-staging` and `vows-worker-staging`; run
   `infra/fly-secrets-staging.sh`; deploy the API, check `/healthz` and
   `/readyz`, then the worker.
2. me — a deploy token for GitHub (`FLY_API_TOKEN`, into the vault first) and
   `STAGING_API_URL`.
3. me — deploy the web app to `vows-staging`; check whether Vercel's
   protection covers the staging address, and decide with Dineth.
4. me — seed the Figma photographs on staging (the brief asks for them), run
   the whole suite against staging, one job end to end, CI green.
5. me — on staging, check the client address Fly and Vercel hand the enquiry
   limit.
6. **you** — later: verify the domain in Resend and change `from-address`;
   DNS for staging names if wanted.

## Needs Dineth

The platform setup is in "When the platforms are ready". These are the rest.

1. **Two Figma colours fail the contrast rule in chapter 17.** `text/accent`
   (`blue/500`) on `bg/page` is 3.27:1 and `text/muted` (`ink/500`) on
   `bg/page` is 4.21:1; AA needs 4.5:1. Pick darker values in Figma and I will
   re-export. Until then the accessibility test names the two pairs as known
   exceptions.
2. **Q11 below**: when a replacement photograph takes its slot.
3. **The enquiry limit and CI.** The end-to-end suite sends two enquiries a
   run and the API allows five an hour per visitor, so a third run inside the
   hour fails. _I would exempt one test address on staging only._ It adds a way
   round a protection, so it is your call.
4. **Sentry in the web app.** The API and worker report; the web app does not.
   `@sentry/nextjs` adds a dependency, and its browser part adds weight to every
   public page, which is already over the 120 KB budget. _I would add it
   server-side only (`instrumentation.ts`), so Vercel errors are reported and no
   script reaches the browser._
5. **`.env.example`** needs new names, and the permission settings deny me the
   file. The list is under "Decisions".
6. **Figma's off-scale values.** After the token pass, 115 spacing values in
   the code are ones Figma draws off its own scale (10, 14, 22, 56…). Snap them
   in Figma, or grow the scale; either way it is a design decision.
7. **The phone button label on 404 and 403** is 16 px in those frames and 18 px
   on the contact frame. Built 18. Say which.
8. **The music file.** Chapter 14 names "Romantic Saxophone" from Pixabay; the
   navbar in Figma calls it "First Light". The file and its `LICENCE.md` are
   not in the repository.
9. **Screens with no Figma frame:** the enquiry inbox, settings, and an albums
   index (`/albums`). Their API routes exist; the pages wait for a design.
10. **The seed photographs are other people's** (placeholders from the Figma
    album page, one a magazine cover). Say if they may go on staging, which is
    public, or give me the studio's own.
11. **`CODEOWNERS` names `@dinethdesilva`**; the signed-in GitHub account is
    `dinethde`. Say which.
12. **The Ohio Neon project `Vows`** is unused. Delete it when you like; I
    will not.
13. **Figma corrections** are listed under "Figma mismatches"; none made, as
    asked.
14. `.claude/settings.json` still denies reads of the old token paths, and of
    `node_modules`. Harmless; left alone.
15. `docs/implementation-brief.md` is untracked and stays that way.

## Settled by Dineth

On 2026-10-13: Dineth sets up Clerk, R2, Resend and Neon and fills the vault;
the staging work waits for that. Everything else goes ahead.

On 2026-10-12:

- **The pasted brief governs.** The finish line is staging.
  `docs/implementation-brief.md` is extra detail only where the two agree.
- **The album set is fixed at 22.** No create route.
- **The album model follows the Design page.** `wedding_type`, `time_of_day`
  and a cover focal point are columns. Publishing needs the cover, all 18
  photographs and alt text on each. The database keeps
  `draft | published | archived`; the API reports "untouched" for a draft with
  nothing in it.
- **Commits stay signed.**
- **The worker shares code through a new package, `packages/server`.**
  `apps/api` and `apps/worker` are thin entry points.
- **No "Blocked" screen on the contact form.** A repeat within ten minutes gets
  the normal Thank you. The seventh form state is not built.
- **Neon moves to Singapore, on Postgres 18.** Chapter 04 said 17.
- **Token layout:** the scaffold's, which `design.md` and the brief file agree
  on. `css/primitives.css`, `css/semantic.css`, `src/index.ts`.

## Open questions

Each has the option I would pick, so a one-word answer is enough.

**Q6 — The home page.** Figma shows 22 tiles on desktop, 17 on tablet and 13
on phone. Chapter 12 says the newest six albums. _I would follow the design:
one tile per published album, using its cover._

**Q7 — Where "Back to the albums" goes.** The 404 button points at `/albums`,
which has no Figma screen. _I would point it at the home page._

**Q8 — Footer links with nothing behind them.** "Rates (PDF)" has no file and
"Cookies Policy" has no page. _I would link Cookies Policy to the cookies
section of the privacy page and leave Rates out until there is a PDF._

**Q9 — The page address prefix.** The CMS form shows `vows.studio/albums/`.
_I would show `vows.lk/albums/`._

**Q10 — The eighth journey.** Figma chapter 21 lists eight end-to-end
journeys; `architecture.md` now says eight too. One of them, "an editor who
opens the settings page gets 403", needs a settings page, which has no design
(item 5 above). _I would test the 403 on the API route instead._

**Q11 — When a replacement takes the slot.** Today the old photograph is
superseded the moment a replacement is asked for, before the new file has
arrived. If that upload fails, the slot has lost its picture, and a published
album points at a cover that is not ready. Its page keeps the old picture only
until it is next rebuilt. _I would make the swap when the new photograph is
ready: the old one stays in the slot until then, and a failed replacement
leaves it untouched. That needs a change to the slot index and to what the
Studio shows over a slot while a replacement uploads, so I have not done it._

## The Studio and Clerk

**What works.** Signed out, or signed in with no role, every Studio address
answers 403 with the "private" screen. Sign-in returns to the page that was
asked for. Against a stand-in API, signed in as an owner: the dashboard, the
editor's five form states, the calendar, uploads with real progress, alt text,
reordering, and the publish, discard, delete-photograph and move-to-draft
dialogs.

**What is not checked.** Nobody has used the Studio signed in against the real
API. The first attempt found a real fault: the Studio sent a token minted from
a Clerk JWT template, a template token minted on the server has no `azp`
claim, and the API refuses a token without one. Every server-side read came
back 401. Fixed by sending Clerk's own session token instead, which carries
`azp`. Checked: that token passes the API's signature, issuer and `azp`
checks, and is then refused with 403 for having no role. The role cannot be
added on the temporary keyless Clerk instance used for the build, so the run
stops there until there is a real development instance.

**Clerk setup, for Dineth.** This replaces the earlier note about a `vows-api`
JWT template. No template is needed.

1. Create the application. Put its publishable key, secret key, issuer URL
   and JWKS URL in the vault.
2. Sessions → Customize session token. Set the claims to
   `{"public_metadata": "{{user.public_metadata}}"}`. Without this every
   account gets the 403, by design.
3. On your user, set public metadata to `{"role": "owner"}`.
4. Turn public sign-ups off. The Studio has no customer accounts.

`WEB_ORIGINS` on the API must hold the Studio's origin exactly as the browser
sends it, because that is what Clerk writes into `azp`.

**API gaps the Studio found.** 1, 5 and 6 are fixed. The second is open
question Q11, because the fix changes what a slot shows.

1. Fixed: retrying a photograph the worker failed did nothing with the same
   idempotency key. The row now goes back to waiting for its file.
2. A replacement supersedes the old photograph before the new file arrives. If
   the upload fails the slot has lost its picture, and a published album can
   point at a pending cover.
3. A failed or abandoned `pending` row can only be cleared by uploading over
   it.
4. There is no slug-availability route, so the address is checked on save, not
   on blur as the design notes ask.
5. Fixed: describing a photograph returned it with no files. It now answers
   with the photograph as the list returns it.
6. Fixed: `slug_taken` now puts its suggestion in `fields.slug` too, and the
   Studio's special case for it is gone.
7. Save and publish are two requests. If publish is refused the edits are
   already saved while the form still shows them as unsaved.

**Not built in the Studio.** Drag to reorder (two buttons move a photograph one
place). A warning on the browser's back button with unsaved edits. The enquiry
inbox and settings, which have no design.

## Figma mismatches to fix after the build

Dineth asked on 2026-10-12 for no Figma edits until the build is done, and for
every mismatch to be noted. This is the list. Each line says what Figma has and
what was built.

Architecture page:

- **Ch 02, 08.** 40 albums growing to 500, and `POST /v1/studio/albums`. Built:
  22 fixed albums, no create route.
- **Ch 04.** Postgres 17; Next 15, Tailwind 4.x unstated. Built: Postgres 18 in
  Singapore, Tailwind 4.3.3. Also lists `bws`; built with `bw`.
- **Ch 05, 15.** Three apps and six packages, with the worker importing the
  API's module. Built: a seventh package, `packages/server`, which both apps
  start. Module folders are singular (`album`, `photo`), as chapter 15 has them.
- **Ch 06.** No `CLERK_ISSUER`, `WEB_ORIGINS`, `IP_HASH_SALT`, `SITE_URL` or
  `MEDIA_URL` in the table. Built with all five. `CLERK_SECRET_KEY` is in the
  chapter's schema for the API; the API does not use it.
- **Ch 07.** No `time_of_day`, `wedding_type`, `cover_focal_x/y` on album; no
  `idempotency_key` on photo; `image_format` is `avif | webp`; the slot index
  covers every row; `audit_log` has no `updated_at`. Built with the four
  columns, `jpeg`, a partial slot index, and both timestamps on every table.
- **Ch 08.** Routes table lacks `GET /v1/studio/albums/:id`, `POST
…/unpublish`, `GET …/albums/:id/photos`. Built. The enquiry schema has phone
  and date optional and no `openedAt`; built required, with `openedAt` for the
  time trap.
- **Ch 09.** The role table lists archive, settings and audit routes that
  chapter 08 does not have. Not built: no screen exists for any of them.
- **Ch 10.** Positions "close up" after a removal; derivatives go "within the
  minute" in chapter 08 and after thirty days here. Built: 18 fixed slots, a
  removed photograph leaves its slot empty, files stay thirty days. Chapter 10
  says twelve objects and eleven rows; built eleven objects for a gallery
  photograph and twelve for a cover (ten files, plus the share card on a
  cover, plus the original).
- **Ch 10, 12.** The share card carries the names and date and is made at
  upload. Built: the worker makes the 1200 × 630 crop; the words are added by
  the page when it builds, because names can change after upload.
- **Ch 11.** `PermanentJobError` "which pg-boss is configured to fail without
  retrying". pg-boss has no such setting. Built: the runner sets the job's
  retry limit to its retry count, then lets it fail.
- **Ch 12.** Home shows the newest six albums; publish needs at least one
  photograph. Built to the Design page: every published album, and all 18.
- **Ch 13.** The duplicate index uses `date_trunc` on a `timestamptz`, which
  Postgres refuses. Built as a lookup under an advisory lock.
- **Ch 16.** `tokens.css`, `tokens.ts`, `tailwind.preset.js`, names like
  `--bg-page`. Built: `css/primitives.css`, `css/semantic.css`,
  `src/index.ts`, names like `--vows-bg-page`.
- **Ch 21.** Eight journeys, one needing a settings page that has no design.
- **Ch 23.** 72-character subjects and feature scopes. `commitlint.config.js`
  has 60 and package scopes, plus `server`.

Design page:

- **Home.** One tile per album. With fewer than 22 published, the canvas is
  filled with other photographs from the published albums. Tiles keep their
  drawn pixel sizes; only their positions scale with the window.
- **Footer.** Top padding is 40 / 32 / 20; built with the bar's 56 added, or
  the navbar sits on the column labels. The bounce lands at each photograph's
  resting place, not on the measured top of the wordmark.
- **Contact form, state 05.** Figma lets the month hang over the bottom edge
  of the card, with a 0 8 24 −4 shadow. Built: the month stays inside the
  card, which scrolls to show its last row, and uses `shadow-card`.
- **Album bar on a phone.** The notes say names, paragraph, then details. The
  frame draws names, details, then paragraph. Built as the frame.
- **Album band 7.** Figma lists the large photograph first. The page reads
  left to right, small then large, so slot 10 is the small one.

- **CMS notes.** "Deleting an album" is listed as a fifth confirmation.
  The frames have four. Built four.
- **CMS, delete photograph modal.** "It is removed from this album and from
  vows.lk." A live album needs all 18, so removing from a published album is
  refused; replace it, or move the album to draft first.
- **CMS form.** The prefix is `vows.studio/albums/`. To be built as `vows.lk`.
- **Contact form.** The seventh state, "Blocked", is not built. The three
  "Form open" page frames show an older field list than the form states.
- **Design system.** `Display/Wordmark L` is 184 in the style and 200 in the
  footer note. Navbar padding is 64 / 24 / 16 in one note, 40 / 24 / 16 in two.
- **Footer.** "Rates (PDF)" and "Cookies Policy" have nothing behind them.
- **404.** "Back to the albums" points at `/albums`, which has no screen.

Studio screens (design page):

- **Field order.** Figma puts story before address on desktop and phone, and
  type left of time on tablet. Built in one order at every width (names, date,
  time, type, location, address, story) so Tab follows the screen.
- **Alt text and reordering** are named in the notes (`2476:2353`) but not
  drawn. Built: a description field under each filled slot, and two move
  buttons under each gallery slot.
- **Cover slot on tablet and phone** is missing from `2224:976` and
  `2225:1086`. Built first in the grid.
- **Tablet slot grid.** Frame `2224:976` draws 7 across; note `2227:1197` says 4. Built 4. Phone gutter is 20 in the frame and 12 in the note; built 20.
- **Move back to draft** (`2473:2352`) and **Preview below 1024**
  (`2227:1197`) have no trigger drawn. Built: a button on a published card,
  and a Preview link beside the title of a published album.
- **Account chip** has no menu drawn. Built a one-item menu, "Sign out".
- **Publish button** is full orange in `2318:9590` with an empty cover but
  faded elsewhere. Built faded whenever the album cannot be published.
- **Calendar** `2317:8807` draws January 2027 starting on a Monday with five
  rows. The real month starts on a Friday and needs six.
- **Dates.** The Saved frame writes "07 January 2025". Built "7 January 2025",
  as the site writes dates.
- **Draft button on a published album** says "Draft" in Figma. Built "Move to
  draft", which is what it does.
- **Empty cover slot** says "Add cover photo" in Figma. Built "Add photo":
  `PhotoSlot` has no label prop.
- **Delete-photograph copy** (`2473:2524`) says the photograph is "removed
  from vows.lk", but removal from a live album is refused. Copy kept; the
  refusal shows in the dialog.
- **Notes list five confirmations** including delete-album (`2476:2353`). Four
  are built, as decided.
- **Helper line** stays until another field is entered. The notes ask for it
  to go on click elsewhere, which moved the form under the pointer.
- **Colours with no semantic token** (overline, card meta, calendar greys, the
  content ground) use the nearest token. The 4 px outer frame is not drawn.
  The calendar and menu use `shadow-card`, not Figma's 0 8 24 −4.

## What the component library reported

From the subagent that built `packages/ui`. These are for the design pass.

- Import `@vows/ui/styles.css` after the token stylesheets, or nothing is
  styled. `ConfirmationModal` is portalled to `body`, so the Studio layout must
  put `data-surface="studio"` on `body`.
- State names are Figma's, capitalised (`'Published'`, `'Uploading'`). The
  API's lower-case values are mapped in the app.
- The black pill is its own component, `CtaButton`. In Figma it is a plain
  frame, drawn two ways on a phone; the contact page's version was built.
- Navbar padding is built as 64 / 24 / 16, as the component has it.
- Studio fields, pills, banners and slots are square. The board text says the
  Studio has rounded corners; the components have radius 0.
- Five things in Figma use a primitive or a raw value where a semantic token
  is missing: the required asterisk (`red/700`), the slot glyph (`sand/400`),
  the slot badge (`ink/0`), the 500 card's gradient, and the modal and error
  card shadows, which do not match `Elevation/modal`.
- Many paddings and gaps are not on the spacing scale (14, 10, 6, 22, 28 and
  so on). They are written as exact values taken from the named nodes.
- Not drawn in Figma, so chosen: disabled and pending buttons, the black
  pill's hover and pressed states, the error line inside the modal.

## Decisions I made that are worth knowing

- **The worker gets 1 GB and derives one photograph at a time.** Chapter 32
  says start at 512 MB. Measured on 2026-10-17: one derive peaks near 540 MB
  for 24 MP and 60 MP files alike, after the fix that decodes each photograph
  once (it was 631 and 912 MB). The rest is the AVIF encoder at 2400 px. Three
  at once would not fit 1 GB. Costs more than chapter 32; waits for a yes.
- **Sentry is the dead-man's switch.** The four scheduled jobs check in through
  Sentry's cron monitors, so one tool runs the whole alert table, as chapter 20
  says. The check-ins are sent by hand: the SDK's `withMonitor` left a failed
  run's rejection unhandled, which would end the worker. Only failures nothing
  will retry are reported.
- **Images are built in CI.** No Docker on the development machine, so a CI job
  builds both images and checks each refuses to start without its config.

- **Slots.** `photo.position` 0 is the cover and 1 to 18 the gallery. Removing
  a photograph empties its slot; the others do not close up, because the
  Studio draws 18 numbered slots.
- **The slot index is partial.** Chapter 07 draws a unique index on
  `(album_id, position)` over every row. A replacement keeps the old row's
  position, so that index would refuse it. It now leaves out removed and
  superseded rows.
- **`image_format` has `jpeg`.** The share card is a JPEG, because chat apps do
  not read AVIF or WebP in a link preview.
- **`photo.idempotency_key`.** Chapter 08 says the key is stored but not where.
- **The enquiry duplicate check is in the service.** The index in chapter 13
  uses `date_trunc` on a `timestamptz`, which Postgres will not index. There is
  an index on `(email, created_at)` to make the lookup cheap.
- **Node-side packages compile to CommonJS in `dist`.** `tokens`, `contracts`,
  `db` and `mail` are loaded by the Nest apps with `require`. Types still come
  from `src`.
- **Layout switches at 640 and 1024**, the numbers the design notes give.
  390, 834 and 1440 are the widths drawn.
- **Tailwind is 4.3.3**, up from 4.0.0, which would not start.
- **The API verifies tokens with `jose`**, as chapter 09's sample does.
  `@clerk/backend`, `@nestjs/terminus` and `nestjs-pino` are gone: the first
  two were unused, and the third does not accept Nest 11. Logging is `pino`
  directly.
- **Three variables chapter 06 does not list:** `CLERK_ISSUER` (chapter 09
  uses it), `WEB_ORIGINS` (the allowed `azp` values and CORS origins) and
  `IP_HASH_SALT` (chapter 07 says the IP hash is salted). `MEDIA_URL` and
  `SITE_URL` are the API's names for the media and site origins. They still
  need adding to `.env.example` and the chapter 06 table. I cannot do the
  first: the permission settings deny me `.env.example`, and I have left that
  as it is. The names it needs, with empty values: for the API and worker,
  `CLERK_ISSUER`, `CLERK_JWKS_URL`, `WEB_ORIGINS`, `SITE_URL`, `MEDIA_URL`,
  `IP_HASH_SALT`; for the web app, `API_URL`, `NEXT_PUBLIC_API_URL`,
  `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MEDIA_URL`, `REVALIDATE_SECRET`,
  `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
- **An edit that would leave a published album incomplete is refused**, with
  the same 422 as publish.
- **Routes added to chapter 08:** `GET /v1/studio/albums/:id`,
  `POST …/unpublish` and `GET …/albums/:id/photos`. The editor, the "Move to
  draft" modal and the upload poll each need one.

## Still to correct

- **JavaScript on public routes is over chapter 18's 120 KB budget.** Next 15
  and React 19 alone are 103 KB. Last build: privacy 114, album 136, contact
  142 (184 before the form split), home 153. The floor cannot be removed.
- `commitlint.config.js` allows a 60-character subject and package scopes;
  Figma chapter 23 says 72 and feature scopes.
- In the Design page: the confirmation notes still list a delete-album
  variant; the navbar padding is 64 / 24 / 16 in one note and 40 / 24 / 16 in
  two others; `Display/Wordmark L` is 184 where the footer note says 200.
- The idempotency key is looked up with no album or slot (audit A9). A key
  reused across albums would return the other album's row.
- `.env.example` lists `STUDIO_NOTIFY_EMAIL` and `WORKER_CONCURRENCY`, which
  nothing reads (denied to me; see "Needs Dineth").

## Launch checklist

The appendix of `architecture.md`, walked on 2026-10-17. "On go" means I can do
it once the platforms are set up and Dineth says go; nothing on this list is
production work I may start alone.

| Item                                                                        | State                                                            |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `vows.lk` at Vercel, `media.vows.lk` at the derivatives bucket              | only a person (DNS)                                              |
| Resend domain verified; SPF, DKIM, DMARC                                    | only a person (DNS and Resend)                                   |
| Test enquiry reaches Gmail and Yahoo inboxes                                | on go, after the domain                                          |
| Every production value in the vault                                         | only a person                                                    |
| Values pushed to Vercel, Fly, GitHub from the vault                         | on go                                                            |
| Vault export stored offline, recovery tried once                            | only a person                                                    |
| Neon production branch, migrations by the deploy workflow                   | on go (production: Dineth's call)                                |
| API and worker deployed, `/healthz` and `/readyz` green, one job end to end | on go (staging first)                                            |
| R2 CORS; an upload from the real domain completes                           | on go; the CORS file is ready                                    |
| Clerk production instance, both studio users signed in once                 | only a person                                                    |
| Cloudflare Web Analytics live, a pageview seen                              | built; needs the site token                                      |
| Sentry from all three apps, release tagged                                  | API and worker built and tagged on deploy; web app is a decision |
| Six Sentry alert rules, phone push, each fired once                         | only a person (Sentry UI)                                        |
| `db.backup` by hand, restore rehearsed                                      | on go; needs the backups key                                     |
| 404, 500 and 403 on the real domain                                         | on go; tests exist                                               |
| Share cards in WhatsApp, Messenger, iMessage                                | only a person (phones)                                           |
| Lighthouse on home and an album against chapter 18                          | on go; JS is over budget, see "Still to correct"                 |
| Privacy page live and in the footer                                         | done                                                             |
| One album published, opened on a phone on mobile data                       | only a person                                                    |

## Review findings, 2026-10-12

Two project agents each made their one pass: the architecture auditor on the
API and worker, the design reviewer on the public site (19 screens, Figma
beside the build). Tick a line when it is fixed. Scripts, crops and the image
pairs are in the session scratchpad under `design/`, not in the repository.

### Architecture audit: faults in the code

- [x] **A1. The enquiry limit counts Vercel, not the visitor.** The form posts
      from a server action and no client address is forwarded, so `ip_hash`
      is the web server's address. Five enquiries from anyone block everyone
      for an hour. Also `trust proxy` is `true`, so a direct caller can pick
      any address with `X-Forwarded-For`. (`contact/actions.ts`,
      `lib/api/transport.ts`, `enquiry.controller.ts:38`, `bootstrap.ts:18`)
- [x] **A2. A photograph can stay `processing` for good.** A derive that
      fails for any reason but "not an image" retries, fails, and leaves the
      row as it was. Nothing writes `processing_failed`.
- [x] **A3. The 60 MB cap is not checked.** The API trusts the size the
      browser states. `markUploaded` reads the real size and does not compare.
      Nothing writes `file_too_large`.
- [x] **A4. `album.revalidate` uses the slug from its payload**, not the
      album's current one (chapter 11: trust only the id).
- [x] **A5. Errors outside the envelope.** Any `HttpException` other than
      400/401/403/404 becomes a 500, so a 413 reads as our fault. Unique-index
      clashes on the slot, the idempotency key and the slug would be 500s;
      `photo_slot_taken` is declared and never thrown.
- [x] **A6. `process.env` outside the config module**: `VOWS_SERVICE`
      (`app.module.ts:33`, `apps/worker/src/main.ts:20`), `PATH`
      (`backup.service.ts:26`). And four variables the worker needs are
      optional, so it boots without them and fails at job time.
- [x] **A7. `/readyz` reports the queue from a flag set at boot.** It cannot
      go red after start.
- [x] **A8. `infra/fly.api.toml` and `infra/fly.worker.toml` do not set
      `APP_ENV`**; the schema requires it.
- [x] **A9. State checks sit outside their transactions** (publish, remove,
      reorder, confirm). A remove racing a publish can leave a live album with
      17 photographs. The idempotency key is looked up with no album or slot.
      _Publish against remove is fixed with a row lock. The key lookup is not._
- [ ] **A10. Readiness ties the contact form to R2.** An R2 outage takes the
      API out of rotation, including the enquiry route, which needs only
      Postgres. A question of what `/readyz` should mean; not changed.

A1 to A8 are fixed, each with a test or a live check. Two things in A1 wait for
staging: that Fly's proxy puts the client last in `X-Forwarded-For`, and that
Vercel puts the visitor first. A deployed worker now refuses to start without
`DATABASE_URL_UNPOOLED`, `R2_BUCKET_BACKUPS`, `RESEND_API_KEY` and `MAIL_FROM`.

### Architecture audit: promised and not built

- [x] **A11. Sentry is not initialised anywhere** (chapter 20). None of the
      six alerts can fire.
- [x] **A12. No dead-man's switch** on the four scheduled jobs (chapter 11).
      A backup that silently stops is not noticed.
- [x] **A13. No test rolls a transaction back and checks the job is gone.**

A11 and A12 are done for the API and the worker: errors and job check-ins
reach Sentry when `SENTRY_DSN` is set, proved against a stand-in endpoint. The
web app does not report yet (see "Needs Dineth"). A10 stays a question.

### Architecture audit: the document is wrong, the code is right

- [x] Ch 07: enquiries are deleted after 24 months and photo rows after
      cleanup, so "nothing is hard-deleted" and "readable a year later" are
      untrue. `error_code` is text, not an enum. Ids also use `rdr_`, `aud_`.
- [x] Ch 08: `/healthz` and `/readyz` answer outside the envelope and with 503. "albums (… order)" is photo order; album order is fixed.
- [x] Ch 10: the cover is cleared by code, not by the foreign key.
- [x] Ch 11: the back-off series (pg-boss doubles; "30 s, 2 m, 8 m, 32 m" is
      ×4); who enqueues `album.revalidate` and `photo.cleanup`.
- [x] Ch 12: a signed rebuild call can be replayed for five minutes.
- [x] Ch 14: client names are `publicApi`, `authedApi`, `serverApi`, `useApi`.
- [x] Ch 15: small services query without a repository; the health controller
      runs `select 1`.
- [x] Ch 21: a signed-out visitor gets the 403, not a redirect to sign-in.
- [x] Ch 30 (the READMEs are still stale) and `apps/worker/src/jobs/README.md`: the orphan sweep only
      counts and logs. The worker READMEs describe files that do not exist.
- [x] Ch 03: the development seed in `packages/db` writes directly.
- [ ] `.env.example` lists `STUDIO_NOTIFY_EMAIL` and `WORKER_CONCURRENCY`,
      which nothing reads.

### Design review: clear mismatches

- [x] **D1. Enquiry sheet on a phone.** Figma: padding 24, 36 between title,
      fields and foot, 26 between fields, legal text full width with a
      full-width Send under it. Built: 56 and 40, and one row.
- [x] **D2. Privacy on a phone** is 124 px taller. Figma: body starts at 112,
      8 between every line of the stack, an 18 spacer between sections,
      headings 18/26, body 14/22.
- [x] **D3. Footer on a phone: falling photographs cover the phone number.**
      They paint above the columns and the legal row.
- [x] **D4. Footer on a phone: the Socials column is 22 px left**; Figma
      right-aligns it. At 1440 Socials is +11 and Contacts +22.
- [x] **D5. Contact heading.** Figma centres the arrow and the first line as
      one unit; built hangs the arrow outside (41 px off at 1440, ~30 at 834,
      ~21 at 390). "Say hello" should be one weight with one underline.
- [x] **D6. Contact at 834**: hero 20 px low, columns 13–15 px right, bottom
      margin 61 against 73. At 390: 8 px off above and below the heading.
- [ ] **D7. 404 and 403 on a phone**: the ghost number sits 5–7 px right. The
      button label is 18 px where these two frames draw 16 (the contact frame
      draws 18; Figma disagrees with itself).
- [x] **D8. Footer wordmark** sits 20 px lower than Figma beyond the known 56.
- [x] **D9. Music gate was not compared.** The capture caught the loader.

All but D7 are fixed and re-measured against the frames. Of D7 the number is
centred; the button label stays 18 px until Figma says which size is right.
The footer columns are within 1 px of the frame at 1440 and 834. The wordmark
sits two fifths down its free space; Figma's three frames disagree (a third to
a half), so it lands inside the known 56 px offset rather than on one frame.

Three places where the fix does not copy the frame exactly:

- The enquiry sheet draws the legal line touching Send. Built with the
  frame's own declared gap of 20, so the sheet is 23 px taller than drawn.
- The music prompt is within 5 px at 834 and 3 px at 390, exact at 1440.
- The footer's photo field starts 56 px lower than drawn, with the columns.

### Design review: smaller, or Figma is unclear

- The 1440 form frame shows five different fields from the 834 and 390
  frames. Built to the six.
- Figma centres the form card 20–24 px above the middle; built in the middle.
- "Privacy Policy" in the form and the email on the privacy page are
  underlined in the build and not in Figma. Kept: a link needs a mark.
- "Rates (PDF)" is missing from the legal row (Q8).
- The error card's shadow spreads wider than Figma's.
- Field underlines look soft at 834 and 1440: a 1.5 px rule on a half pixel.
- No white wash under the navbar on contact; Figma has it there and not on
  404 or privacy.
- The cover on tablet and phone shows less sky: the seeded file is landscape.
- Many one-off sizes in the site's classes (`gap-[56px]`, `pt-[152px]`,
  `rounded-[24px]`). A token pass is owed.

## Pre-merge review of PR #2, 2026-10-24

Before merging into `dev-v2`, Dineth asked for the whole application to be
reviewed with all three project agents. Four passes ran: a code review of the
pull request (correctness), the architecture auditor (whole app, web and CI
included), the test planner (coverage), and the design reviewer (Studio,
album bar, error pages). Scratch output is in the session scratchpad
`review2/`, not in the repository.

### Fixed before the merge

- **Photographs** (`7b96cc2`): clearing a description now decides on the
  locked album; an upload key repeats only for the same album, slot and live
  row; a derive skips a photograph replaced or removed since it was queued.
- **Enquiries** (`5c7a5e9`): the hourly limit also locks per visitor, so a
  burst with different emails cannot all pass; a visitor whose clock runs fast
  is no longer refused; the notification links to the Studio, not to the
  missing inbox.
- **Web** (`54ca42d`): path values encoded in the API client; the rebuild call
  must be within five minutes either way, and a bad body is a 404; the contact
  action surfaces a missing secret and logs an unreachable API.
- **Tokens and sharing** (`8924590`): the map pin drawn with its token; every
  page has a share card.
- **Studio design** (`c32bb25`): the editor preview clips the album bar's wide
  backdrop (it frosted over the form); the editor's top gap and the dashboard's
  card gap at 1440 now match Figma.
- **CI and config** (`df93d2c`, `01558e0`, plus `e5ecd9c`, `1e1007a`): the web
  app builds in CI against a real API on the run's own database; the staging
  browser job runs only once staging exists; read-only workflow permissions;
  the flyctl action pinned to a commit; production migrations over the direct
  URL; the production CORS rule narrowed to PUT from vows.lk; every `.env.*`
  ignored except the example.
- **architecture.md**: chapters 03 (the one on-demand exception), 04
  (versions), 05 (layout), 10 (removal leaves the slot empty), 12 (the shared
  secret's second use), 14 (no about page), 19 (gitleaks runs in CI), 25 (how
  deploys are actually ordered, Lighthouse not in CI).

### Found and deferred

- **Q11** stays open: a replacement supersedes the live photograph before its
  file exists. The code review rated it the most serious finding.
- **Needs Dineth:** the migration guard in `packages/db/drizzle.config.ts`
  cannot recognise a production Neon URL (endpoint names do not contain the
  branch), so it protects nothing; fix it when the production branch exists.
  Separate R2 tokens per environment (staging uses the dev key, which reaches
  every bucket). If vows.lk sits behind Cloudflare, the enquiry limit must read
  `cf-connecting-ip`.
- **CI:** the staging browser job tests what is deployed, not the pull
  request; it should target the Vercel preview and carry a Clerk test user.
  Fork pull requests never build the web app (the integration job needs the
  Neon secret). Lighthouse is not in CI. Only flyctl is pinned to a commit.
  The CI web build runs on a branch of Neon `main`, whose albums are all
  drafts, so it renders no album page.
- **Code:** the album rebuild enqueue is written three times
  (`AlbumService`, `PhotoService`, `DeriveService`); `publish()` reads the
  album twice; `update()` takes the old slug outside its transaction.
  `REVALIDATE_SECRET` is checked when used, not at start.
- **Tests the planner asked for, not yet written:** a sweep that every
  `/v1/studio` route answers 401/403 without a token or role; expired,
  foreign-issuer and unknown-key tokens; cleanup of superseded photographs in
  CI; removal refused on a live album; an edit that would leave a live album
  incomplete; replacement inheriting slot, alt and cover; the old-slug 308 end
  to end; both emails through the real queue; the last-attempt flag through the
  real queue. Also: the publish journey changes the seeded album that other
  tests need (give it its own album), and the alt-text journey cleans up inside
  the test body.
- **Design (Studio):** the editor's form sits in a white card where Figma has
  none and a divider; tablet and phone top padding is about 40 px short; 25 px
  above Publish where Figma has 35; the search placeholder is near-black where
  Figma is grey (2.9:1, a contrast choice); toolbar inset and stat widths
  differ slightly; the 403 phone body is 14 px where that frame draws 16 (and
  its copy differs). Studio components keep their props interfaces in the
  component file, not a `.types.ts` beside it as `components.md` asks; some
  Studio spacing and one radius are off the scale; "Photos" uses a Site type
  style. Studio text in `text-placeholder` measures 2.5:1 and `text-muted`
  3.8:1, below AA, matching Figma's own colours: a token decision.

## Notes for the next session

- Start every local run with the API and worker built
  (`pnpm turbo run build --filter=@vows/api... --filter=@vows/worker...`), then
  `node apps/api/dist/main.js` and `node apps/worker/dist/main.js` with the
  variables read inline from the vault and `neonctl`, as in the commands below.
- Every server test, live: in `packages/server`, with `DATABASE_URL`, the R2
  variables and a running worker, `PIPELINE_LIVE=1 pnpm exec vitest run`.
  On 2026-10-17: 65 passed, 1 skipped.
- `node_modules` cannot be read under the permission settings. Check a
  library's options in its documentation instead.
- To measure derive memory, encode a large JPEG with sharp, then run
  `deriveImage` from `apps/worker/dist/lib/derive-image.js` in a fresh process
  and read `process.resourceUsage().maxRSS`.

- Use Node 22: `source ~/.nvm/nvm.sh && nvm use 22` before any `pnpm` command.
- The dev database URL is never stored. Read it inline:
  `DATABASE_URL="$(neonctl connection-string dev-claude --project-id plain-fog-47201137)" pnpm db:migrate`.
  That string is unpooled, which migrations need. Add `--pooled` for the apps.
- `architecture.md` and `design.md` had uncommitted edits from Dineth when the
  build started. They are committed together with my corrections.
- `.claude/settings.json` asks before `git push`, `fly`, `vercel`, `neonctl`,
  `wrangler` and `pnpm db:migrate`.
- Server tests: `cd packages/server` and run
  `DATABASE_URL="$(neonctl connection-string dev-claude --project-id plain-fog-47201137 --pooled)" pnpm exec vitest run`.
  Without the variable the database tests skip. They use album `alb_000022`
  as a fixture and put it back.
- The R2 key is read inline from the vault item `r2/dev-access-keys`, fields
  `Access Key ID` and `Secret Access Key`. Never store it.
- The live upload test: start `node apps/worker/dist/main.js` with the R2 and
  database variables set, then in `packages/server` run
  `PIPELINE_LIVE=1 pnpm exec vitest run test/upload.spec.ts` with the same
  variables. It uses album `alb_000021` and cleans up its rows, not its files.
- To read Figma text in bulk, `get_metadata` cuts layer names short. A
  read-only `use_figma` script that returns `characters` gets the full text,
  up to about 20 KB a call. Screens and their node ids are listed in the
  `get_metadata` output for page `0:1`.
- To seed the first album: run a worker, then
  `node apps/worker/dist/scripts/seed-album.js "$PWD/.seed-photos"` with the
  same variables. Add `--publish` once the web app is running.
- The web app's variables: `API_URL`, `NEXT_PUBLIC_API_URL` (browser calls from
  the Studio; not in chapter 06), `NEXT_PUBLIC_SITE_URL`,
  `NEXT_PUBLIC_MEDIA_URL`, `REVALIDATE_SECRET`.
- The Playwright browser tool is often "already in use". Screenshots are taken
  with a small script instead: `@playwright/test` from `apps/web` driving its
  own Chromium. `pnpm exec playwright install chromium` has been run.
- Run the web app with `API_URL`, `NEXT_PUBLIC_API_URL`,
  `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MEDIA_URL` and `REVALIDATE_SECRET` set,
  then `pnpm exec next dev --turbopack -p 3000` in `apps/web`.
- App stylesheets import `@vows/config/tailwind/vows.css` first, then the two
  token stylesheets from `@vows/tokens/css/`.
- With no Clerk keys, `next dev` starts Clerk in keyless mode: a temporary
  instance whose key is in `apps/web/.clerk/` (ignored by git). It also
  appends a line to `apps/web/.gitignore`; restore that file before
  committing. The keyless instance cannot customise the session token, so no
  account on it can have a role.
- The Studio subagent's worktree is at
  `../.claude/worktrees/agent-a9baf666be5427046`. Its five commits are on this
  branch; the worktree can be removed.
- After a Playwright upgrade, run `pnpm exec playwright install chromium webkit`
  in `apps/web`, or every browser test fails at launch.
