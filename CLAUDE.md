# Vows

A wedding photography site. Two halves: a public site, and a signed-in Studio.
Technical detail is in `architecture.md`. Design rules are in `design.md`.
Both reflect Figma, which is the source of truth.

## Before you start

- Read `architecture.md`. Do not infer the stack from the code.
- Work happens in the V2 worktree, on `feat/implementation-v2`.
- Pull requests target `dev-v2`. Never `main`.
- If a task is not covered by these files, the answer is in Figma. Ask for it
  rather than inventing one.

## Repository

```
apps/web      Next.js — public site and Studio UI
apps/api      NestJS — the only writer to the database
apps/worker   the same codebase, no HTTP server, runs jobs
packages/*    db, contracts, tokens, ui, mail, config
```

Apps never import from other apps. `apps/web` has no database driver and no
connection string; if you reach for one, you are in the wrong app.

## Commands

`pnpm dev` · `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm build`

Never run `db:migrate` against anything but your own Neon branch.

## Commits

Conventional Commits, enforced by commitlint.
Load `.claude/skills/writing-commits` before writing any commit message or pull
request description. No tool attribution of any kind — no `Co-Authored-By` for
an assistant, no generated-with footer, in the message or in the description.

## Pull requests

Base branch `dev-v2`. Title in Conventional Commit format, because it becomes
the squash commit. The description answers four questions in prose: what was
wrong, what you did, what you ruled out, how you checked it.

## Rules that are never bent

- No raw colour values anywhere. Tokens only.
- Every authenticated fetch carries `cache: 'no-store'`.
- Every call to the API goes through `apps/web/src/lib/api`. Nothing else calls
  `fetch` against it.
- Anything slower than ~300 ms becomes a job.
- Only `apps/api` writes to the database.
- Never edit generated files: `packages/tokens/*`, merged migrations.
- A real secret never enters the repository.

## When you are unsure

Stop and say so. A wrong guess written confidently into this codebase costs more
than a question. If something in `architecture.md` is wrong or missing, say that
too — it is a document, not scripture, and it gets fixed in the same pull
request as the code that noticed.
