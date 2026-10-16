# build.ts

Reads the two Figma variable collections — `vows/primitives` and
`vows/semantic` — and writes:

- `css/primitives.css` — every primitive as a custom property on `:root`
- `css/semantic.css` — every semantic token, twice: `:root` for the Site mode
  and `[data-surface='studio']` for the Studio mode
- `src/index.ts` — the same values as a typed object, for anywhere CSS cannot
  reach

Both generated CSS files start with a "generated — do not edit" banner, and the
`guard-generated` hook in `.claude/hooks` refuses edits to them.

The Figma file is the source of truth. If a token is wrong, fix it in Figma and
run this again — chapter 02.
