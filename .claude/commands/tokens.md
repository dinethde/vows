---
description: Rebuild the design tokens after a Figma export and show what changed.
---

Load the `syncing-design-tokens` skill, then:

1. Show me the diff of `packages/tokens/tokens.json` and describe what changed in
   plain words — which colours, which type styles, which modes.
2. Run `pnpm tokens:build`.
3. Show the diff of the generated files and flag anything surprising: a token
   that disappeared, a new hue that was not aliased in both modes, a name that
   changed shape.
4. Run `pnpm typecheck` — a removed token should surface as an error at every
   use site.
