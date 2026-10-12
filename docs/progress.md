# Vows v2 — build progress

This file and the git log are how a new session picks up the work. Read it
first. Update it when a milestone lands, when the plan changes, or when
something joins the "needs Dineth" list.

Last updated: 2026-10-12, milestone 3 mostly done: uploads run end to end.

## Where things stand

- **Done:** milestones 0, 1 and 2. Tokens, the Tailwind mapping, the contracts,
  the database schema, two migrations and the seed are committed.
- **Done bar one check:** milestone 3. The API serves health, enquiries,
  albums and photographs. The worker has all eight jobs. `photo.derive`,
  cleanup and the orphan sweep have run for real against R2 and Neon.
  `enquiry.notify` is tested with a recording mailer; nothing has gone through
  Resend. `db.backup` dumps the database but could not write the file: the R2
  key is refused on `vows-backups-dev`.
- **Next:** milestone 4, the component library, then 5, the public site.
- **Cloud resources in use:** Neon project `vows-sg` in Singapore
  (`plain-fog-47201137`, Postgres 18), branch `dev-claude`. R2 buckets
  `vows-originals-dev` (CORS allows `PUT` from `http://localhost:3000`) and
  `vows-backups-dev` (mine, empty), and
  `vows-media-dev` (public at
  `https://pub-2b21405facd34cbd996583485c36af84.r2.dev`). Dineth made the
  buckets and the key; I set the CORS rule and turned the public address on.
  The older Ohio Neon project `Vows` is no longer used.
- **The workspace checks are not clean yet.** `tokens`, `contracts`, `db` and
  `config` pass typecheck, lint and tests. `api`, `worker`, `mail`, `ui` and
  `web` fail because they have no source files. CI on the pull request will be
  red until those milestones land.

## Milestones

Each one leaves something that runs.

| #   | Milestone                                                             | Leaves running                                         | State                     |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------- |
| 0   | Read the sources, check the tools, write this plan                    | `pnpm install`                                         | done                      |
| 1   | Tokens from Figma, `config`, `contracts`                              | `pnpm tokens:build`; 34 tests                          | done                      |
| 2   | Database schema, migrations, seed                                     | a seeded Neon branch with 22 albums                    | done                      |
| 3   | API and worker: config, guard, envelope, routes, the eight jobs       | `/healthz`, `/readyz`, one job end to end locally      | done bar the backup write |
| 4   | Component library in `packages/ui`                                    | each Figma component in every state, with visual tests | not started               |
| 5   | Public site: loader, music gate, home, album, contact, footer, errors | the site locally against the seeded API                | not started               |
| 6   | Studio: dashboard, album editor, confirmation scenarios               | sign in, edit, upload, publish locally                 | not started               |
| 7   | CI, staging, the end-to-end journeys                                  | staging green, journeys passing against it             | not started               |

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

## Needs Dineth

0. **Let the R2 key write to `vows-backups-dev`.** I created that bucket for
   the weekly database backup. The key in `r2/dev-access-keys` is scoped to
   the other two buckets and gets "Access Denied" on this one. Either add the
   bucket to the token, or make a second token and store it in the vault.
   Until then the backup cannot be written and the restore cannot be
   rehearsed.
1. **Clerk keys.** The vault's `vows` folder holds only `r2/dev-access-keys`.
   The Studio cannot sign anyone in without a Clerk development instance: its
   publishable key, secret key, issuer URL and JWKS URL. This blocks milestone
   6 and the sign-in journey. Server tests do not need it; they make their own
   signing keys.
2. **A Resend key.** Without it `enquiry.notify` can be written and its emails
   rendered, but nothing can be sent.
3. **A Sentry DSN**, when you want error reporting on. Nothing waits on it.
4. **The Ohio Neon project `Vows` is no longer used.** It holds an empty
   `production` branch and my old `dev-claude` branch. Delete it when you
   like; I will not.
5. **The music file.** Chapter 14 names "Romantic Saxophone" from Pixabay. The
   navbar in Figma calls the track "First Light". The file and its
   `LICENCE.md` are not in the repository.
6. **Screens that have no Figma frame:** the enquiry inbox and the settings
   page (both in chapter 14), and an albums index (`/albums`, chapter 12). The
   API routes for enquiries get built. The Studio pages wait for a design.
7. **Figma needs four corrections to match what was decided:** chapter 16 (the
   token file layout), chapters 02 and 08 (22 fixed albums, no create),
   chapter 07 (the new columns, the partial slot index, `jpeg`), chapter 13
   (the duplicate index cannot be created, see below). I have not edited the
   Figma page.
8. **`.claude/settings.json` still denies reads of the old token paths.** It is
   harmless. I left the permissions file alone.
9. **`CODEOWNERS` names `@dinethdesilva`.** The GitHub account that is signed in
   is `dinethde`. Tell me which is right.
10. **`docs/implementation-brief.md`** is untracked and I have left it that way.

## Settled by Dineth on 2026-10-12

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

## Decisions I made that are worth knowing

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
  need adding to `.env.example` and the chapter 06 table.
- **An edit that would leave a published album incomplete is refused**, with
  the same 422 as publish.
- **Routes added to chapter 08:** `GET /v1/studio/albums/:id`,
  `POST …/unpublish` and `GET …/albums/:id/photos`. The editor, the "Move to
  draft" modal and the upload poll each need one.

## Still to correct

These are known and not yet fixed.

- `commitlint.config.js` allows a 60-character subject and a scope list that
  differs from Figma chapter 23 (72, and feature scopes such as `album`).
- The launch checklist says `cdn.vows.lk` and `/health`. Figma says
  `media.vows.lk`, `/healthz` and `/readyz`. `next.config.ts` and
  `infra/fly.api.toml` have the same two.
- `infra/fly.worker.toml` gives the worker 1 GB; chapter 32 says start at
  512 MB. `infra/r2-bucket-policy.json` names `vows-photographs`.
- Folder names differ from chapter 15: `modules/albums`, `photographs`,
  `uploads`, `webhooks` against `album`, `photo`, `enquiry`, `setting`,
  `audit`; and `app/(studio)` against `app/studio`. I will follow Figma.
- `packages/db/README.md` says uuid v7 ids, `packages/mail/README.md` lists
  five emails, and decision record 0001 mentions a `studio_users` table.
  Figma says prefixed text ids, two emails and no users table.
- Scaffold READMEs point at chapter numbers that have moved.
- React 19.0.0 and Next 15.1.3 need a patch bump, and `nestjs-pino` 4.2.0 does
  not accept Nest 11.
- In the Design page: the confirmation modal notes still list a delete-album
  variant; the navbar padding is 64 / 24 / 16 in one note and 40 / 24 / 16 in
  two others; the `Display/Wordmark L` style is 184 where the footer note
  says 200.

## Notes for the next session

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
- App stylesheets import `@vows/config/tailwind/vows.css` first, then the two
  token stylesheets from `@vows/tokens/css/`.
