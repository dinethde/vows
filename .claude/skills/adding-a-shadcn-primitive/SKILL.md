---
name: adding-a-shadcn-primitive
description: How to bring a shadcn/ui primitive into packages/ui and bind it to the Vows tokens. Use when a component needs a dialog, dropdown, tooltip, popover or similar Radix-backed primitive that does not exist yet.
---

# Adding a shadcn primitive

shadcn is not a dependency. Its CLI copies source into the repository, and from
that moment the file is ours.

## The steps

1. Check `packages/ui/src/primitives/` first — it may already be there.
2. Generate it into the package, not the app:
   `pnpm --filter @vows/ui dlx shadcn@latest add dialog`
3. Move it to `packages/ui/src/primitives/<name>/` if the CLI put it elsewhere.
4. **Replace every generated class with a token class.** The CLI emits its own
   palette (`bg-background`, `text-muted-foreground`); ours come from
   `packages/tokens`. No hex survives this step.
5. Keep the Radix behaviour untouched. Focus management, keyboard handling and
   ARIA wiring are the reason the primitive is here at all.
6. Export it from `packages/ui/src/index.ts`.
7. If a Vows component is built on top, it lives beside it, not inside the
   primitive folder — `packages/ui/src/confirmation-modal/` uses
   `primitives/dialog`.

## What not to do

- Do not install `@radix-ui/*` directly and hand-roll the wrapper.
- Do not patch a Radix package.
- Do not add a primitive "for later". Add it when a component needs it.
