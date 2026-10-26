# @vows/ui

The components both surfaces share. The Site and the Studio are the same
components in two token modes, not two component libraries.

```
src/<name>/       one folder per Figma component: <name>.tsx, <name>.types.ts,
                  <name>.test.tsx and an index.ts that only re-exports
src/primitives/   shadcn components, after they have been rewired to our tokens
src/lib/          cn(), and the handful of helpers a component needs
src/styles.css    the one stylesheet an app imports from here
```

**Using it in an app**

The package is consumed as source. The app's stylesheet imports four files, in
this order:

```css
@import "@vows/config/tailwind/vows.css";
@import "@vows/tokens/css/primitives.css";
@import "@vows/tokens/css/semantic.css";
@import "@vows/ui/styles.css";
```

The last one tells Tailwind to read this package for class names and carries the
player's meter animation. Without it the components render unstyled.

`ConfirmationModal` is portalled to `body`. Tokens resolve from the nearest
`data-surface`, so either put `data-surface="studio"` on `body` in the Studio
layout or pass the modal a `container` inside it.

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
