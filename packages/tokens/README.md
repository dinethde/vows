# @vows/tokens

Generated from the Figma variable collections. Nothing in here is written by
hand.

`pnpm tokens:build` regenerates it. `@vows/config/tailwind/vows.css` maps these
custom properties onto Tailwind's `@theme`, which is how `bg-surface` comes to
exist.

Two modes, because the design file has two: **Site** (black primary, Mate +
Instrument Sans) and **Studio** (orange `#ff6200`). They are the same tokens
with different values, switched by `data-surface='studio'` on a wrapper — never
by importing a different stylesheet.
