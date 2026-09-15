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
| `--color-caption-ink` | `rgb(0 0 0 / 0.8)` | raw `rgba(0,0,0,0.8)` — tile captions |
| `--color-surface` | `#ffffff` | raw `white` — CTA pill fill |
| `--color-chrome` | `rgb(255 255 255 / 0.2)` | raw `rgba(255,255,255,0.2)` — both bars |
| `--color-border-subtle` | `#dddddd` | raw `#ddd` — CTA pill border |
| `--color-scrim` | `rgb(248 248 249 / 0.94)` | derived from `--color-canvas` — mobile menu sheet |
| `--color-backdrop` | `rgb(0 0 0 / 0.28)` | derived — mobile menu backdrop |
| `--color-tile-ground` | `#e9e9eb` | derived — image placeholder before decode |
| `--color-accent-practice` | `#ff7513` | raw — loader's left dot |
| `--color-accent-place` | `#1389ff` | raw — loader's right dot |
| `--color-focus-ring` | `#000000` | derived — focus outline (= ink) |
| `--color-focus-halo` | `#ffffff` | derived — outer focus halo, keeps the ring legible on dark photos |

The two loader dots (§11) are the only hues in the design. Everywhere else the
photography supplies all the colour and contrast.

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
| `--z-loader` | `40` | loading screen — above everything, including the sheet |

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
| `--lerp-pan` | `0.12` | per-frame smoothing of the pan offset |
| `--wheel-speed` | `1` | wheel delta → pan, unscaled |
| `--drag-threshold` | `6` | px of travel that turns a press into a pan (§5.1) |
| `--cull-margin` | `120` | px outside the viewport past which a cell's tiles stop updating |
| `--inertia-seconds` | `0.28` | release velocity is thrown this far ahead |
| `--inertia-max` | `1600` | px ceiling on a single throw |
| `--eq-period` | `900ms` | equalizer bar cycle |
| `--audio-fade` | `0.9` | seconds, volume ramp in and out |

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
| `--text-bar` | Mate | `16px` | 400 | `1.25` | bottom-bar paragraph, `Since 2013` |
| `--text-bar-sm` | Mate | `11px` | 400 | `1.25` | bottom-bar paragraph, mobile only |
| `--text-subhead` | Inter | `14px` | 400 | `1` | hero subheading |
| `--text-caption` | Inter | `12px` | 500 | `1.25` | tile captions |
| `--text-meta` | Inter | `16px` | 400 | `1.2` | loader side labels (§11) |

Font families: `--font-serif: 'Mate', 'Iowan Old Style', Georgia, serif`,
`--font-sans: 'Inter', system-ui, -apple-system, sans-serif`. Both are self-hosted
woff2 with `font-display: swap`, generated by `node scripts/prepare-fonts.mjs`.

Google splits each family across subsets with disjoint `unicode-range`s, and `latin` is
not the first of them — taking a single file drops most of basic latin and the browser
falls back mid-word without any error. Both `latin` and `latin-ext` are downloaded and
re-declared with their own ranges.

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

**The canvas is a torus.** The band is tiled on a lattice with period `(bandW, bandH)`
in both axes, and **both axes pan and wrap**. Because each copy is a pure translation of
a non-self-intersecting set by exactly the bounding-box extent, copies can never overlap
and there is never a gap — diagonal crossings included. The band origin is offset
horizontally by `(viewportW − designW) / 2`, so at a pan of `(0, 0)` and exactly the
design width the visible region is pixel-identical to the Figma frame.

The tile field's dimensions — the wrap period on each axis — are the band extents in
§3.2's table: **1860 × 1531** on desktop, **950 × 1185** on tablet, **473 × 946** on
mobile. Pan past those and the same field returns.

Cells render one further than strictly covers the viewport on each axis, so a cell only
ever recycles while it is completely off screen. At 1440 × 1024 that is 2 rows × 2
columns — 88 tiles — of which the ticker only updates the ones within a band's margin of
the viewport.

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
never shipped. Attribution for all 22 lives in `public/photos/CREDITS.md`. The set is reproducible:
`scripts/photos.manifest.json` holds the slot → Unsplash id mapping and
`node scripts/prepare-photos.mjs` regenerates every derivative from it.

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
`--radius-pill`, padding `5px --space-md` (`--cta-pad-y`), `--text-cta`. Figma’s codegen reports `6px`, but the instance measures `31px` tall, which `5px` reproduces.

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
| gallery canvas | visible, drifting, cursor-reactive | unchanged, still panning infinitely |
| hero block | visible, centred, still | **unchanged and unmoved** |
| navbar | absent (`opacity: 0`, `visibility: hidden`, `inert`) | visible |
| bottom bar | absent | visible |
| mobile floating CTA | absent | visible |
| music player | absent | visible, in whatever state §10 resolves to |
| scroll indicator | none in either state | none |

**Trigger:** the first **pan in any direction** — a wheel or trackpad gesture, a mouse
drag, a touch drag, or a keyboard pan key — that moves the canvas more than `8px`. A
purely horizontal first gesture counts, which is why the test is on the gesture's
distance rather than on its vertical component. The first `Tab` also counts: a
keyboard-only visitor shows the same intent, and without it the skip link would lead into
an inert navbar. Pointer movement without a press does not trigger it.

The same gesture starts the ambience track (§10) — it is the visitor's first interaction,
and the only moment a browser will let audio begin.

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

### 5.1 Pan

The canvas wraps on both axes, so there is no finite distance for a scrollbar to
represent and no document height that could stand in for one. Panning is therefore
direct: `src/lib/pan.ts` owns a single 2D offset, input writes to `targetX`/`targetY`,
and the ticker eases `x`/`y` toward it. The document itself never scrolls; `<body>` is
`overflow: hidden`.

**There is no hidden scrollable proxy, and no ScrollTrigger.** The previous build drove
the vertical-only canvas through `ScrollTrigger.observe()`. With two axes that stopped
being a fit: Observer applied only the first `pointermove` of a mouse drag and never
reported the press, so a drag travelled a few pixels and stopped. Pointer Events already
unify mouse, touch and pen, so the input driver is ~150 lines of explicit handlers and
the ScrollTrigger dependency is gone entirely.

| Input | Mapping |
| --- | --- |
| wheel / trackpad | `deltaX → panX`, `deltaY → panY`, both applied every event, so a diagonal trackpad gesture pans diagonally. No axis locking. `deltaMode` of lines or pages is normalised to px first. |
| shift + wheel | whatever the browser reports, unchanged — Chrome and Safari already move the delta onto `deltaX` |
| mouse drag | `pointerdown` anywhere on the canvas; movement is applied inverted, so the field follows the cursor like a map. Inertia on release. |
| touch drag | the same pointer path; one finger, both axes, same inertia |
| keyboard | `←` `→` `↑` `↓` pan by `--key-step` (80px); `PageUp` / `PageDown` / `Space` / `Shift+Space` by `--key-page-ratio` (90 %) of viewport height; `Home` returns to `(0, 0)` |

| | Value |
| --- | --- |
| wheel → pan | `1 : 1` (`--wheel-speed`) |
| drag → pan | `1 : 1` |
| smoothing | `lerp(current, target, --lerp-pan)` per tick |
| inertia | release velocity, sampled over the last `90ms`, thrown `--inertia-seconds` ahead and clamped to `--inertia-max` |
| wrap | `cellOffset()` per axis, per cell; a cell recycles only while fully off screen |

**Click versus drag.** A press that travels more than **`--drag-threshold` (6px)**
cumulatively is a pan: a capture-phase `click` handler on the canvas cancels the click so
the tile underneath is not activated. At or below 6px the press is a click and reaches
the tile's link normally. 6px is large enough to absorb the tremor in a deliberate tap
and small enough that an intentional drag never feels like it has to overcome anything.

Two browser behaviours had to be suppressed for this to work at all:

- **No `setPointerCapture`.** Capturing retargets the subsequent `click` to the capture
  element, so tapping a photograph would land on the canvas and never reach its link.
  The drag listens on `window` between press and release instead, which keeps a drag
  alive past the element edge without touching event targeting.
- **No native drag.** Every tile is a link wrapping an image and both are natively
  draggable; left alone, a drag starting on a photograph becomes a browser link-drag that
  cancels the pointer stream. `dragstart` is prevented on the canvas, the link is
  `draggable={false}`, and `-webkit-user-drag: none` covers the rest.

**Browser gestures.** The canvas sets `touch-action: none` and `overscroll-behavior:
none`, `<html>`/`<body>` add `overscroll-behavior-x: none`, and `wheel` is a
non-passive listener that calls `preventDefault()`. Together these stop pull-to-refresh,
rubber-banding and horizontal swipe-back, so a pan can never navigate away.

**Test seam.** The canvas element carries a live handle on its pan offset at
`.vows-canvas.__vowsPan`. It is assigned once at setup — nothing is written per frame —
and exists so the pan can be asserted directly rather than inferred from a wrapped
transform.

### 5.2 Animation inventory

| # | Animation | Trigger | Property | Duration / easing | Reduced-motion |
| --- | --- | --- | --- | --- | --- |
| 1 | Tile entrance | first paint | `opacity 0→1`, `scale 0.96→1`, `y +24→0` | `--dur-entrance`, `--ease-out`, `--stagger-tile` by distance from centre | `opacity` only, `--dur-base`, no stagger |
| 2 | Hero entrance | first paint | `opacity 0→1`, `y +10→0` | `--dur-entrance`, `--ease-out`, `120ms` delay | `opacity` only |
| 3 | Chrome reveal | first pan > 8px | navbar `opacity 0→1`, `y −8→0`; bottom bar `opacity 0→1`, `y +8→0` | `--dur-slow`, `--ease-out`, bottom bar delayed `--stagger-chrome` | `opacity` only, `--dur-base` |
| 4 | Pointer parallax | `pointermove` (fine pointers only) | per-tile `translate3d` of `(pointer − centre) × depth`, `depth ∈ [0.010, 0.026]` scaled inversely with tile area | continuous, lerped at `--lerp-pointer` | **off** |
| 5 | Pan parallax | pan on either axis | per-tile `x`/`y` offset of `(screen position − viewport centre) × depth × --depth-pan-factor`, clamped to one viewport | continuous, same lerp | **off** |
| 6 | Idle drift | always | per-tile `x/y` sine, amplitude `±6px` (desktop) / `±4px` (mobile) | `--dur-drift` ± jitter, `sine.inOut`, random phase | **off** |
| 7 | Tile hover | `pointerenter` | image `scale 1→1.03`; caption `opacity 0.8→1` | `--dur-base` / `--dur-fast`, `--ease-hover` | caption `opacity` only |
| 8 | Tile focus | `:focus-visible` | focus ring on the wrapper | `--dur-instant` | same |
| 9 | Ambience fade | play / pause | `audio.volume` 0 ↔ `--audio-volume` | `--audio-fade` (0.9s), linear | unchanged — a fade is not motion |
| 10 | Equalizer | while playing | bar `height` | `--eq-period`, `--ease-inout`, alternating, staggered per bar | **off** — bars hold at full height |
| 11 | Mobile sheet | menu toggle | panel `x 100%→0`, backdrop `opacity 0→1` | `--dur-sheet`, `--ease-inout` | `opacity` only |
| 12 | Loader decode / erase / hand-off | page load | text content, line `opacity`, ground `opacity` | §11.2 | decode and erase skipped; lines cross-fade |
| 13 | CTA / nav hover | `pointerenter` | `opacity 1→0.62` (links), pill `border-color` → `--color-ink` | `--dur-fast`, `--ease-hover` | same (non-transform, kept) |

### 5.3 Reduced motion

`prefers-reduced-motion: reduce` disables animations 4, 5, 6 and 10 entirely (the
per-tile half of the ticker does not run), and reduces 1, 2, 3 and 11 to opacity-only
cross-fades. **Inertia is not applied on release.** Panning still works and still wraps
— it simply becomes direct, unsmoothed positioning (`lerp = 1`). The page is fully
usable, every photograph is still reachable, and the ambience still plays and fades.

### 5.4 Why DOM, not WebGL

The scatter canvas is at most 88 simultaneous tiles across four lattice cells — and the
ticker only runs the per-tile maths for cells within a band's margin of the viewport, so
the hot path is closer to 22. Each tile takes a single composited `translate3d` written
once per tick from one `gsap.ticker` callback, and each cell one more. There is no per-pixel effect in the design — no displacement, no distortion,
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
- The repeats are **not** `inert`, and remain clickable. The canvas wraps, so after a
  band of panning the photograph under the cursor is a repeat rather than the base
  copy — making them non-interactive left every visible photograph dead as soon as the
  visitor explored. Keeping them out of the tab order and out of the accessibility tree
  is the part that was right; taking the pointer away with it was not.
- Focusing a tile pans the canvas on both axes so the tile is fully in view.
- Keyboard panning covers **both** axes — it is the only way a keyboard-only visitor
  reaches a photograph that is off to the side, so it is required, not a convenience.
  `←`/`→` and `↑`/`↓` pan ± 80px, `PageUp`/`PageDown` and `Space`/`Shift+Space` pan
  ± 90 % of viewport height, `Home` returns to `(0, 0)`. Handled on the canvas region,
  which has `tabindex="0"` and `role="region"` with an accessible name.
- A visually-hidden skip link jumps past the canvas to the navigation.
- Focus ring: `2px` `--color-focus-ring` outline with a `2px` `--color-focus-halo`
  offset shadow so it reads on both the near-white canvas and dark photographs.
- The bars are `inert` while in State 1.
- Live region announces "Navigation revealed" once, when the chrome appears.

---

## 7. Component inventory

| Component | Props | Variants |
| --- | --- | --- |
| `GalleryCanvas` | `onFirstPan` | — (owns the pan, the lattice, the ticker and the reveal latch) |
| `PhotoTile` | `tile: Tile`, `primary`, `eager` | by `family` (drives size only) |
| `AmbiencePlayer` | `revealed`, `status`, `onToggle`, `track`, `audioRef` | by `status`: `paused` \| `playing` \| `blocked` |
| `LoadingScreen` | — | by phase (§11.2); three-column row at `≥1200px`, stacked below |
| `HeroTitle` | — | — |
| `SiteHeader` | `revealed: boolean` | `desktop` \| `tablet` \| `mobile` (CSS, one DOM tree) |
| `SiteFooterBar` | `revealed: boolean` | `desktop` \| `tablet` \| `mobile` |
| `SiteFooter` | — | `desktop` \| `tablet` \| `mobile` (CSS grid, one DOM tree) — the standing panel of §13, rendered by the `_site` layout route |
| `NavLink` | `href`, `children`, `variant` | `wordmark` \| `link` |
| `ChatCta` | `className?`, `floating?: boolean` | shadcn `Button` variant `pill`, sizes `default` \| `floating` |
| `MobileMenu` | `open`, `onOpenChange` | shadcn `Sheet`, side `right` |
| `MenuButton` | `open`, `onClick` | — |
| `SkipLink` | `href` | — |

Hooks: `useBreakpoint()` → `'mobile' | 'tablet' | 'desktop'`; `useReducedMotion()` →
`boolean`; `useAmbience()` → `{ audioRef, status, toggle, start, track }`;
`useLoadingSequence(longestLine, reducedMotion)` → `{ phase, elapsed, lineOpacity,
backdropOpacity }`.

Libraries: `src/lib/email.ts` — the footer's address obfuscation, kept out of the
component so what it does and does not protect against is written down once
(§13.5). `src/lib/scramble.ts` — the loader's two text passes, both pure functions of
elapsed time (§11.2). `src/lib/pan.ts` — the pan state, its easing, its inertia, the per-axis wrap
and the whole input driver (§5.1). It holds no React and no DOM beyond the element it is
handed, which is what makes the pan model testable on its own.

Data: `src/data/tiles.ts` (the three tables of §3.4), `src/data/photos.ts` (the 22-photo
pool with slug, alt text, orientation and credit), `src/data/audio.ts` (the track slot,
§10), `src/data/contact.ts` (the studio's real contact details and the footer's
link lists, §13.5), `src/data/copy.ts` (all page strings).

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

**D11 — The entrance animates only the cells on screen.** The repeat cells sit a full
band away at load, so animating them in is invisible work. GSAP reads each target's
computed style when it first touches it, and that read is what makes the entrance the
page's one expensive moment; skipping the off-screen cells is most of the saving.

**D12 — The canvas pans in two axes.** Figma draws one frame per breakpoint and the
annotations describe vertical scrolling. The canvas now pans and wraps on both axes and
reads as a map rather than a page. At a pan of `(0, 0)` the visible region is still
exactly the Figma frame, so both documented states are unchanged.

**D13 — Ambience player.** Figma contains no music widget; §10 is a deliberate addition,
built from the existing tokens and type styles and revealed with the bars so State 1 is
untouched.

**D15 — The two loader dots are kept as brand marks.** The canvas annotation asks
whether they are marks or wireframe placeholders. They are the only hues in the whole
design, one per label, deliberately paired and consistently placed (inside the left
label, outside the right). That reads as intent, not leftover, and stripping the one
moment of colour the designer drew is the more destructive default — so they ship, as
`--color-accent-practice` and `--color-accent-place`. If they were placeholders, deleting
two tokens and two spans removes them.

**D16 — The loader labels stay in Inter.** The annotation asks which family is intended.
Figma sets them in Inter while the rest of the site is Mate, and this build has followed
the frames over the annotations throughout (D1, for the hero subheading and tile
captions). Inter at 16px also matches the register of the Inter tile captions.

**D17 — The loader heading sits at the hero's coordinates, not the frame's.** Figma draws
it at `y = 486`; the hero heading on the home page is at `y = 481.8`. The annotation is
explicit that it should occupy "the same coordinates the hero heading occupies on the home
page, so the loader resolves straight into the landing state with no jump". The intent
wins over the 4.2px: the loader renders the hero's exact structure — same centred column,
same gap, an invisible subheading placeholder holding the same space — so the two
headings are pixel-identical. This is verified in §9.

**D18 — A minimum hold.** The annotation gives a floor of "about 1.2s — long enough for
the decode to finish". The longest line is 33 characters, which at 30 c/s takes exactly
1.2s, so on a fast connection the floor is entirely consumed and the line begins deleting
on the frame its last character resolves. `--loader-hold-min` (0.45s) keeps a beat of
stillness, which is what the reference's 2.5s hold is for.

**D14 — Tile links point outside this page.** Each photograph links to
`/portfolio/{couple-slug}` and the CTA to `/contact`. Those routes are not part of this
build; the hrefs are real so the markup, tab order and hover targets are honest, but
following one leaves the home page.

---

## 9. Measured against Figma

Every figure below came from `getBoundingClientRect` on the running page with the motion
layer frozen (`transform: none`), compared against the Figma frame coordinates in §3.4
and §3.7–3.9.

**Tiles — exact, and unchanged by the move to two axes.** All 22 desktop, 17 tablet and
13 mobile tiles match Figma to under `0.5px` in x, y, width and height at a pan of
`(0, 0)`, including the `5px`/`10px` caption gaps and the `15px` caption slot.

**Chrome — the residue.** The same set as before; nothing new.

| Element | Breakpoint | Δ | Why |
| --- | --- | --- | --- |
| navbar height | tablet | `+1px` | D5 — Figma's frame is `47px`, its children sum to `48px` |
| wordmark | all | `−0.4px` wide | Mate renders marginally narrower in Chrome than in Figma |
| nav link group | desktop | `−0.9px` x | knock-on from the wordmark width, via `justify-between` |
| CTA pill | desktop, tablet | `−1.3px` x, `+1.3px` wide, `+0.2px` tall | "Chat with Dinuka" sets 1.3px wider in Chrome |
| bottom-bar blurb box | tablet | `−6px` y, `+12px` tall | Figma's wrapper is `64px` around `60px` of text; ours is `76px` around the same `60px`. The rendered text lands on the identical baseline — only the invisible wrapper differs |
| navbar wordmark / hamburger | mobile | `−4px` y | D6 — both are vertically centred in the `40px` bar rather than sitting at Figma's `8px`/`12px` |
| hero block | all | `≤0.8px` on any edge | Mate and Inter metrics |

The music player (§10) has no Figma counterpart. It measures `181 × 32` and sits at
`(64, 900)` on desktop, `(24, 1058)` on tablet and `(16, 633)` on mobile — asserted
against the navbar, bottom bar, hamburger and floating CTA at every breakpoint, with no
intersection.

**Pan behaviour, at 1440 / 834 / 390.**

| Check | Result |
| --- | --- |
| wheel / trackpad, diagonal | both axes move together, no axis locking |
| mouse drag, diagonal | target tracks the cursor `1 : 1` — a 216 × 144 px drag moves the pan exactly 216 × 144 |
| inertia on release | a flick adds ~230 × 153 px beyond the drag and eases to rest; `0` under reduced motion |
| cursor | `grab` at rest, `grabbing` while held, back to `grab` on release |
| touch, one finger | both axes, same inertia |
| keyboard | `←`/`→` ± 80, `↑`/`↓` ± 80, `PageUp`/`PageDown` ± 90 % of viewport height, `Home` → `(0, 0)` |
| chrome reveal on a purely horizontal first drag | fires at all three breakpoints, with `panY` still `0` |
| click vs drag | 0 / 4 / 5 px presses activate the tile's link; 12 / 40 px presses pan and fire no click |

**Seamless wrap.** The pan was walked through seven diagonal wrap boundaries per
breakpoint in 4px steps — 147 positions — and at each one a 25 × 25 grid of viewport
points was tested for coverage by some lattice cell. **Zero gaps** across roughly 88,000
probes, at all three breakpoints. A separate 220-step diagonal wheel sweep also found
zero gaps.

**Player.** Paused at load with volume `0`, `preload="auto"`, `loop`, `readyState 4`;
plays on the first pan and fades `0 → 0.06 → 0.18`; `currentTime` advances; pause fades
`0.18 → 0.12 → 0` and then stops, with `currentTime` frozen — a real pause, not a mute.
`localStorage` records `playing`/`paused`, and a persisted `paused` survives a reload:
the next first pan does **not** start it. With `play()` stubbed to reject, the widget
stays paused, the equalizer stays still and the live region reads "could not start
automatically". The toggle is reachable by `Tab` and operable by `Enter`.

**Regression fence.** Tile hover still scales the image to `1.03` and lifts the caption
to full opacity; the tab order is 22 tile links plus the chrome and the one new player
toggle (31 in total, skip link first); the mobile sheet still opens, traps focus, closes
on `Esc` and returns focus; and keyboard panning is suppressed while it is open.

**Performance** (production build, Chrome).

| | Result |
| --- | --- |
| CLS, 22s of hard diagonal panning across ~41,000 × ~70,000 px | `0.00` |
| long tasks during panning | none |
| forced reflow / layout thrash during panning | none reported |
| console at load, and after panning and playback | clean |
| network | 32 requests, all `200`, including `audio/ambience.m4a` |

Frame pacing could not be measured meaningfully in this environment: **a blank page in
the same browser also runs at a 33.3 ms median**, so the host is presenting at 30 Hz and
every reading is pinned to that cadence. What the numbers do establish is headroom — at
**6× CPU throttling** the median moves only from 33.3 ms to 33.5 ms and no long task
appears, which it could not do if the pan loop were anywhere near the frame budget. The
loop writes two transforms per cell and two per tile, and skips the per-tile maths
entirely for cells more than `--cull-margin` outside the viewport, so at rest it updates
one cell of 22 tiles rather than all four cells of 88.

---

## 10. Ambience player

Not in Figma. Built from the tokens in §1 and the type styles in §2 so it reads as part
of the same set.

### 10.1 Why it does not autoplay

Chrome, Safari and Firefox all reject audible playback that is not tied to a user
gesture, so no attempt is made on load and there is no workaround. Instead:

1. On load the `<audio>` element renders with `preload="auto"` and `loop`, volume `0`,
   and the widget shows its **paused** state with a play control.
2. The visitor's **first pan** — the same gesture that reveals the chrome (§4) — calls
   `play()`.
3. If `play()` rejects, or the element errors, the status becomes `blocked`: the widget
   stays paused and says so in its live region. It never shows a playing state with no
   sound.
4. The choice is persisted in `localStorage` under `vows:ambience`. If the visitor
   paused it, the first pan on their next visit does **not** start it. A `blocked`
   result writes nothing, so a manual play still works and still persists.

Volume fades over `--audio-fade` in both directions and settles at `--audio-volume`
(`0.18`) — ambience under photographs, not a foreground track. Pause fades to zero and
then calls `audio.pause()`, so playback genuinely stops rather than being muted.

### 10.2 The track slot

| | |
| --- | --- |
| File | `public/audio/ambience.m4a` — AAC-LC, 64 kbps, mono, 1.36 MB |
| Track | *Night on the Docks* — Kevin MacLeod |
| Source | <https://incompetech.com/music/royalty-free/> |
| Licence | **CC BY 4.0** — attribution is required, and is carried in `public/audio/CREDITS.md` |
| Manifest | `scripts/audio.manifest.json` |
| Rebuild | `node scripts/prepare-audio.mjs --force` |

This is a **placeholder**, chosen to be slow, warm and saxophone-led. It is deliberately
not a cover of a copyrighted composition: "A Thousand Years", "All of Me" and
"Hallelujah" all need clearance of the underlying work, and a cover does not avoid that.

**To swap it** for the studio's licensed recording, edit the manifest — `source` (a URL
or a local path), `title`, `artist`, `licence`, `attribution` — and run the script. It
downloads, re-encodes, rewrites `public/audio/CREDITS.md` and regenerates
`src/data/audio.ts`. No component, style or string names the track, so nothing under
`src/components/` changes.

### 10.3 Widget

Play/pause toggle, a four-bar equalizer that animates only while playing, and the track
title. The toggle is a real `<button>` with `aria-pressed` and an `aria-label` that
flips between "Play background music" and "Pause background music"; the widget is a
`role="group"` labelled "Background music"; and a polite live region announces playing,
paused or blocked.

**Placement** — pinned to the bottom-left, clear of every other fixed element:

| Breakpoint | Inset from left | Offset from bottom | Clears |
| --- | --- | --- | --- |
| desktop | `--spacing-4xl` (64) | `--bar-bottom-h + 16` = 92 | bottom bar starts at 948; widget ends at 932 |
| tablet | `--spacing-2xl` (24) | `--bar-bottom-h + 16` = 104 | bottom bar starts at 1106 |
| mobile | `--spacing-lg` (16) | `--bar-bottom-h + 16 + --pill-h + 12` = 179 | sits one row **above** the floating "Chat with Dinuka" pill, which occupies 136–167 |

It is chrome: `inert` and invisible until the first pan, then it fades in with the bars.
That keeps State 1 exactly as Figma draws it — canvas and title block, nothing else.

---

## 11. Loading screen

Figma frame `2023-1224`, with its behaviour in the canvas note `2025-764`. A
scrambled-text decode that hands straight over to the gallery.

### 11.1 Layout

White ground (`--color-surface`; the site behind it is `--color-canvas`), three elements
on one shared baseline:

| | Content | Type | Placement |
| --- | --- | --- | --- |
| centre | `Vows Weddings` | `--text-display`, Mate, `--color-ink` | the hero heading's exact position (D17) |
| left | orange dot, `--loader-gap`, `Wedding photography & videography` | `--text-meta`, Inter | `--loader-gutter` (20px) from the left |
| right | `Colombo, Sri Lanka`, `--loader-gap`, blue dot | `--text-meta`, Inter | `--loader-gutter` from the right |

The row is a `minmax(0,1fr) auto minmax(0,1fr)` grid with `align-items: baseline`, which
is what puts the three on one baseline, and the heading is pinned to `grid-column: 2` so
it is centred on the viewport rather than between its neighbours.

**Below 1200px** the two labels cannot flank the heading without pushing it off the
viewport's centre — and that centre is the whole point of the screen. They stack
underneath instead, absolutely positioned so the block above keeps the hero's geometry
exactly. The two arrangements are separate markup and only one is ever displayed; this is
the same trade the bottom bar makes in §3.8, and for the same reason.

### 11.2 Sequence

Every phase length is a token. The reference recording's 4.7s is a demo length, not a
target: the hold ends when the page's assets are actually ready.

| Phase | Length | What happens |
| --- | --- | --- |
| `idle` | — | server-rendered: opaque white, lines at zero opacity |
| `decode` | `--loader-appear` (0.1s) then `length / --loader-rate` (30 chars/s) | each string holds its final character count and resolves left to right; the unresolved tail cycles `! @ # $ % ^ & * + = ?`. Lines ramp from `--loader-rest-opacity` (0.35) to full over `--loader-fade-in` (0.25s), so a line fades up while it is still resolving |
| `hold` | until assets ready, at least `--loader-hold-min` (0.45s), and at least `--loader-floor` (1.2s) from the decode's start; `--loader-ceiling` (4s) ends it regardless | still, fully resolved |
| `erase` | `--loader-erase` (0.65s) | **not** a mirror of the entrance: the string is deleted from its tail backwards while the last `--loader-scramble-edge` (3) surviving characters scramble, so the line shortens as it goes and opacity falls with it |
| `blank` | `--loader-blank` (0.45s) | empty white screen |
| `handoff` | `--loader-handoff` (0.6s) | the white ground fades out and the site shows through |

"Assets ready" means the two self-hosted faces (`document.fonts.ready`) and every
`img[loading="eager"]` — the first viewport of tiles. Everything else is lazy and can
arrive behind the loader.

The site mounts and runs its own entrance underneath the loader, so by the time the
ground fades the hero is settled at the position the loader's heading just left. That is
what makes the hand-off read.

**Returning within the session** (`sessionStorage` `vows:loaded`) skips to the exit: no
decode, no hold, just the `handoff` fade. Measured at 3.5s for a first visit and 0.7s for
a return.

Both text passes are pure functions of elapsed time in `src/lib/scramble.ts`, so the
animation is a `render(t)` with no internal state to drift. Spaces are never replaced —
keeping the word gaps means the line's *width* barely moves while it resolves, which is
the point of holding the character count in a proportional face.

### 11.3 Accessibility

- Each line renders the finished string in the accessibility tree from the first frame,
  with the animating characters in a sibling marked `aria-hidden`. A screen reader never
  meets the symbol soup.
- The overlay is `role="status"` with `aria-busy`, labelled "Loading Vows Weddings".
- Under `prefers-reduced-motion` the decode and the erase are both skipped: the finished
  lines simply cross-fade in and out.

### 11.4 SSR

The loader is server-rendered — opaque ground, lines at zero opacity — so there is no
window in which the site is visible before the loader covers it. Nothing in its render
path may call `readMotion()`, which reads computed styles; doing so throws on the server
and drops the whole route to client rendering. All opacity is computed in the hook, on
the client, and passed down as plain numbers.

---

## 12. Album page

Figma section `2030-1964`, with its behaviour in the three canvas notes
`2030-1966` (page), `2030-1968` (hero) and `2030-1970` (gallery).

Where the home page is a non-linear field explored in any direction, the album
is the opposite: one fixed route, top to bottom, with the pace set by the layout
rather than by the visitor. Two parts, no divider between them — a full-viewport
hero, then a long gallery on `--color-canvas`. The change of ground is what
marks the transition.

### 12.1 Route

`/albums/$slug`, resolved in the route loader so a deep link to a missing album
404s rather than flashing an empty page. `slug` matches the home page's
`tileSlug`, so a tile links straight to its own event.

The home page's `<a>` tiles became router `<Link>`s: opening an album is now a
client-side navigation, which is what lets the canvas still be mounted when the
visitor comes back.

**Scroll ownership.** The home page is a fixed full-screen canvas that owns its
own panning and therefore locks the document; the album is an ordinary scrolling
document. `overflow: hidden` moved off the global `html, body` rule onto
`html[data-lock-scroll]`, set during render in `__root.tsx` from the current
path — not in an effect, so there is no frame in which the wrong one applies.

### 12.2 Album content

One typed record per event in `src/data/albums.ts`: slug, couple, ISO date,
time-of-day label, type, location, story, hero focal points, and an ordered list
of photograph ids. Nothing about placement lives there.

The featured album (Benali & Yasiru) is authored in full. The other 21 events on
the home page canvas carry their own metadata and draw rotated slices of the
shared photograph pool at lengths from 11 to 18 — which is what demonstrates the
layout is data-driven rather than a transcription of one frame.

### 12.3 Hero

`100vw × 100svh` — `svh`, not `vh`, or a phone's dynamic browser chrome crops
the bar off the first screen. The navbar sits over the photograph in the same
semi-transparent treatment as the home page. The hero and its bar scroll away
normally; they do not pin, parallax or fade. Only the navbar stays.

`object-position` differs by aspect (`heroFocus.wide` / `heroFocus.portrait`),
because a 3:2 source cropped blindly into a tall phone viewport loses the
subject.

**The bar — four zones.**

| Zone | Type | Desktop | Tablet | Mobile |
| --- | --- | --- | --- | --- |
| couple | `--text-couple` (Mate 28) | left gutter | left gutter | row 1 |
| story | `--text-bar` (Mate 16), `--bar-blurb-w` wide | centre | centre | **dropped** |
| `(type)` / `(location)` | `--text-album-meta` (Mate 14), label italic lowercase | right of centre | right of centre | row 2 left |
| time / date | `--text-bar` | right gutter | right gutter | row 2 right |

| | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| `--album-bar-h` | `88px` | `112px` | `168px` |
| `--album-gutter` | `64px` | `24px` | `16px` |

Four zones across one row does not survive 390px, so the bar stacks and **grows**
rather than shrinking the type below the home page's minimum. The story is
dropped there rather than truncated — a two-word remnant of an editorial note
reads worse than its absence. The parenthetical-italic label pattern is kept
intact at every breakpoint.

### 12.4 Gallery — the arrangement sequence

The Figma frame places 18 photographs down a 1440 column. Real albums vary in
length, so that placement is expressed in `src/data/album-layout.ts` as a
repeating sequence of arrangements: the walk feeds each arrangement as many
photographs as it holds, and cycles until the album runs out. An arrangement
that holds more than remain is skipped, so a short album never renders a
half-empty triple.

**Size families**, and how they drop with the breakpoint. Density falls —
tablet runs at ~0.81 of desktop and mobile at ~0.63 — so photographs stay large
enough to read rather than becoming thumbnails.

| Family | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| `portraitLg` | `410 × 600` | `330 × 483` | `260 × 380` |
| `portraitMd` | `325 × 500` | `262 × 403` | `210 × 323` |
| `accentSm` | `230 × 230` | `186 × 186` | `140 × 140` |
| `accentMd` | `250 × 380` | `202 × 307` | `150 × 228` |
| `tallLg` | `475 × 750` | `384 × 606` | `290 × 458` |
| `squareLg` | `750 × 750` | `500 × 500` | `300 × 300` |
| `fullBleed` | `1440 × 1135` | viewport | viewport |

**The sequence.** Desktop `x` and `gap` are transcribed from Figma exactly;
`gap` is the distance from the previous arrangement's bottom.

| # | Arrangement | Desktop gap | Desktop placement | Tablet | Mobile |
| --- | --- | --- | --- | --- | --- |
| 1 | `pair` | 479 | `portraitLg` at 300, 730 | row of 2 | single, left |
| 2 | `accentRight` | 486 | `accentSm` at 1134 | right, inset 46 | right, inset 24 |
| 3 | `singleRight` | 1048 | `portraitLg` at 925 | right | right |
| 4 | `triple` | 320 | `portraitMd` at 212, 557, 902 | **row of 2** | single, left inset 28 |
| 5 | `singleLeftLarge` | 220 | `tallLg` at 106 | left | left |
| 6 | `offsetDuo` | 272 | `accentMd` at 40, `squareLg` at 648 (+77) | `accentMd` left, `squareLg` right (+62) | `squareLg` right |
| 7 | `accentLeft` | 352 | `accentSm` at 215 | left, inset 62 | left, inset 36 |
| 8 | `singleRightMd` | 350 | `portraitMd` at 985 | right, inset 30 | right, inset 18 |
| 9 | `singleLeftMd` | 158 | `portraitMd` at 192 | left, inset 24 | left, inset 12 |
| 10 | `pairMd` | 255 | `portraitMd` at 660, 1005 | row of 2 | single, right |
| 11 | `fullBleed` | 698 | `1440 × 1135` at 0 | edge to edge | edge to edge |
| 12 | `pairEnd` | 1119 | `portraitLg` at 191, 621 | row of 2 | single, left inset 20 |

### 12.5 Responsive rules

**Figma has no tablet or mobile album frames.** These rules are designed here,
against the home page's existing 834 and 390 for gutters, type scale and
density.

| | Tablet (834) | Mobile (390) |
| --- | --- | --- |
| gutter | `24px` | `16px` |
| gap between photographs in a row | `20px` | `12px` |
| vertical gap | desktop gap × `0.62`, clamped `48…520` | desktop gap × `0.34`, clamped `32…280` |

The governing principle is the home page's: **density drops rather than
everything shrinking.** The triple becomes a pair at 834 and a single at 390; the
small accents stay accents at both. Because arrangements hold fewer photographs
as the breakpoint falls, the sequence simply cycles more times — every
photograph still appears, and no arrangement is compressed to fit.

At 390 nearly everything is a single column, but alignment alternates and widths
vary by family, so the page still reads as an editorial scatter rather than a
uniform feed. The vertical rhythm stays uneven — scaling the desktop gaps by a
constant preserves their unevenness, and a spec asserts that more than three
distinct gap values survive at every breakpoint.

**The full-bleed image keeps its full-bleed moment at every size**, because that
reset is the strongest beat in the sequence.

Between 1200 and 1440 the Figma column is wider than the viewport. Rather than
re-placing every photograph, the whole column scales by `viewportWidth / 1440`,
which keeps the transcribed proportions exactly and lands the full-bleed slot on
the viewport edges for free. At and above 1440 it is 1 : 1, and the full-bleed
slot alone breaks out of the column to the viewport width.

### 12.6 Images

One shared pool, four buckets, generated by `node scripts/prepare-albums.mjs`
from `scripts/albums/photos.manifest.json`:

| Bucket | Aspect | Widths |
| --- | --- | --- |
| `portrait` | 2 : 3 | 320, 480, 720, 960 |
| `square` | 1 : 1 | 300, 480, 760, 1120 |
| `wide` | 1440 : 1135 | 640, 1040, 1600, 2160 |
| `hero` | 3 : 2 | 800, 1280, 1920, 2560 |

Each is emitted as AVIF and WebP at every width, and `sizes` is the slot's exact
rendered width, so the widths follow the breakpoint's geometry and a phone never
downloads a 1440-wide file. Below the fold is `loading="lazy"`; the hero and the
first screen of photographs are eager.

**Placeholders are not optional here.** With scroll reveal and idle float
running, an unplaceholdered image pops in mid-animation and the effect reads as
broken. Every photograph carries a 20px-wide WebP LQIP inlined as a data URI on
its own background, so it costs no request. Every slot also carries its exact
width and height, so the box is reserved before the image arrives.

The srcset comes from the **photograph's own bucket**, not the slot's family —
albums rotate through a shared pool, so a square photograph can land in a
portrait slot, and asking for the slot's width set would request derivatives
that were never generated. `object-fit: cover` reconciles the two aspects.

### 12.7 Motion

**Page entry.** The hero fades up over `--album-hero-enter` and the metadata bar
arrives `--album-bar-delay` later. This is the documented fallback rather than a
shared-element transition, for a specific reason: the home page tile and the
album hero are *different photographs* — the tile shows that couple's image from
the home page pool, the hero shows the album's own — so expanding one into the
other would visibly swap the picture mid-morph. A shared-element transition is
the right idea only once a tile and its album hero are the same file.

**Two separate systems**, which is the thing the Figma note is most explicit
about:

| | Driven by | What it does | Reduced motion |
| --- | --- | --- | --- |
| scroll reveal | `IntersectionObserver` on each photograph | one shot on entry: `opacity 0→1`, `y +28→0`, `--album-reveal-dur`, staggered `--album-reveal-stagger` within a batch | opacity only, no travel |
| idle float | `gsap.ticker` | continuous drift on each photograph's own phase and period (`--album-float-period` ± `--album-float-jitter`), amplitude `--album-float-amp` (7px) desktop, `--album-float-amp-compact` (4px) at 834 and 390 | **off** |

Both run on touch devices; the float's amplitude drops on small screens where
the travel is proportionally more visible. Nothing here is pointer-only.

The reveal fires **once** and then releases the element — re-revealing on the way
back up would fight the float. The two never contend for `transform`: the float
writes the outer element, the reveal tweens the inner one, and the image fades
over its placeholder on a third.

A full-bleed photograph floats **vertically only**. It is exactly as wide as the
viewport, so any sideways drift would expose the ground at one edge and give the
page a horizontal scrollbar.

### 12.8 Leaving and returning

The canvas position is parked in `sessionStorage` under `vows:pan` when
`GalleryCanvas` unmounts and restored before its first tick, so browser back
returns the visitor to the part of the field they were looking at rather than to
the origin. A fresh session still starts at `(0, 0)`, because nothing is written
until the canvas is left.

### 12.9 Tests

`tests/` holds four spec files, run at all three breakpoints by
`npm run test:e2e`. Three cover the album page; `footer.spec.ts` is described in
§13.7:

- `album-layout.spec.ts` — hero fills the viewport, the bar's zones and heights,
  every photograph renders, a shorter album lays out on the same rules, nothing
  overlaps, the vertical rhythm stays uneven, every slot has a reserved box and
  a placeholder.
- `album-navigation.spec.ts` — a home tile opens its album, deep links work,
  an unknown slug does not crash, browser back restores the canvas position,
  and the page is reachable and scrollable by keyboard alone.
- `album-motion.spec.ts` — reveal fires once per photograph and never re-hides,
  the float drifts without scrolling and out of step, and reduced motion holds
  it still.

### 12.10 Decisions and divergences

**A1 — 18 photographs, not 21.** The gallery note says 21. The frame contains 21
`photo_holder` nodes, but three of them sit inside `2030-1929` roughly 16,000px
below their parent and are invisible on canvas; those are orphans and are not
built. That leaves **18**. Two of the 18 (`2030-1961`, `2030-1962`) sit 1,119px
below the frame's own bottom edge — read here as the frame not having been
resized rather than as two more orphans, because a closing pair after the
full-bleed is a coherent ending and they are nowhere near as far out as the
others.

**A2 — `(location)` and the story.** Figma's `(location)` repeats "Wedding",
duplicating `(type)`, and the story is lorem. Both are placeholders: the sample
data carries a real location and a short editorial note per album. Figma also
spells the label "(localtion)"; corrected.

**A3 — The story's length is chosen, not transcribed.** It is sized to set in
two lines in the bar's 632px zone, which is what keeps the bar at Figma's 88px.

**A4 — The navbar's revealed state now carries its own opacity.** On the home
page GSAP tweens the chrome in and its inline opacity wins; the album has no such
reveal, so `.vows-chrome[data-revealed="true"]` sets `opacity: 1` in CSS. The
home page is unaffected — its `data-revealed` only becomes true when the reveal
fires, and the inline value takes precedence while the tween runs.

**A5 — Tablet `offsetDuo` keeps both photographs.** Two 500px squares would not
fit an 834 viewport, so the compact spec places mixed families — the small frame
at one gutter, the large one dropped below it at the other — rather than
degrading to a plain row, which would have lost the arrangement's character.

---

## 13. Footer

Figma section `2043-769` — one frame per breakpoint (`2043-770` desktop 1440,
`2048-769` tablet 834, `2048-813` mobile 390) with the panel described in
`2046-770` and the measurements in `2046-771` and `2046-772`.

The site had no conventional footer: the home page ends in a bottom bar and the
album page simply ran out of photographs. This panel is the full stop. Four
column groups along the top — Menu, Socials, Email and Hotline stacked together,
Studio with a pinned location — then the name set as large as the gutters allow,
then a rail of legal links along the bottom edge. It is a contact card as much
as a nav list: a visitor who has scrolled this far wants a way to reach the
studio, so the address, the number and the email are given in full rather than
hidden behind a form.

White ground against the page's `--color-canvas`, a 24px radius on the top two
corners only and square along the bottom, so it reads as a card the page slides
underneath rather than another band of the same sheet.

### 13.1 Where it lives

The footer belongs to content pages, not to the home page.

It is a **layout concern, not an import**. `src/routes/_site.tsx` is a pathless
layout route that renders `<Outlet />` followed by `<SiteFooter />`; the album
page is `src/routes/_site.albums.$slug.tsx`, so its URL is unchanged at
`/albums/$slug` while the panel comes for free. About, Contact and Pricing will
be `_site.about.tsx` and so on, and will not re-solve this. `src/routes/index.tsx`
stays outside the layout, which is what keeps the home page footer-free.

The home page is an infinite 2D pan canvas with no bottom. There is nothing for
a footer to sit below, and a fixed one would fight the canvas. That exclusion is
the requirement most likely to be undone by a later change, so it is a test
(`tests/footer.spec.ts`) rather than a note.

On the album page the panel sits at the very bottom, after the gallery, in
normal flow: `position: static`, no sticky, no reveal, no float. The gallery's
scroll-reveal and idle-float are scoped to elements inside the gallery's own
root, so nothing in the footer is ever a target. The footer arrives still.

### 13.2 Grid

Every column position in the frames is a grid track rather than an offset, which
is what lets one piece of markup serve all three breakpoints and what corrects
the drift in the desktop frame. `--footer-cols` carries the tracks; the gutters
are the panel's own padding.

| | gutter | tracks | groups land at |
|---|---|---|---|
| mobile | 20 | `185px 1fr` | 20, 205 |
| tablet | 40 | `170px 180px 240px 1fr` | 40, 210, 390, 630 |
| desktop | 64 | `336px 336px 439px 1fr` | 64, 400, 736, 1175 |

Desktop and tablet run all four groups on one row: `menu socials contact studio`,
with Email and Hotline stacked 32px apart inside the contact column. Mobile
keeps Menu and Socials as two columns — collapsing nine short links into one
stack would make the panel far too tall — and re-flows the contact group into
two rows beneath them: Email on its own row because the address is the widest
element on the panel, then Hotline and Studio side by side. The same wrapper
serves both: it is `display: contents` on mobile, so Email and Hotline become
grid items in their own right, and a flex column from 768 up.

Vertical rhythm, top to bottom:

| | desktop | tablet | mobile |
|---|---|---|---|
| padding top | 48 | 48 | 40 |
| column groups | 208 | 208 | 208 + 40 + 62 + 32 + 62 |
| gap to wordmark | 112 | 104 | 56 |
| wordmark | 240 | 138 | 176 |
| gap to legal | 228 | 123 | 80 |
| legal rail | 19 | 19 | 19 + 13 + 19 |
| padding bottom | 45 | 41 | 40 |
| **panel** | **900** | **681** | **847** |

Links sit on a 36px pitch — a 24px line with a 12px gap — and labels 20px above
the first of them. Contact values sit on a 22px line, which is what makes a
label-plus-value block exactly 62px tall, as drawn.

The legal rail does not follow the column tracks at every breakpoint, so it has
its own `--footer-legal-cols`. Desktop does follow them (64, 400, 736) with the
last link flush right at 1376. Tablet's four x positions in the frame — 40, 326,
527, flush right at 794 — are hand-placed and fall on no grid; they are
reproduced exactly as three fixed tracks plus a remainder. Mobile splits the
rail into two rows: the three policy links across three equal columns, aligned
start / centre / end, with the copyright on its own line beneath.

### 13.3 The wordmark

"Vows Weddings" in Mate, pure black, centred across the full width between the
gutters. It is the largest type anywhere on the site and the only pure black on
this panel.

The size is **measured, not a ratio guessed from the string**. Mate's advance
width divided by font size is 6.557 for "Vows Weddings" and 4.192 for "Weddings"
alone — that line is the limiting one, because Mate's W, d and g are far wider
than its average, and a per-character estimate taken from the full string
overruns and wraps mid-word. Both numbers are tokens (`--wordmark-ratio`), set
per breakpoint because mobile breaks the name over two lines and therefore fits
"Weddings" rather than the whole string.

```
font-size: min(
  var(--wordmark-max),
  calc((100cqw - var(--wordmark-safety)) / var(--wordmark-ratio))
);
```

`cqw` and not `vw`: the panel is a size container, so the wordmark is sized from
the content box inside the gutters. `100vw` would include the scrollbar and
overrun on desktop. `--wordmark-safety` is 2px of slack so sub-pixel rounding
can never push the line past the gutter it was measured to fill.

That lands on 199.8px at 1440 and 80px at 390 — the drawn sizes — 114.7px at 834,
and 66.3px at 320, where "Weddings" still sets on one unbroken line. The name is
two spans with a space between them, so the only break available is between the
words.

### 13.4 Type and colour

| token | value | used for |
|---|---|---|
| `--text-footer-label` | 14 / 20, Inter Medium | column labels |
| `--text-footer-link` | 16 / 24, Mate | link columns |
| `--text-footer-value` | 16 / 22, Mate | email, phone, location |
| `--text-legal` | 14 / 19, Mate | legal rail |
| `--color-label` | `#0b72d9` | column labels |
| `--color-pin` | `#71c288` | the location pin |

The labels are the one deliberate break from the rest of the site: Inter Medium
in blue, where everything else on the panel — links, values, wordmark, legal —
is Mate. They are signage, not content, and the switch in both typeface and
colour is what stops them being read as links.

White as a surface distinct from the page already existed as `--color-surface`
and is reused. `--color-pin` is new. `--color-label` is new and is **not** the
blue that was drawn; see F4.

### 13.5 Contact details

`src/data/contact.ts` holds the email, phone number, studio location and the
three link lists as content. Nothing is hardcoded in the component: changing a
number or adding a social does not touch JSX. The email renders as `mailto:`,
the phone as `tel:` and Studio as a map link.

**The address is obfuscated in the markup.** It is stored split, written
backwards into the DOM and turned round again with `unicode-bidi: bidi-override;
direction: rtl`, so a regex over the page source finds `moc.liamg@avlisdakunid`,
which matches no address pattern. The `mailto:` href and the accessible name are
attached on the client after hydration, because an address in an attribute is
the easiest thing of all to scrape. A test asserts that the served HTML contains
no address-shaped string and no `mailto:`.

What that is honest about: it defeats scrapers that read HTML, not ones that run
a browser, and it costs something. Until hydration the email is not a link — not
focusable, not clickable — and with JavaScript off it never becomes one. The
visible text is always the address, so it can still be read and copied; the
trade is deliberate and applies to the email alone. The phone and map links are
ordinary anchors that work without JavaScript.

### 13.6 Accessibility and states

**Labels are headings, not links.** Each is an `<h2>` naming the list beneath
it, and the links are `<li>`s in a labelled `<ul>`, so a screen reader announces
"Menu, list, 4 items" rather than nine loose links. They are not focusable, not
hoverable and carry no link styling.

**The pin is decorative.** `aria-hidden`, `focusable="false"`; the word
"Wadduwa" beside it carries the meaning.

**Contrast.** Measured in the browser rather than taken on trust: the drawn
`#1389FF` gives **3.471:1** on white, and 14px text needs 4.5:1, so it fails as
drawn. The token was darkened to `#0b72d9`, which measures **4.748:1**, rather
than inflating the labels to reach the large-text threshold — 14px is what makes
them read as signage, and raising them to 24px would have made them compete with
the links they caption. The loading screen's right-hand marker keeps the
original `#1389FF` in `--color-accent-place`: it is a 10px dot, not text, and
carries no contrast requirement. Everything else on the panel measures 7.97:1
(`--color-ink-muted`) or 21:1 (pure black).

**Hover** is not drawn. Links take the site's existing link hover — opacity to
`--hover-link-opacity` over `--duration-fast` on `--ease-hover` — which is what
the navbar, the mobile menu and the player toggle already do. Focus uses the
global `:focus-visible` ring; on white it is the same ring as everywhere else.

### 13.7 Tests

`tests/footer.spec.ts`, run at all three breakpoints:

- **Placement** — present exactly once on the album page, after `<main>` and not
  positioned; **absent on the home page**, including after panning the canvas to
  its bottom; present on a second route under the same layout, which is what
  proves the layout owns it rather than the album page.
- **Structure** — five labels that are headings and not focusable, lists of the
  right length with the right accessible names, fifteen links that all point
  somewhere with `target`/`rel` on the external ones, mail / phone / map present,
  the address absent from the served HTML but attached after hydration, the pin
  hidden from assistive technology, every link focusable and no focus trap.
- **Layout** — panel height and every group's x and y against the frames, all
  four groups sharing one top, radius rounded on top and square beneath, the
  wordmark fitting its gutters unbroken at 320, 390, 834 and 1440, and the panel
  holding still while the gallery above it keeps moving.

### 13.8 Decisions and divergences

**F1 — It does not render on the home page.** The Figma note `2046-770` says the
panel "sits below the home page canvas and below the album gallery, identically
on every route". It is not built that way, on instruction and for the reason
given in §13.1: the home canvas is infinite and has no bottom. Where the note
and the instruction conflict, the instruction wins; recorded here so the frame
is not read as the contract on this point.

**F2 — The column tops are aligned.** In the desktop frame Studio starts at
y = 26, the Email group at y = 38, and Menu and Socials at y = 48. Tablet and
mobile align all four. Built with one shared top of 48 at every breakpoint,
which is what the grid gives for free.

**F3 — The contact column sits at x = 736, not 726.** The frame puts the Email
group at 726 while the legal link directly beneath it sits at 736 — a 10px drift
in what should be one shared column. 736 wins.

**F4 — The label blue is darkened.** `#1389FF` as drawn measures 3.471:1 on
white and fails AA for 14px text. The token ships as `#0b72d9` (4.748:1). Full
reasoning in §13.6.

**F5 — Inter is reused, not introduced.** The note calls the labels the first
second typeface in the product UI and asks for a new Medium file, subset and
scoped. Inter was already loaded: a variable face at weights 400–500, already
subset to latin and latin-ext, already preloaded, and already used at 500 in the
home page's tile captions and the ambience player. Shipping a second static file
would have added a duplicate. The labels use the existing face at 500 through
`font-sans`, and nothing else on the panel picks it up. Likewise, white as a
distinct surface already existed as `--color-surface`; only the label blue and
the pin green were genuinely new.

**F6 — Tablet is 681px tall, not 680.** The wordmark is sized to fill the
gutters, which at 834 gives 114.7px against the 114px drawn, and a line box one
pixel taller. Matching 680 exactly would mean pinning the tablet wordmark to a
fixed size and leaving 7px of slack inside the gutters, which contradicts how
the wordmark is specified. Desktop (900) and mobile (847) match their frames
exactly.

**F7 — The tablet legal rail is reproduced, not rationalised.** Its four x
positions fall on no grid and do not line up with the columns above them, unlike
desktop's. They are built as drawn via `--footer-legal-cols`; if that rail is
ever redrawn, that token is the one place to change.

**F8 — The footer's internal links are plain anchors.** Most of their
destinations — `/about`, `/contact`, `/portfolio`, `/cookies`, `/privacy`,
`/rates.pdf` — are not routes yet and currently 404, exactly as the navbar's
links do. A router `<Link>` to a path with no route throws during render rather
than degrading, so the footer uses `<a href>` for the same reason the navbar
does. They become client-side navigations for free when those routes are added.

**F9 — The social URLs are placeholders.** The email, phone number and location
are real. The five social links point at plausible `vowsweddings` handles that
have not been verified, and the WhatsApp link is built from the real number.
They are in `src/data/contact.ts` for exactly this reason: they need one pass
with the studio before launch.

**F10 — Two pre-existing console warnings.** Chrome reports both preloaded fonts
as "preloaded but not used" on the album page. The same two warnings appear on
the footer-free home page, so they predate this work: in dev the server
revalidates `/fonts/*.woff2`, so the preloaded copy is not reused. Nothing in
the footer causes them and nothing here fixes them. CLS on the album page is
0.00 and the panel contributes no layout shift.
