# The site's music

|            |                                                                                   |
| ---------- | --------------------------------------------------------------------------------- |
| Track      | Gentle Glow (romantic saxophone)                                                  |
| Artist     | Surprising_Media, on Pixabay                                                      |
| Source     | https://pixabay.com/music/traditional-jazz-gentle-glow-romantic-saxophone-477631/ |
| Licence    | Pixabay Content License — https://pixabay.com/service/license-summary/            |
| Downloaded | 2026-10-24, as a 256 kbps, 48 kHz MP3, 4 min 48 s                                 |
| Chosen by  | Claude, at Dineth's request, for chapter 14's "romantic saxophone"                |

**What the licence allows.** Free use, commercial included, with no credit
required, and changing the work. It forbids selling or distributing the track
on its own, and misleading or unlawful use. Playing it as the site's background
music is neither. Only Pixabay's full licence is binding; read it there if a use
is ever in doubt.

**Where the files are.** Not in this repository. In each media bucket
(`vows-media-dev`, `vows-media-staging`, and production when it exists):

- `audio/vows-theme.m4a` — AAC, 160 kbps, made with
  `afconvert -f m4af -d aac -b 160000 -q 127`; 5.8 MB. Played first.
- `audio/vows-theme.mp3` — the file as downloaded; 9.2 MB. The fallback.

Both are uploaded with `cache-control: public, max-age=86400`, so a replaced
track reaches visitors within a day. To replace it, upload under the same keys
and update this file.

The Figma navbar calls the track "First Light". That is the name the player
shows; the file's own title is the one above.
