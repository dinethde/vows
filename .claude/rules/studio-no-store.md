---
paths: ["apps/web/src/app/studio/**"]
---
Every authenticated fetch carries `cache: 'no-store'`. Without it Next can cache
an authenticated response and two signed-in people see each other's data. The
API client sets it automatically whenever a token is present — do not override.
