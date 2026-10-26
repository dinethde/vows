---
paths: ["apps/**", "packages/db/**"]
---

Only `apps/api` writes to the database. `apps/web` has no database driver and no
connection string. A job and the row it refers to are written in one
transaction, always.
