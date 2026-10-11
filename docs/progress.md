# Vows v2 — build progress

This file and the git log are how a new session picks up the work. Read it
first. Update it when a milestone lands, when the plan changes, or when
something joins the "needs Dineth" list.

Last updated: 2026-10-12, milestones 0 to 2 done.

## Where things stand

- **Done:** milestones 0, 1 and 2. Tokens, the Tailwind mapping, the contracts,
  the database schema, two migrations and the seed are committed.
- **Next:** milestone 3, the API and the worker.
- **Cloud resources created so far:** one Neon branch, `dev-claude`, off
  `production` in the existing `Vows` project (`icy-cell-66519183`). Both
  migrations and the seed have been applied to it. Nothing else exists yet.
- **The workspace checks are not clean yet.** `tokens`, `contracts`, `db` and
  `config` pass typecheck, lint and tests. `api`, `worker`, `mail`, `ui` and
  `web` fail because they have no source files. CI on the pull request will be
  red until those milestones land.

## Milestones

Each one leaves something that runs.

| #   | Milestone                                                             | Leaves running                                         | State       |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------ | ----------- |
| 0   | Read the sources, check the tools, write this plan                    | `pnpm install`                                         | done        |
| 1   | Tokens from Figma, `config`, `contracts`                              | `pnpm tokens:build`; 34 tests                          | done        |
| 2   | Database schema, migrations, seed                                     | a seeded Neon branch with 22 albums                    | done        |
| 3   | API and worker: config, guard, envelope, routes, the eight jobs       | `/healthz`, `/readyz`, one job end to end locally      | not started |
| 4   | Component library in `packages/ui`                                    | each Figma component in every state, with visual tests | not started |
| 5   | Public site: loader, music gate, home, album, contact, footer, errors | the site locally against the seeded API                | not started |
| 6   | Studio: dashboard, album editor, confirmation scenarios               | sign in, edit, upload, publish locally                 | not started |
| 7   | CI, staging, the end-to-end journeys                                  | staging green, journeys passing against it             | not started |

One pull request into `dev-v2`, opened as a draft after milestone 2 and updated
at the end of each later milestone.

## Tools

| Tool                | State                                                                 |
| ------------------- | --------------------------------------------------------------------- |
| Figma               | Connected. Both pages open                                            |
| Browser screenshots | Works. Saves into `.playwright-mcp/` only, which is in `.gitignore`   |
| `gh`                | Signed in as `dinethde`. No `workflow` scope; pushes go over SSH      |
| `vercel`            | Signed in as `dinethde`                                               |
| `fly`               | Signed in as `dev.dinethde@gmail.com`                                 |
| `neonctl`           | Signed in as `dev.dinethde@gmail.com`                                 |
| `wrangler`          | Signed in to the `dev.dinethde@gmail.com` Cloudflare account          |
| Bitwarden           | `bw` is signed in but **locked**. `bws` is not installed and not used |
| Node                | 22.23.3 through nvm, as `.nvmrc` asks                                 |
| Commit signing      | Works once the SSH key is in the agent (`ssh-add -l` lists it)        |

## Needs Dineth

1. **Unlock Bitwarden for the session.** Start Claude Code from a shell where
   `export BW_SESSION="$(bw unlock --raw)"` has been run. Do not paste the key
   into the chat. Until then no secret can be created or pushed. That blocks
   milestone 7, and the parts of milestone 3 that need R2 keys, a Clerk key or
   a Resend key.
2. **Clerk, Resend and Sentry keys.** Not checked, because the vault is locked.
   If they are not in the vault they have to come from each dashboard.
3. **The Neon project is in `aws-us-east-2`.** Fly is set to Singapore, and
   chapter 04 picks Singapore to be close to the audience. A Neon project
   cannot change region. Say whether production should move to a new project
   in `aws-ap-southeast-1` before anything real goes into this one.
4. **The music file.** Chapter 14 names "Romantic Saxophone" from Pixabay. The
   navbar in Figma calls the track "First Light". The file and its
   `LICENCE.md` are not in the repository.
5. **Screens that have no Figma frame:** the enquiry inbox and the settings
   page (both in chapter 14), and an albums index (`/albums`, chapter 12). The
   API routes for enquiries get built. The Studio pages wait for a design.
6. **Figma needs four corrections to match what was decided:** chapter 16 (the
   token file layout), chapters 02 and 08 (22 fixed albums, no create),
   chapter 07 (the new columns, the partial slot index, `jpeg`), chapter 13
   (the duplicate index cannot be created, see below). I have not edited the
   Figma page.
7. **`.claude/settings.json` still denies reads of the old token paths.** It is
   harmless. I left the permissions file alone.
8. **`CODEOWNERS` names `@dinethdesilva`.** The GitHub account that is signed in
   is `dinethde`. Tell me which is right.
9. **`docs/implementation-brief.md`** is untracked and I have left it that way.

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
- **Token layout:** the scaffold's, which `design.md` and the brief file agree
  on. `css/primitives.css`, `css/semantic.css`, `src/index.ts`.

## Open questions

Each has the option I would pick, so a one-word answer is enough.

**Q5 — The contact form's "Blocked" state.** It tells the visitor that an
earlier message from their email exists, and when. Chapter 13 says a repeat
within ten minutes returns 202 quietly, and the form notes say the page must
never learn which emails are on the list. The screen and the rule cannot both
hold. _I would build the quiet 202 and leave the Blocked state out._ Until you
answer, the API does the quiet 202 and the screen is not built.

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
  `DATABASE_URL="$(neonctl connection-string dev-claude --project-id icy-cell-66519183)" pnpm db:migrate`.
  That string is unpooled, which migrations need. Add `--pooled` for the apps.
- `architecture.md` and `design.md` had uncommitted edits from Dineth when the
  build started. They are committed together with my corrections.
- `.claude/settings.json` asks before `git push`, `fly`, `vercel`, `neonctl`,
  `wrangler` and `pnpm db:migrate`.
- To read Figma text in bulk, `get_metadata` cuts layer names short. A
  read-only `use_figma` script that returns `characters` gets the full text,
  up to about 20 KB a call. Screens and their node ids are listed in the
  `get_metadata` output for page `0:1`.
- App stylesheets import `@vows/config/tailwind/vows.css` first, then the two
  token stylesheets from `@vows/tokens/css/`.
