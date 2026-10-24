# Vows V2 — QA log

Every change made after Dineth reviews the running build is recorded here, one
section per round, newest first. Each item says what was reported, what was
found, what changed, how it was checked, and where the change is (commits on
`feat/implementation-v2`). The build itself, before QA, is in `docs/progress.md`
and the git log; this file starts where review started.

Versions:

| Version | Date       | What it is                                    |
| ------- | ---------- | --------------------------------------------- |
| v2.0    | 2026-10-24 | The build as first handed over for review     |
| v2.1    | 2026-10-24 | QA round 1: home, album bar, footer, Studio   |
| v2.2    | 2026-10-24 | QA round 2: a clip in each error page's print |

---

## v2.2 — QA round 2

Asked for by Dineth on 2026-10-24: the print in the middle of each error page
(Figma `2448:1964`) read as an empty box. Fill it with the Peter Griffin clips
he supplied in `apps/web/src/assets/gifs`.

**8. A clip in each error page's print.**

- Supplied: `404.webp` (200 × 134, 97 frames), `500.webp` (356 × 200, 39
  frames), `403.gif` (220 × 185, a single frame, so it does not move).
- Code: `ErrorScreen` in `packages/ui` takes an optional `picture`, which fills
  the 164 × 192 print (72 × 84 on a phone), cropped to it, under the print's
  hairline edge; without one, the print keeps its drawing. The site passes a
  `<picture>` per page: the clip, or its first frame (`404-still.webp`,
  `500-still.webp`, made here) for anyone who asks for reduced motion. The
  files are served as they are, because an image optimiser would flatten the
  animation. The card stays decoration, hidden from screen readers.
- Figma: in all six frames (404, 500, 403 at 1440 and 390) the print's fill is
  the clip, with its first frame as a PNG fill underneath, because Figma's
  renderer for exports and previews drew the GIF fills blank. The drawings are
  kept in each print, hidden. The 404 print's dashed edge is now the same solid
  `border/hairline` as the others, since it is no longer an empty slot. The
  notes beside the frames (`2457:2037`) describe the new print.
- `design.md`: the error screen in the components table, and the still frame
  under reduced motion.
- Checked: in a browser at 1440 and 390, real 404 and 403 statuses, each clip
  loaded and covering the print, the still frame with reduced motion; the 500
  crop previewed frame by frame (Peter stays centred). Component tests for the
  picture and for its absence; accessibility tests pass.
- Commit: `1dec051` (code), and the documents commit after it.
- **Before launch — Dineth's call:** Peter Griffin is a Family Guy character,
  owned by 20th Television / Disney. These clips carry no licence, unlike the
  music. On a business's site that is a copyright risk; a takedown or claim is
  possible. Fine for staging and review. Before production, either confirm the
  use is acceptable or swap the files: they live in `apps/web/src/assets/gifs`,
  and replacing them under the same names changes nothing else.

---

## v2.1 — QA round 1

Reported by Dineth on 2026-10-24, after using the site locally.

### Home page

**1. The song does not play.**

- Found: the player asks for `audio/vows-theme.m4a` and `audio/vows-theme.ogg`
  on the media bucket, and neither file existed; both answered 404. The player
  code was fine. The track had never been supplied.
- Changed: at Dineth's request, a licensed track was found and added.
  "Gentle Glow (romantic saxophone)" by Surprising_Media on Pixabay, 4:48,
  free under the Pixabay Content License (no credit required; the track may not
  be sold or handed out on its own). Chosen over the 1:03 track literally named
  "Romantic Saxophone" because a short loop repeats every minute. Uploaded to
  the dev and staging media buckets as `audio/vows-theme.m4a` (AAC, 160 kbps,
  5.8 MB, played first) and `audio/vows-theme.mp3` (the original, the
  fallback). The `.ogg` was dropped: there is no Ogg encoder here and every
  current browser plays AAC. Source, licence and how the files were made are in
  `docs/music/LICENCE.md`.
- Checked: in a browser, nothing is downloaded before the visitor chooses
  music; after choosing, the `.m4a` streams and is playing 4 seconds later.
  The "never fetched unless asked" browser test still passes.
- Open: if Dineth prefers a different track, it replaces these two files under
  the same names.

**2. Too many album covers; more space between them.**

- Found: every place in the three Figma home frames is filled (22 on a
  desktop), with other photographs when fewer albums are published.
- Changed: the places are spread 30 per cent further apart, from the middle of
  the frame so the open space around the title stays put. The photographs keep
  their drawn sizes, and the endless canvas grows to match. One number,
  `SPREAD` in `apps/web/src/components/site/home/home-layout.ts`; 1 restores
  the Figma frame.
- Checked: covers on screen at once, 9 at 1440 (up to 22 before), 13 at 834,
  9 at 390; title still centred in clear space.
- Commit: `3efe552`.

**3. Every photograph should follow the cursor, not only the one under it.**

- Found: a photograph only reacted when the pointer passed near it (the push,
  which fades out at 320 px).
- Changed: a second movement, the follow. The whole field shifts towards where
  the pointer is — left with the pointer on the left, right on the right, up
  and down the same — by at most 16 px, each photograph by its own depth so the
  field reads as layers. It glides rather than jumps, and returns to the middle
  when the pointer leaves the window. The push near the pointer is kept, as
  asked. Off for touch and for reduced motion.
- Checked: unit tests for the maths; in a browser, a tile moves about 40 px
  between the pointer at the far left and the far right, at all three widths.
- Commit: `c3e064f`.

### Album page

**4. The album bottom bar was redrawn (Figma `2289:7026`).**

- Changed:
  - Each caption — `(type)`, `(location)`, the time of day — sits on the left
    edge of its value; they were centred.
  - Every part but the names is optional. An empty field is left out and the
    bar closes up; with no time of day the date is captioned `(date)`.
  - The frosted backdrop is the new shape: wider than the window (1684 / 1082
    / 638), with a fully rounded top, blurred at the edge. The home page's bar
    keeps its own.
  - `design.md` (components table, motion) and `architecture.md` updated.
- Checked: measured against the frame at 1440, 834 and 390 — names at 64 / 32
  / 20, the three details on one 384 px line on desktop, three lines on a
  phone. Component tests for the empty cases.
- Commits: `b55140f` (component), `c75c813` (documents).

### Footer

**5. The footer animates too early.** _(the biggest issue)_

- Found: the footer is sticky at the bottom and the page slides up off it. The
  browser counted the footer's box as fully in view the moment it reached the
  window, even though the page still lay on top of it, so it turned blue and
  dropped its photographs while it was mostly hidden.
- Changed: the cue is now a marker at the end of the page. The footer stays in
  state 1 (Figma `2188:864`) until that marker has passed the top of the window
  — the page fully gone, only the footer showing — and then turns and starts
  the falling photographs. Same on the contact page and the album page.
- Checked: on both pages at 1440 and 390, 40 px short of the end the footer is
  still in state 1, and at the end it turns. A browser test now covers it.
- Commit: `9c0d61a`.

**6. After the fall, every footer photograph should follow the cursor.**

- Changed: the same follow as the home page (item 3), in the loop the footer
  shares with the album gallery, so the album's floating photographs follow
  too. Say if the album gallery should stay still.
- Commit: `c3e064f`.

### Studio

**7. Signing in with Gmail returns the 403 page.**

- Found: signing in with Google created a new Clerk user with no role. The
  Studio lets in only `owner` and `editor`, so the 403 was the gate working.
- Changed: the role `owner` set on that user in the Clerk development instance
  (no code change). Sign out and in again, or wait about a minute, for the
  token to carry it.
- Documented: `architecture.md` chapter 09 now says a new account needs a role
  from an owner, and where to set it.
- Confirmed: the audit log shows Dineth's Google account working in the Studio
  from 06:19 UTC on 2026-10-24 — moving "Benali & Yasiru" to draft, reordering
  four photographs, publishing it and moving it back to draft.

### Checks for this round

Run from the repository root on 2026-10-24: typecheck, lint, unit tests and
the production build all pass. Browser suite: 30 passed, 13 skipped by design
(the deployed-only checks, and the Studio journeys, which ran on their own
against the Clerk development instance: 5 passed).

After the music was added, the home-page browser test failed on both widths:
not a fault, but the seeded album "Benali & Yasiru" was in draft, set so by
Dineth in the Studio at 06:21 UTC (audit log). The test needs one published
album; it passes with the album published, as it was for the run above.
