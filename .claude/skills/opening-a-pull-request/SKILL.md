---
name: opening-a-pull-request
description: The procedure for opening a pull request on Vows — base branch, title, description, checks and the self-review pass. Use when the work on a branch is finished and ready for review.
---

# Opening a pull request

## Before you open anything

```bash
git fetch origin
git rebase origin/dev-v2          # rebase, never merge
pnpm typecheck && pnpm lint && pnpm test
git push --force-with-lease
```

A failing check discovered by the reviewer is a wasted round trip.

## The pull request

- **Base branch is `dev-v2`.** Never `main`. A PR opened against `main` is
  closed and reopened, not argued about.
- **Title** in Conventional Commit format — it becomes the squash commit, so it
  follows the rules in `writing-commits`.
- **Description**: four questions in prose, under 200 words, one line on risk,
  and a link to the Figma node or the architecture chapter it implements. Load
  the `writing-commits` skill for the detail.

```bash
gh pr create --base dev-v2 --title "feat(web): …" --body-file .git/PR_BODY.md
```

## The self-review pass

Read your own diff on the pull request page before asking anyone else to. You
will find three things every time: a leftover `console.log`, a file you did not
mean to touch, and one function that made sense an hour ago. Fix them before
the review, not during it.

Then check the five that CI cannot:

1. Does the description explain _why_, not _what_?
2. Does anything in the diff contradict `architecture.md`? If the architecture
   is wrong, say so in the description rather than quietly diverging.
3. Did a design change land without the Figma file changing first?
4. Is there a test for the thing that was broken?
5. Would this be reviewable in ten minutes? If not, split it.

## After the merge

The branch deletes itself. Check the preview became staging, and the Fly release
and Vercel deployment both went green.
