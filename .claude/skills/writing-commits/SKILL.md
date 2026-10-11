---
name: writing-commits
description: How to write commit messages and pull request descriptions for Vows so they read as though a person wrote them. Load before writing any commit message, PR title or PR description.
---

# Writing commits and pull requests

A commit message is the only part of a change that survives in a form a human
reads on purpose. In six months the diff will still be there, but the reason
will not — unless it was written down. That is the whole job.

There is nothing to run. The rules below are the pass, and the five questions at
the end are how you know you did it.

---

## 1 · What AI writing looks like

### In a commit message

| Tell | What it looks like | Why it gives itself away |
| --- | --- | --- |
| It restates the diff | `fix: update photo-slot.tsx to add error state` | Git already knows which file changed. The message spent itself saying nothing |
| Adjectives on plumbing | "comprehensive refactor", "robust error handling" | Nobody describes their own two-hour change as comprehensive |
| The same shape every time | Subject, blank line, exactly three bullets of equal length | Real changes are not the same size. Real messages are not either |
| "This commit…" | `This commit adds validation to the enquiry form` | A person writes `add validation to the enquiry form` |
| A bullet per file | Five bullets that are `git diff --stat` with verbs attached | The file list is free. The reason is not |
| A summary that summarises nothing | "These changes improve the overall maintainability of the codebase." | It fits every commit ever made, which is how you know it is empty |
| No uncertainty, ever | Every message confident, every change complete | "the tablet case still looks wrong, following up" is the most human line in any history |
| Nothing from outside the diff | No person, no decision, no chapter, no "as we discussed" | A human message is anchored to the world |
| Unmeasured numbers | "significantly improves performance" | If you measured it, give the number |
| Over-explaining a trivial change | Forty words on a typo fix | Effort should match the change |
| Emoji, or gitmoji on every commit | `✨ feat: …` | Fine in some projects. Not this one |
| Tool attribution | `Co-Authored-By: <a tool>`, `Generated with …` | Banned outright, and the loudest possible tell |

### In a pull request description

| Tell | What it looks like |
| --- | --- |
| The template filled perfectly and emptily | Four headings and six lines of content |
| "This PR introduces…" | The same opening on every pull request |
| A bullet per file, again | The file tree with verbs attached |
| "All tests pass" | No command, no test name, no screenshot. A claim, not evidence |
| No trade-offs | Nothing considered and rejected, no risk named |
| Checkbox theatre | Every box ticked, nothing checked |
| Over-polite closing | "Please let me know if you have any questions!" |
| Claims the diff does not support | "reduces re-renders" on a change that touches no rendering |

The root of all of them: **the text describes the change instead of explaining
it, and it is written to look complete rather than to be read.**

---

## 2 · The rules for commits

Conventional Commits stays: `type(scope): subject`. These are about the words.

1. **The subject says the effect, not the file.**
   `fix: stop the album hero reloading on every scroll`, not `fix: update album-hero.tsx`.
2. **Imperative, lowercase after the colon, no full stop, 60 characters or fewer.**
   Finish the sentence "if applied, this commit will…".
3. **Most commits have no body.** If the subject explains it, stop.
4. **If there is a body, it says at least one thing the diff cannot.** The
   reason, the constraint, what you tried first, who asked, which chapter it
   implements. If every line could be worked out from the diff, delete it.
5. **Three lines of body is plenty.** Prose, not bullets, unless there are
   genuinely separate items.
6. **Never open with "This commit", "This change" or "This PR".**
7. **Name the loose end.** One honest line about what is unfinished beats a
   paragraph of confidence.
8. **No numbers you did not measure.**
9. **No emoji. No tool attribution of any kind.**
10. **Vary.** If the last three commits have the same shape, the fourth is a
    different change and should look different.

### The word list

Not forbidden English — forbidden as filler. If deleting the word does not
change the meaning, it was filler.

```
comprehensive  robust      seamless(ly)  streamline   leverage
utilize        enhance(d)  facilitate    delve        intricate
pivotal        crucial     significant   cutting-edge elegant
performant     extensible  "ensure that" "in order to"
"This commit"  "This change"  "Overall,"  "Additionally,"
```

Two more usually mean the sentence is empty: **improve** and **update**. Before
using either, ask what actually changed.

### Before and after

```
fix: comprehensive update to the photo slot component

This commit enhances the photo slot component to ensure robust handling
of upload states and improves maintainability.

- Updates photo-slot.tsx
- Adds error state handling
- Improves prop types
```

```
fix: show the real error when an upload fails

the slot sat on "uploading" for ever when R2 rejected the PUT — we
listened for progress events and never for the error one.

the five states now match the Figma component exactly. if you add a
sixth, add it there first.
```

---

## 3 · The rules for pull requests

1. **The title is the merge commit subject.** Same rules as a commit subject.
2. **The body answers four questions, in prose, not under headings:** what was
   wrong, what you did, what you considered and did not do, how you know it works.
3. **Two hundred words is a long description.** Past that, split the PR.
4. **"How I checked" names something real** — the command, the screen you
   clicked, the album you published on staging. "All tests pass" is banned.
5. **One line on risk:** what could break and how to undo it.
6. **Ask the real question, if there is one.** Do not invent one.
7. **No headings on a small pull request.** No bullet-per-file, no checklists.
8. **Link the source:** the Figma node, or the chapter of `architecture.md`.
9. **Screenshots for anything visible**, at the width that matters.

### A description that works

> The album hero flickered on iOS when you scrolled back up, because the
> ThumbHash placeholder re-mounted with the image. Moved the placeholder outside
> the transition so it only renders once.
>
> I tried keeping it inside and keying off `loaded` first — that fixed the
> flicker but made the fade jump, so this is the version that looks right on a
> real phone.
>
> Checked on an iPhone 13 and a Pixel 7 on staging, up and down the Benali &
> Yasiru album about twenty times. Desktop unchanged.
>
> Low risk: one component, no data touched. Revert the commit if it misbehaves.
>
> Implements the hero behaviour in the Figma album page, node 2030:1964.

---

## 4 · The check, before you commit

Read it once, aloud if you can:

1. Does the first line say the **effect**, in words you would say out loud?
2. If there is a body, does it say **one thing the diff cannot**?
3. Any word from the list, any emoji, any tool attribution?
4. Would you send this sentence to a colleague in a chat?
5. Is it **shorter** than the change deserves, rather than longer?

Five passes and you commit. About twenty seconds.

---

## 5 · What is enforced

`commitlint.config.js` holds the format rules. `.husky/commit-msg` rejects tool
attribution, the filler words and the dead openings. `.claude/hooks/guard-commit.sh`
catches attribution before the commit is even attempted. The same greps run in
CI against the pull request title and body.

Everything else is a reviewer's job, and a pull request can be sent back for its
description alone.

---

## 6 · Where this comes from

Chapters 23 and 24 of the Figma page **Architecture.md**, reflected in
`architecture.md`. If they disagree, Figma is right and this file needs
rewriting, in the pull request that noticed.
