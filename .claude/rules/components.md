---
paths: ["apps/web/**", "packages/ui/**"]
---
Spacing is flexbox and `gap`, never margins between siblings. A component file
stays under 250 lines. Props use a named exported interface in a `.types.ts`
beside the component, never inline. Avoid `useEffect`; reach for it only for a
real subscription to something outside React. Import order: third-party, react,
aliases, relative.
