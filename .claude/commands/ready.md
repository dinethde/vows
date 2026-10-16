---
description: Run every check a pull request will run, then self-review the diff.
---

Run these, in order, and stop at the first failure:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm tokens:build && git diff --exit-code packages/tokens
```

Then read `git diff origin/dev-v2...HEAD` yourself and report:

1. Anything left behind — a `console.log`, a commented-out block, a file that
   should not be in this change.
2. Anything that contradicts `architecture.md` or `design.md`.
3. Whether there is a test for the thing that was broken.
4. Whether this is reviewable in ten minutes, or should be split.

Do not fix anything yet. List it, and let me choose.
