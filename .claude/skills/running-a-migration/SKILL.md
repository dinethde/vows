---
name: running-a-migration
description: How to write and apply a Drizzle migration on Vows safely, including the expand-then-contract rule that keeps rollback possible. Use whenever the database schema changes.
---

# Running a migration

The rule that makes rollback possible: **the database is always ahead of the
code that needs it.** Migrations run before the new code deploys, so a migration
must work with the code that is currently live.

## The steps

```bash
# 1 · edit the schema
$EDITOR packages/db/src/schema/<table>.ts

# 2 · generate the SQL — never write the file by hand
pnpm db:generate

# 3 · read the generated SQL. every time.
$EDITOR packages/db/migrations/<timestamp>_<name>.sql

# 4 · apply it to YOUR OWN Neon branch
pnpm db:migrate

# 5 · seed and look at the result
pnpm db:seed
```

Never run `db:migrate` against staging or production from a laptop. CI does it,
between the API deploy and the web deploy.

## Expand, then contract

A rename is two releases, never one:

| Release | What it does | Safe because |
| --- | --- | --- |
| 1 | Add the new column, write to both, read from the old | Old code still works |
| 2 | Read from the new column | Both columns exist |
| 3 | Drop the old column | Nothing reads it any more |

A migration that drops or renames in the same release as the code change cannot
be rolled back, because rolling the code back leaves it talking to a column that
no longer exists.

## Before the PR

- Is the change additive? If not, say so in the description and name the
  release in which the destructive half lands.
- Does the ERD in the Figma page still match? Update it, and the table in
  chapter 07 of `architecture.md`.
- Did the migration get a test? An integration test that runs against a fresh
  branch is what proves the SQL is right.
