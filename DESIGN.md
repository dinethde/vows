# Vows Weddings — Home page design contract

Source of truth: Figma `vows-high-fidelity`, section **Homepage** (`2003-760`).

| Breakpoint | Design frame | State 1 (first load) | State 2 (after scroll) |
| --- | --- | --- | --- |
| Desktop | 1440 × 1024 | `2003-761` | `2003-1109` |
| Tablet | 834 × 1194 | `2015-764` | `2010-757` |
| Mobile | 390 × 844 | `2015-850` | `2010-863` |

The page is a single infinite, cursor-reactive canvas of scattered photographs with a
still title block held in the centre. There are no sections, no pagination, no footer
below the fold — the two bars are chrome that fades in over the canvas.

---

## 1. Tokens

All tokens are defined exactly once, in `src/styles/tokens.css`, as CSS custom properties
inside Tailwind v4 `@theme`. Nothing else in the repo may contain a colour literal, a raw
px size for type, a spacing literal, a radius or a motion duration. `eslint-plugin-vows`
(`no-design-literals`) fails the build on violations outside that one file.

### 1.1 Colour

| Token | Value | Figma origin |
| --- | --- | --- |
| `--color-canvas` | `#f8f8f9` | variable `Color/gray/100` (frame fill) |
| `--color-ink` | `#000000` | raw `black` — wordmark, nav links, hero title, bar text |
| `--color-ink-muted` | `#535051` | variable `Color/gray/1500` — hero subheading, hamburger rules |
| `--color-caption` | `rgb(0 0 0 / 0.8)` | raw `rgba(0,0,0,0.8)` — tile captions |
| `--color-surface` | `#ffffff` | raw `white` — CTA pill fill |
| `--color-chrome` | `rgb(255 255 255 / 0.2)` | raw `rgba(255,255,255,0.2)` — both bars |
| `--color-border-subtle` | `#dddddd` | raw `#ddd` — CTA pill border |
| `--color-scrim` | `rgb(248 248 249 / 0.94)` | derived from `--color-canvas` — mobile menu sheet |
| `--color-backdrop` | `rgb(0 0 0 / 0.28)` | derived — mobile menu backdrop |
| `--color-tile-ground` | `#e9e9eb` | derived — image placeholder before decode |
| `--color-focus-ring` | `#000000` | derived — focus outline (= ink) |
| `--color-focus-halo` | `#ffffff` | derived — outer focus halo, keeps the ring legible on dark photos |

No accent colour exists anywhere. The photography supplies all colour and contrast.

### 1.2 Blur / elevation

| Token | Value | Figma origin |
| --- | --- | --- |
| `--blur-chrome-top` | `10px` | `navbar` backdrop-blur |
| `--blur-chrome-bottom` | `5px` | `bottom_bar` backdrop-blur |
| `--blur-sheet` | `16px` | derived — mobile menu |

### 1.3 Spacing

Only the values the design actually uses.

| Token | Value | Used by |
| --- | --- | --- |
| `--space-3xs` | `4px` | caption container inline padding |
| `--space-2xs` | `5px` | tile → caption gap |
| `--space-xs` | `8px` | nav link block padding-y, hero title→subheading gap |
| `--space-sm` | `10px` | bottom bar padding-y, wide-caption tile gap (desktop tile 13) |
| `--space-md` | `12px` | nav link gap, CTA padding-x |
| `--space-lg` | `16px` | info-wrapper padding-x, mobile gutter |
| `--space-xl` | `20px` | mobile navbar gutter |
| `--space-2xl` | `24px` | tablet navbar/bottom-bar gutter |
| `--space-3xl` | `62px` | desktop navbar gutter |
| `--space-4xl` | `64px` | desktop bottom-bar gutter |

### 1.4 Radius

| Token | Value | Figma origin |
| --- | --- | --- |
| `--radius-pill` | `15px` | `nav_link` CTA corner radius |
| `--radius-tile` | `0px` | tiles are square-cornered in every frame |

### 1.5 Z-index

| Token | Value | Layer |
| --- | --- | --- |
| `--z-canvas` | `0` | gallery stage |
| `--z-hero` | `10` | centred title block |
| `--z-chrome` | `20` | navbar, bottom bar, floating mobile CTA |
| `--z-overlay` | `30` | mobile menu sheet + backdrop |

### 1.6 Motion

Figma specifies no easing or duration. These are chosen; they are the contract.

| Token | Value | Used by |
| --- | --- | --- |
| `--dur-instant` | `120ms` | focus ring |
| `--dur-fast` | `180ms` | caption opacity on hover |
| `--dur-base` | `320ms` | tile hover scale |
| `--dur-sheet` | `380ms` | mobile menu open/close |
| `--dur-slow` | `640ms` | chrome reveal |
| `--dur-entrance` | `800ms` | first-paint tile entrance |
| `--dur-drift` | `11s` | idle tile drift cycle (base; per-tile jitter ±3s) |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | reveals, entrances (out-quint) |
| `--ease-hover` | `cubic-bezier(0.33, 1, 0.68, 1)` | hover (out-cubic) |
| `--ease-inout` | `cubic-bezier(0.65, 0, 0.35, 1)` | sheet |
| `--stagger-chrome` | `80ms` | navbar → bottom bar |
| `--stagger-tile` | `36ms` | tile entrance, ordered by distance from viewport centre |
| `--lerp-pointer` | `0.085` | per-frame smoothing of the pointer-parallax target |
| `--lerp-scroll` | `0.12` | per-frame smoothing of the virtual scroll offset |

---

## 2. Type scale

Two families. `Mate` is the studio voice (variable `Primary Font`); `Inter` appears in
Figma on exactly two elements and is kept for fidelity (see §8, divergence D1).

| Token | Family | Size | Weight | Line height | Applied to |
| --- | --- | --- | --- | --- | --- |
| `--text-display` | Mate | `32px` | 400 | `1.2` | hero `Vows Weddings` |
| `--text-h5` | Mate | `20px` | 400 | `1.2` | `Vows` wordmark (navbar + bottom bar) — Figma style `H5` |
| `--text-body` | Mate | `16px` | 400 | `1.5` | nav links Portfolio / About / Contact — Figma style `Regular_text` |
| `--text-cta` | Mate | `16px` | 400 | `1.2` | `Chat with Dinuka` pill |
| `--text-bar` | Mate | `16px` | 400 | `1.35` | bottom-bar paragraph, `Since 2013` |
| `--text-bar-sm` | Mate | `11px` | 400 | `1.35` | bottom-bar paragraph, mobile only |
| `--text-subhead` | Inter | `14px` | 400 | `1` | hero subheading |
| `--text-caption` | Inter | `12px` | 500 | `1.25` | tile captions |

Font families: `--font-serif: 'Mate', 'Iowan Old Style', Georgia, serif`,
`--font-sans: 'Inter', system-ui, -apple-system, sans-serif`. Both are self-hosted
woff2 with `font-display: swap` and explicit `size-adjust`-free metrics fallbacks, so
no chrome text reflows on font swap.

---

## 3. Layout

### 3.1 Breakpoints

| Name | Range | Design width | Gallery band |
| --- | --- | --- | --- |
| `mobile` | `< 768px` | 390 | 13 tiles, band `473 × 946` |
| `tablet` | `768px – 1199px` | 834 | 17 tiles, band `950 × 1185` |
| `desktop` | `≥ 1200px` | 1440 | 22 tiles, band `1860 × 1531` |

Tile *density* drops with the breakpoint, tile *size* drops only ~25 % (tablet) and
~40 % (mobile) — photographs stay readable rather than becoming thumbnails.

### 3.2 The scatter model

Tile coordinates are the Figma frame coordinates, unchanged. A tile is:

```
wrapper  (absolutely positioned at x, y)
├─ image   w × h, object-fit: cover
├─ gap     --space-2xs (5px; 10px on desktop tile #13)
└─ caption 15px tall, padding-inline --space-3xs
```

The band is the axis-aligned bounding box of all wrappers for that breakpoint. Because
tiles bleed past every edge, the bounding box is larger than the frame:

| Breakpoint | band x | band y | band W × H |
| --- | --- | --- | --- |
| desktop | `-240 … 1620` | `-225 … 1306` | `1860 × 1531` |
| tablet | `-60 … 890` | `-50 … 1135` | `950 × 1185` |
| mobile | `-50 … 423` | `-40 … 906` | `473 × 946` |

**Infinite canvas.** The band is tiled on a lattice with period `(bandW, bandH)` in both
axes. Because each copy is a pure translation of a non-self-intersecting set by exactly
the bounding-box extent, copies can never overlap and there is never a gap — the canvas
is seamless in both directions at any viewport size. The band origin is offset
horizontally by `(viewportW − designW) / 2`, so at exactly the design width the visible
region is pixel-identical to the Figma frame. Only the vertical axis is scrolled; the
horizontal lattice exists to fill viewports wider (or narrower) than the design frame.
Copies render only where they intersect the viewport plus one tile of margin — typically
2 rows × 1 column (44 tiles) on desktop.

Photo assignment is identical in every copy: this is a **wrap**, not a shuffle. The
canvas is one field the visitor keeps moving across, so "no first or last photograph"
holds without the imagery mutating underneath them.

### 3.3 Tile families

Five repeating image ratios, scaled per breakpoint.

| Family | Desktop | Tablet | Mobile | Ratio |
| --- | --- | --- | --- | --- |
| `portrait` | `150 × 180` | `112 × 135` | `96 × 115` | 5 : 6 |
| `landscape` | `230 × 150` | `172 × 112` | `138 × 90` | 23 : 15 |
| `squareLg` | `200 × 200` | `150 × 150` | `120 × 120` | 1 : 1 |
| `squareSm` | `150 × 150` | `112 × 112` | `96 × 96` | 1 : 1 |
| `tall` | `160 × 210` | `120 × 157` | `100 × 131` | 16 : 21 |

### 3.4 Tile positions

`gap` is the wrapper's image→caption gap in px. `photo` is the pool slot (§3.5).

**Desktop — 22 tiles**

| # | family | x | y | photo |
| --- | --- | --- | --- | --- |
| 0 | squareLg | -210 | -225 | S1 |
| 1 | landscape | 860 | -200 | L1 |
| 2 | portrait | 428 | -152 | P1 |
| 3 | squareLg | 1321 | -92 | S2 |
| 4 | tall | 990 | 36 | P2 |
| 5 | landscape | 631 | 95 | L2 |
| 6 | tall | -96 | 106 | P3 |
| 7 | portrait | 256 | 170 | P4 |
| 8 | portrait | 1280 | 330 | P5 |
| 9 | squareSm | 950 | 403 | S3 |
| 10 | squareSm | 6 | 447 | S4 |
| 11 | landscape | 273 | 525 | L3 |
| 12 | landscape | 1365 | 613 | L4 |
| 13 | landscape | -240 | 650 | L5 *(gap 10)* |
| 14 | landscape | 815 | 710 | L6 |
| 15 | squareLg | 490 | 800 | S5 |
| 16 | portrait | 1164 | 838 | P6 |
| 17 | tall | 126 | 863 | P7 |
| 18 | squareSm | 1470 | 1011 | S6 |
| 19 | landscape | 371 | 1061 | L7 |
| 20 | squareSm | -200 | 1073 | S7 |
| 21 | squareLg | 846 | 1086 | S8 |

**Tablet — 17 tiles**

| # | family | x | y | photo |
| --- | --- | --- | --- | --- |
| 0 | squareLg | 430 | -50 | S1 |
| 1 | landscape | -40 | -30 | L1 |
| 2 | portrait | 230 | 60 | P1 |
| 3 | portrait | 660 | 95 | P2 |
| 4 | squareLg | 40 | 170 | S2 |
| 5 | landscape | 300 | 258 | L2 |
| 6 | squareLg | 690 | 300 | S3 |
| 7 | tall | -60 | 380 | P3 |
| 8 | squareSm | 430 | 380 | S4 |
| 9 | landscape | 130 | 400 | L3 |
| 10 | squareSm | 700 | 555 | S5 |
| 11 | portrait | 60 | 620 | P4 |
| 12 | squareSm | 350 | 700 | S6 |
| 13 | landscape | 600 | 760 | L4 |
| 14 | tall | 770 | 860 | P5 |
| 15 | tall | 200 | 930 | P6 |
| 16 | portrait | 560 | 980 | P7 |

**Mobile — 13 tiles**

| # | family | x | y | photo |
| --- | --- | --- | --- | --- |
| 0 | squareLg | 285 | -40 | S1 |
| 1 | landscape | -30 | -20 | L1 |
| 2 | portrait | 140 | 55 | P1 |
| 3 | tall | 10 | 120 | P2 |
| 4 | portrait | 280 | 120 | P3 |
| 5 | landscape | 130 | 215 | L2 |
| 6 | squareLg | -50 | 285 | S2 |
| 7 | landscape | 30 | 490 | L3 |
| 8 | tall | 255 | 500 | P4 |
| 9 | portrait | -20 | 640 | P5 |
| 10 | squareSm | 150 | 660 | S3 |
| 11 | landscape | 285 | 715 | L4 |
| 12 | squareSm | 35 | 790 | S4 |

### 3.5 Photography

22 photographs sourced from Unsplash, in three orientation pools that match the tile
families: **P1–P7** portrait (serve `portrait` and `tall`), **L1–L7** landscape,
**S1–S8** square-cropped. The set keeps Figma's mixed film treatment: golden-hour
colour, black and white, motion-blurred candids, dim receptions. Every image is stored
locally under `public/photos/`, encoded as AVIF + WebP at 1×/2× of the largest slot the
photo occupies (max 460 px wide), served through `<picture>` with `srcset`,
`loading="lazy"` (eager for the ~8 tiles in the first viewport), `decoding="async"`,
and explicit `width`/`height` so no tile ever shifts. Full-resolution originals are
never shipped. Attribution for all 22 lives in `public/photos/CREDITS.md`.

### 3.6 Hero block

Absolutely centred in the viewport (`left: 50%; top: 50%; translate(-50%,-50%)`),
identical at all three breakpoints — Figma centres it in every frame.

- `Vows Weddings` — `--text-display`, `--color-ink`
- gap `--space-xs`
- `Make your day forever vow.` — `--text-subhead`, `--color-ink-muted`

It is the only still element on the page and it never moves, in either state.

### 3.7 Navbar

Full-bleed, fixed to the top. Fill `--color-chrome`, `backdrop-filter: blur(var(--blur-chrome-top))`.

| | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| height | `48px` | `48px` | `40px` |
| gutter | `--space-3xl` (62) | `--space-2xl` (24) | `--space-xl` (20) |
| layout | `justify-between`: wordmark / links / CTA | wordmark left, links absolutely centred, CTA right | wordmark left, hamburger right |
| links | Portfolio · About · Contact, each `76px` wide, gap `--space-md` | same | moved into the sheet |
| CTA | `Chat with Dinuka` pill, right | same | not in the bar — floats above the bottom bar |

CTA pill: `--color-surface` fill, `1px` `--color-border-subtle` border,
`--radius-pill`, padding `6px --space-md`, `--text-cta`.

Hamburger: `24 × 24` box, three `20 × 1.5px` rules in `--color-ink-muted` at
`y = 5 / 11.25 / 17.5`.

### 3.8 Bottom bar

Full-bleed, fixed to the bottom. Fill `--color-chrome`,
`backdrop-filter: blur(var(--blur-chrome-bottom))`. Three zones.

| | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| height | `76px` | `88px` | `120px` |
| gutter | `--space-4xl` (64) | `--space-2xl` (24) | `--space-lg` (16) |
| layout | one row, `justify-between` | one row, `justify-between` | two rows |
| `Vows` | left, `--text-h5` | left, `--text-h5` | row 2 left, `--text-h5` |
| paragraph | centre, `632px`, `--text-bar` | centre, `480px`, `--text-bar`, 3 lines | row 1, full width, `--text-bar-sm`, 3 lines |
| `Since 2013` | right, `--text-bar`, two lines | right, two lines | row 2 right, one line |

Each zone is an `info_wrapper` with `--space-lg` inline / `--space-xs` block padding.

Mobile only: the `Chat with Dinuka` pill floats `16px` above the bottom bar, horizontally
centred, at `--z-chrome`.

### 3.9 Mobile menu

Not drawn in Figma — the frame keeps a hidden `nav_links (moves into menu overlay)`
layer. Built as a shadcn `Sheet` sliding from the right, full height, `min(84vw, 320px)`
wide, `--color-scrim` fill with `--blur-sheet`, `--color-backdrop` behind. Contents:
the three nav links at `--text-display`-adjacent scale (`--text-h5`), stacked with
`--space-xl` gaps, plus the CTA pill. Focus is trapped; `Esc` and backdrop click close it.

---

## 4. States

State is a single boolean, `chromeRevealed`, latched once and never unset.

| | State 1 — first load | State 2 — after first scroll |
| --- | --- | --- |
| gallery canvas | visible, drifting, cursor-reactive | unchanged, still scrolling infinitely |
| hero block | visible, centred, still | **unchanged and unmoved** |
| navbar | absent (`opacity: 0`, `visibility: hidden`, `inert`) | visible |
| bottom bar | absent | visible |
| mobile floating CTA | absent | visible |
| scroll indicator | none in either state | none |

**Trigger:** the first scroll intent of the session — a wheel event, a touch drag, or a
keyboard scroll key — that moves the virtual scroll offset by more than `8px`. Pointer
movement alone does not trigger it.

Both bars **fade in over** the canvas. They are `position: fixed` and do not participate
in canvas layout, so no photograph moves at the moment they appear, and the hero stays
exactly where it is. This is a reveal of navigation, not a transition to a second section.

While hidden, the bars carry `inert` and `visibility: hidden` so their links are not
tabbable and not announced.

---

## 5. Motion

Driven by GSAP. `gsap.ticker` is the single rAF loop; only `transform` and `opacity`
are written in hot paths. Tiles get `will-change: transform` only while a gesture or
pointer interaction is live.

### 5.1 Scroll

The canvas wraps, so there is no finite scroll distance for `ScrollTrigger` to scrub
against and no document height that could represent it. Scrolling is therefore virtual:
**`ScrollTrigger.observe()`** (ScrollTrigger's Observer API) captures `wheel`, `touch`
and `pointer` input and integrates it into a single `scrollOffset`, which is smoothed
toward its target with `--lerp-scroll` and applied to the stage as one
`translate3d(0, -offset mod bandH, 0)`. Keyboard scrolling is handled alongside it
(§6). The document itself does not scroll; `<body>` is `overflow: hidden`.

`ScrollTrigger` proper is still registered and used for the chrome-reveal trigger and
for the entrance batch.

| | Value |
| --- | --- |
| wheel → offset | `1 : 1`, `wheelMultiplier: 1` |
| touch → offset | `1 : 1` with GSAP's built-in momentum |
| smoothing | `lerp(current, target, --lerp-scroll)` per tick |
| wrap | `offset mod bandH`, lattice rows re-rendered only when the visible row index changes |

### 5.2 Animation inventory

| # | Animation | Trigger | Property | Duration / easing | Reduced-motion |
| --- | --- | --- | --- | --- | --- |
| 1 | Tile entrance | first paint | `opacity 0→1`, `scale 0.96→1`, `y +24→0` | `--dur-entrance`, `--ease-out`, `--stagger-tile` by distance from centre | `opacity` only, `--dur-base`, no stagger |
| 2 | Hero entrance | first paint | `opacity 0→1`, `y +10→0` | `--dur-entrance`, `--ease-out`, `120ms` delay | `opacity` only |
| 3 | Chrome reveal | first scroll > 8px | navbar `opacity 0→1`, `y −8→0`; bottom bar `opacity 0→1`, `y +8→0` | `--dur-slow`, `--ease-out`, bottom bar delayed `--stagger-chrome` | `opacity` only, `--dur-base` |
| 4 | Pointer parallax | `pointermove` (fine pointers only) | per-tile `translate3d` of `(pointer − centre) × depth`, `depth ∈ [0.010, 0.026]` scaled inversely with tile area | continuous, lerped at `--lerp-pointer` | **off** |
| 5 | Scroll parallax | virtual scroll | per-tile extra `y` of `offset × (depth × 1.6)` | continuous, same lerp | **off** |
| 6 | Idle drift | always | per-tile `x/y` sine, amplitude `±6px` (desktop) / `±4px` (mobile) | `--dur-drift` ± jitter, `sine.inOut`, random phase | **off** |
| 7 | Tile hover | `pointerenter` | image `scale 1→1.03`; caption `opacity 0.8→1` | `--dur-base` / `--dur-fast`, `--ease-hover` | caption `opacity` only |
| 8 | Tile focus | `:focus-visible` | focus ring on the wrapper | `--dur-instant` | same |
| 9 | Mobile sheet | menu toggle | panel `x 100%→0`, backdrop `opacity 0→1` | `--dur-sheet`, `--ease-inout` | `opacity` only |
| 10 | CTA / nav hover | `pointerenter` | `opacity 1→0.62` (links), pill `border-color` → `--color-ink` | `--dur-fast`, `--ease-hover` | same (non-transform, kept) |

### 5.3 Reduced motion

`prefers-reduced-motion: reduce` disables animations 4, 5 and 6 entirely (the ticker
loop is not started), and reduces 1, 2, 3 and 9 to opacity-only cross-fades. Scrolling
still works and still wraps — it simply becomes a direct, unsmoothed offset
(`--lerp-scroll: 1`). The page is fully usable and every photograph is still reachable.

### 5.4 Why DOM, not WebGL

The scatter canvas is at most 44 simultaneous tiles, each animated with a single
composited `translate3d` + `scale` written once per tick from one `gsap.ticker`
callback. There is no per-pixel effect in the design — no displacement, no distortion,
no blend beyond the bars' `backdrop-filter`. A WebGL renderer would add a texture
upload path, a second scheduling loop and an accessibility problem (photographs inside
a canvas are neither focusable nor linkable) in exchange for nothing the compositor
does not already do at 60 fps. **The canvas stays DOM + transforms.**

---

## 6. Accessibility

- Every photograph is an `<a href="/portfolio/{slug}">` wrapping the `<picture>` and the
  caption, so it is focusable, has an accessible name (`{couple} — wedding photograph`)
  and is reachable by keyboard alone.
- Only the **base lattice copy** is in the tab order; every repeated copy is
  `aria-hidden` with `tabindex="-1"`, so tab order is finite and matches the 22/17/13
  real photographs.
- Focusing a tile scrolls the virtual canvas so the tile is fully in view.
- Keyboard scrolling: `↑`/`↓` ± 80px, `PageUp`/`PageDown` ± 90 % of viewport height,
  `Space` / `Shift+Space` likewise, `Home` returns to offset 0. Handled on the canvas
  region, which has `tabindex="0"` and `role="region"` with an accessible name.
- A visually-hidden skip link jumps past the canvas to the navigation.
- Focus ring: `2px` `--color-focus-ring` outline with a `2px` `--color-focus-halo`
  offset shadow so it reads on both the near-white canvas and dark photographs.
- The bars are `inert` while in State 1.
- Live region announces "Navigation revealed" once, when the chrome appears.

---

## 7. Component inventory

| Component | Props | Variants |
| --- | --- | --- |
| `GalleryCanvas` | — | — (owns virtual scroll, lattice, ticker, reveal latch) |
| `GalleryBand` | `tiles`, `col`, `row`, `primary: boolean` | primary (tabbable) / repeat (`aria-hidden`) |
| `PhotoTile` | `tile: Tile`, `photo: Photo`, `index`, `primary`, `eager` | by `family` (drives size only) |
| `HeroTitle` | — | — |
| `SiteHeader` | `revealed: boolean` | `desktop` \| `tablet` \| `mobile` (CSS, one DOM tree) |
| `SiteFooterBar` | `revealed: boolean` | `desktop` \| `tablet` \| `mobile` |
| `NavLink` | `href`, `children`, `variant` | `wordmark` \| `link` |
| `ChatCta` | `className?`, `floating?: boolean` | shadcn `Button` variant `pill`, sizes `default` \| `floating` |
| `MobileMenu` | `open`, `onOpenChange` | shadcn `Sheet`, side `right` |
| `MenuButton` | `open`, `onClick` | — |
| `SkipLink` | `href` | — |

Hooks: `useBreakpoint()` → `'mobile' | 'tablet' | 'desktop'`;
`usePrefersReducedMotion()` → `boolean`; `useChromeReveal()` → `{ revealed, markScrolled }`.

Data: `src/data/tiles.ts` (the three tables of §3.4), `src/data/photos.ts` (the 22-photo
pool with slug, alt text, orientation and credit), `src/data/copy.ts` (all page strings).

shadcn/ui is scoped to **`button`** and **`sheet`** only. Nothing else from the registry
is installed.

---

## 8. Decisions and divergences from Figma

**D1 — Two families, not one.** The canvas annotation says "one serif (Mate)", but the
frames set the hero subheading and all tile captions in Inter. The frames are what Phase 5
compares against, so Inter is kept for those two elements and Mate is used everywhere
else. Flagged because it contradicts the annotation.

**D2 — Hero subheading wording.** The annotation says "Make your day vow forever."; both
desktop frames render "Make your day forever vow." The frames win:
**"Make your day forever vow."** is used, identically in both states.

**D3 — Caption overflow.** The Figma caption slot is a fixed `93 × 15` box and a longer
couple name would clip. Rule adopted: the caption is a single line,
`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`, with
`max-width: max(93px, <tile width>)`. Names up to the tile's own width render in full;
longer ones truncate with an ellipsis and keep the complete name in the link's accessible
name. The slot height stays `15px` in all cases, so no tile ever reflows.

**D4 — Motion values are invented.** Figma has no easing, duration or parallax data.
Everything in §1.6 and §5 is a choice, recorded here as the contract.

**D5 — Sub-pixel and sloppy-frame normalisation.** Figma's tablet navbar is `47px` tall
with children summing to 48; the desktop bottom bar sits at `x = 6` on a `1440`-wide
frame; the tablet CTA sits at `y = 8.5`. These are artefacts of a hand-placed frame.
Implementation uses `48px`, `x = 0` and integer vertical centring respectively.

**D6 — Mobile navbar height.** Figma's mobile navbar frame is `40px` with the wordmark
block occupying `y 8–40` and the hamburger `y 12–36` — neither is centred. Both are
vertically centred in a `40px` bar.

**D7 — Caption content.** Every Figma tile reads "Benali & Yasiru", which is clearly
placeholder. The build ships 22 distinct couple names of varying length, which is what
exercises D3.

**D8 — Photography.** Figma's tiles are placeholder images. The build sources 22
Unsplash photographs matching each family's aspect ratio and the set's mixed film
treatment. Geometry, type, colour, spacing and motion match Figma; the images do not.

**D9 — No native scrollbar.** The virtual scroll means the browser scrollbar is absent.
The design shows no scrollbar and no scroll indicator in either state, so this matches
intent, but it is a real behavioural difference from an ordinary page.

**D10 — Horizontal lattice.** Figma defines one frame width per breakpoint. Real
viewports are continuous, so the band is also repeated horizontally (§3.2) to fill
widths the frames do not describe. At exactly `1440 / 834 / 390` the visible region is
the Figma frame.
