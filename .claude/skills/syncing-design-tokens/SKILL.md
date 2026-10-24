---
name: syncing-design-tokens
description: How to pull design tokens out of Figma into packages/tokens and rebuild the generated files. Use when a colour, type style, spacing value or radius has changed in Figma.
---

# Syncing design tokens from Figma

Tokens flow one way: Figma → `tokens.json` → generated files. Nothing in this
chain is edited by hand, and CI fails if the committed output does not match a
fresh build.

## The steps

1. Export the variable collections from the Figma file: `vows/primitives` and
   `vows/semantic` (two modes, Site and Studio), and the text and effect
   styles. Leave out the `Docs/*` text styles; they belong to the boards.
2. Replace `packages/tokens/tokens.json` with the export. **Review the diff** —
   this is the moment a stray colour someone added in Figma becomes visible.
3. `pnpm tokens:build`
4. Check the three generated files changed as expected:
   `css/primitives.css`, `css/semantic.css`, `src/index.ts`. If a token was
   added or removed, map it in `packages/config/tailwind/vows.css` too — that
   file is written by hand and is what turns a token into a Tailwind class.
5. `pnpm typecheck` — a removed token becomes a type error at every use site,
   which is the point.
6. Commit `tokens.json` **and** the generated output together. They are reviewed
   as one change.

## The naming rule

`bg/surface-light` → `--vows-bg-surface-light` → `token.bgSurfaceLight` →
`bg-surface-light`. The transformation is mechanical and the generator is the
only thing allowed to perform it. A text style becomes a utility the same way:
`Heading/1` → `type-heading-1`. A token that needs a different name is
renamed in Figma and re-exported.

## When something looks wrong

- A colour renders black: the variable resolved to no value for that mode. Check
  both Site and Studio are set in Figma.
- CI says the build output differs: somebody edited a generated file. Rebuild
  and commit the result; do not reconcile by hand.
- A new hue appeared: it should have been added as a primitive first, then
  aliased in both modes. Fix it in Figma, not here.
