# infra

Configuration for the things that run outside the repository. No secrets live
here — only the shape of the deployment.

| File | What it configures | Applied with |
|---|---|---|
| `fly.api.toml` | the NestJS API on Fly | `fly deploy -c infra/fly.api.toml --dockerfile apps/api/Dockerfile` |
| `fly.worker.toml` | the pg-boss worker on Fly | `fly deploy -c infra/fly.worker.toml --dockerfile apps/worker/Dockerfile` |
| `r2-bucket-policy.json` | CORS on the uploads bucket | `npx wrangler r2 bucket cors put vows-photographs --file infra/r2-bucket-policy.json` |

Vercel is configured in its dashboard and in `apps/web/next.config.ts`, not
here. Neon is configured in its dashboard; the branch names are in chapter 11.

**Secrets.** Bitwarden is the source of truth (chapter 19). Fly, Vercel and
GitHub are write-only copies. Push a value by reading it from the vault inline,
never by pasting it:

```sh
fly secrets set DATABASE_URL="$(bw get password vows/neon/prod-url)" -a vows-api
```
