Never edit generated files by hand: `packages/tokens/tokens.css`, `tokens.ts`,
`tailwind.preset.js`, `pnpm-lock.yaml`, and any migration that has already been
merged. CI rebuilds the tokens and fails if the result differs from what is
committed, so an edit there cannot merge — it can only waste an afternoon.
