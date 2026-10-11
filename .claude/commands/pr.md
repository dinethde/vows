---
description: Draft the pull request title and description for the current branch.
---

Load the `writing-commits` skill first, then read `git log origin/dev-v2..HEAD`
and `git diff origin/dev-v2...HEAD`.

Draft:

- A title in Conventional Commit format, under 60 characters, saying the effect.
- A description of four short paragraphs in prose — what was wrong, what you
  did, what you ruled out, how you checked it — with one line on risk and a link
  to the Figma node or the architecture chapter.

Show it to me before creating anything. Do not run `gh pr create` until I say so,
and when you do, the base branch is `dev-v2`.
