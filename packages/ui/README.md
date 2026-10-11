# @vows/ui

The components both surfaces share. The Site and the Studio are the same
components in two token modes, not two component libraries.

```
src/primitives/   shadcn components, after they have been rewired to our tokens
src/patterns/     our own compositions: photo-slot, album-card, empty-state,
                  confirmation-modal, error-page
src/lib/          cn(), and the handful of hooks a component needs
```

**Adding a shadcn component**

`pnpm dlx shadcn@latest add dialog` drops it into `src/primitives/`. Then do the
part that matters: replace every hard-coded colour, radius and spacing value
with a token from `@vows/tokens`. A primitive that still carries
`bg-neutral-900` has not been added, it has been pasted.

**The rule that keeps this package honest:** a component lives here only when
both the Site and the Studio use it. One consumer means it belongs in that app's
own `components/` folder. Chapter 20.

Figma is the source of truth. A component here must match its Figma component
set variant for variant — if they disagree, the Figma file is right.
