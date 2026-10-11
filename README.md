# Vows

Wedding photography studio site. Two halves that share one database and
almost nothing else: a public site at `vows.lk`, and a signed-in Studio at
`vows.lk/studio` where the photographer puts the work up.

## Where the truth lives

| Thing | Source of truth | Reflection in this repo |
| --- | --- | --- |
| Every technical decision | Figma page **Architecture.md** | `architecture.md` |
| Every visual decision | The Figma **design file** | `design.md` |

The two markdown files are copies kept so an agent working here can follow the
rules without opening Figma. When a markdown file and Figma disagree, **Figma is
right** and the markdown needs rewriting — in the pull request that noticed.

## Getting started

```bash
pnpm install
cp .env.example .env.local      # fill from the Bitwarden vault, never from a chat
pnpm dev
```

## Layout

```
apps/web        Next.js 15 — public site and Studio UI
apps/api        NestJS — the only writer to the database
apps/worker     the same NestJS modules, no HTTP server — runs pg-boss jobs
packages/db         Drizzle schema, migrations, seed
packages/contracts  Zod schemas shared by web and api
packages/tokens     generated from Figma — never edited by hand
packages/ui         the Figma component library in React
packages/mail       React Email templates
packages/config     eslint, tsconfig and tailwind presets
infra           Fly and R2 configuration
docs/adr        one file per decision
docs/incidents  what broke, and what stops it happening again
.claude         rules, skills, agents, commands, hooks — architecture.md ch 28
.github         CI, deploy, the pull request template
```

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Every app in watch mode |
| `pnpm typecheck` | TypeScript across the workspace |
| `pnpm lint` | ESLint across the workspace |
| `pnpm test` | Vitest unit and integration |
| `pnpm test:e2e` | Playwright |
| `pnpm build` | Production build of everything |
| `pnpm tokens:build` | Regenerate the design tokens from the Figma variables |
| `pnpm db:migrate` | Apply migrations — **only ever against your own Neon branch** |

## Working here

Work happens in this worktree, on `feat/implementation-v2`. Pull requests target
`dev-v2`, never `main`. Commit rules are in `architecture.md` chapter 23 and the
working copy is `.claude/skills/writing-commits/SKILL.md`.
