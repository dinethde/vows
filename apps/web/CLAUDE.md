# apps/web

Next.js 15, App Router. Server Components by default.

- `"use client"` only when a hook or an event handler forces it, and as far down
  the tree as it will go.
- Every call to the API goes through `src/lib/api`. Nothing else calls `fetch`
  against it. TanStack Query calls that client too.
- TanStack Query is mounted in `app/studio/layout.tsx` and nowhere else. The
  public routes must not ship it.
- Every authenticated fetch carries `cache: 'no-store'` — the client does this
  automatically when a token is present.
- Components: shadcn primitives live in `packages/ui`; product components are
  built on top of them. Never rebuild a button.
- Spacing is flex and `gap`. No margins between siblings.
- 250 lines per component file.
- Import order: third-party → react → aliases → relative.
- Props use a named exported interface in a `.types.ts`, never inline.
- No raw colour values. Tokens only.

Error routes return real statuses: `not-found.tsx` (404), `error.tsx` (500, owns
`reset()`), `global-error.tsx` (500 in the root layout, renders its own `<html>`).

Full rules: `architecture.md` chapters 12, 14, 16, 17, 18 and 27.
