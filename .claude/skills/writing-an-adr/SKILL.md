---
name: writing-an-adr
description: How to record an architecture decision for Vows in docs/adr and in the Figma decision log. Use when a choice is made that will be expensive to reverse, or that someone will ask about later.
---

# Writing an ADR

An ADR is short: the decision, the alternatives, and the consequences —
including the bad ones. The hardest and most valuable section is the last, and
it is the one the author is least motivated to write.

## The steps

1. Copy `docs/adr/0000-template.md` to the next number.
2. Fill it in. Half a page. If it needs two, the decision is really two.
3. **Say what would make it wrong.** An ADR with no downside listed has not been
   thought about properly.
4. Add a row to the decision log in chapter 29 of the Figma page, and to the
   table in `architecture.md`. The ADR is the argument; the log is the index.
5. Reference the ADR number in the pull request description.

## What is worth an ADR

A dependency that is hard to remove. A data model shape. Anything where
somebody in six months will ask "why on earth is it like this?" — and anything
where the obvious answer is wrong.

Not worth one: a library version bump, a file move, a naming preference.

## Superseding

An ADR is never edited after it is merged, except to add a line at the top:
`Superseded by 0012`. The old reasoning stays readable, because the reason it
was wrong is the useful part.
