---
source: Figma — vows-high-fidelity design file
link: https://www.figma.com/design/XMGt6qNAT5LbwvmoPfflFo/vows-high-fidelity?node-id=0-1
reflects: the design file as of 11 October 2026
written: 2026-10-11
authority: reflection only. Figma is the source of truth.
---

# Vows — design rules

This file repeats what the Figma design file decided, so an agent working here
can follow it without opening Figma. If this file and the design file disagree,
**the design file is right** and this one needs rewriting.

**Figma file:** [vows-high-fidelity](https://www.figma.com/design/XMGt6qNAT5LbwvmoPfflFo/vows-high-fidelity?node-id=0-1)
— file key `XMGt6qNAT5LbwvmoPfflFo`, page `Design` (node `0:1`). The architecture is on the
`Architecture.md` page of the same file; see `architecture.md`.

## The two surfaces

|                | Site                                     | Studio                                                  |
| -------------- | ---------------------------------------- | ------------------------------------------------------- |
| Who            | Couples, planners, strangers             | The photographer                                        |
| Feel           | Quiet, photographic, almost no interface | Dense, fast, ordinary admin                             |
| Mode           | Figma semantic mode **Site**             | Figma semantic mode **Studio**                          |
| Type           | Mate (serif) for display and headings    | Mate for headings, Instrument Sans for everything small |
| Primary action | Black pill with a long arrow             | Orange `#ff6200` button                                 |

The mode is set once, by a data attribute on the Studio layout. A component
never reads the mode; it uses semantic tokens and the mode resolves them.

## Tokens

Colour, type and spacing are defined once in Figma and flow one way into code:

```
Figma variables  →  pnpm tokens:build  →  packages/tokens/css/primitives.css
   vows/primitives                        packages/tokens/css/semantic.css
   vows/semantic                          packages/tokens/src/index.ts
                                       ↳  packages/config/tailwind/vows.css
                                          maps them onto Tailwind's @theme
```

- A Figma variable `bg/surface` becomes `--vows-bg-surface` in CSS,
  `token.bgSurface` in TypeScript, and `bg-surface` in Tailwind once
  `packages/config/tailwind/vows.css` has mapped it into `@theme`. The first
  segment names the utility: `text/muted` is `text-muted`, `border/hairline` is
  `border-hairline`, `action/primary/bg` is `bg-action-primary`, and
  `space/7` is `gap-space-7`.
- `packages/tokens/tokens.json` is the committed copy of the Figma variables
  and styles that the build reads.
- Tailwind 4 is configured in CSS, not in a JS preset. There is no
  `tailwind.config.js` and no `tailwind.preset.js`.
- The two modes are the same tokens with different values: `semantic.css`
  declares the Site values on `:root` and the Studio values under
  `[data-surface='studio']`.
- **No hex, `rgb()` or `hsl()` appears anywhere outside the generated files.**
  An ESLint rule enforces it.
- Spacing and radius come from the token scale too. No raw pixel values for
  anything the scale covers.
- A new colour starts in Figma: a primitive if it is a new hue, a semantic alias
  in both modes. Never as a one-off in a component.
- CI runs `pnpm tokens:build` and fails if the result differs from what is
  committed, so an edited token file cannot be merged.

## Type styles

Site: `Display/Wordmark`, `Display/Hero L|M|S`, `Display/Error code`,
`Heading/1…6`, `Body/L|M|S|XS`, `Nav/Wordmark|Link|Legal`.
Studio: `Studio/Display|Heading|Subheading|Title|Stat|Body|Body S|Body L|Label|
Caption|Overline|Badge|Micro|Button|Avatar`.

Figma text styles become Tailwind utilities in `semantic.css`, so a breakpoint
variant can choose one. The names match: `Heading/1` is `type-heading-1`.

## Components

The Figma library is `packages/ui`. The Figma name is the contract:

| Figma                                           | React                                        | Notes                                                                                      |
| ----------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `button — primary / neutral / outline / danger` | `<Button variant="…">`                       | danger is only for destroying something                                                    |
| `field — site` / `field — studio`               | `<Field surface="site\|studio">`             |                                                                                            |
| `photo_slot`                                    | `<PhotoSlot state badge number>`             | five states: Empty, Uploading, Uploaded, Update, Error                                     |
| `confirmation_modal`                            | `<ConfirmationModal tone="primary\|danger">` | four real uses; copy is props in code. There is no delete-album variant — see decision 012 |
| `navbar`, `bottom_bar`, `album_page_bottom_bar` | `<Navbar>`, `<BottomBar variant>`            | breakpoint is CSS, not a prop                                                              |
| `player — nav`                                  | `<Player />`                                 | client component, lives above the router                                                   |
| `chip`, `status_pill`, `banner — studio`        | `<Chip>`, `<StatusPill>`, `<Banner>`         |                                                                                            |

When one side is renamed, the other is renamed in the same pull request.

## Layout rules

- Spacing is **flex and gap**. No margins between siblings, ever.
- Breakpoints: 1440 desktop, 834 tablet, 390 mobile. Those are the three widths
  designed; anything between them interpolates. The layout itself switches at
  640 and 1024, the two numbers the design notes give ("below 640", "below
  roughly 1024"), written as the `tablet:` and `desktop:` variants.
- The footer is fixed behind the page and revealed by scrolling past the end —
  on the contact page and the album page both.
- The public pages carry almost no JavaScript. A component becomes a client
  component only when a hook or an event handler forces it, and then it is as
  small as it can be.

## Screens that exist in Figma

Loading screen (desktop) · Home (2 states, 3 widths) · Music first-load gate
(3 widths) · Album page, hero and gallery (3 widths) · Contact page (3 widths)
and its form (7 states, plus the phone sheet) · Footer (3 states, 3 widths) ·
CMS dashboard and album editor (3 widths), the album details form (4 states)
and four confirmation scenarios · Error pages 404 / 500 / 403 (desktop and
mobile) · Privacy page (desktop and mobile) · Share cards (1200 × 630) ·
Design system board · Components documentation.

The `sketches` section and the section marked "Footer — OLD" are not
specifications.

## Accessibility is a gate, not a wish

- WCAG 2.2 AA is the floor.
- An album cannot be published with a photograph that has no description.
- Decorative things carry `aria-hidden`: the giant error numerals, the photo
  card on an error page, the sound mark.
- Focus is visible everywhere, and focus order follows reading order.
- `prefers-reduced-motion` removes the curtain, the blur transition and the
  waveform animation.

## The music gate

On the first load of the home page the photographs blur, a wash settles over
them and one line offers to turn the music on, with a quieter line to continue
without it. The audio element carries `preload="none"`, so a visitor who
declines downloads nothing. The choice is remembered in `sessionStorage` for the
visit. Full notes are in the Figma section **Music — first load**.
