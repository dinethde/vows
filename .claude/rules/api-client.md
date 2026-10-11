---
paths: ["apps/web/**"]
---
Every call to the Vows API goes through `apps/web/src/lib/api`. Nothing else
calls `fetch` against it. TanStack Query calls that client too — it is a cache,
not a transport, and it is mounted in the Studio layout only.
