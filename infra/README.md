# infra

Configuration for the things that run outside the repository. No secrets live
here — only the shape of the deployment.

| File                      | What it configures                          | Applied with                                                                                    |
| ------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `fly.api.staging.toml`    | the staging API on Fly (512 MB, stops idle) | `fly deploy -c infra/fly.api.staging.toml --dockerfile apps/api/Dockerfile --remote-only`       |
| `fly.worker.staging.toml` | the staging worker on Fly (1 GB)            | `fly deploy -c infra/fly.worker.staging.toml --dockerfile apps/worker/Dockerfile --remote-only` |
| `fly.api.toml`            | the production API                          | the production workflow, started by a person                                                    |
| `fly.worker.toml`         | the production worker                       | the production workflow, started by a person                                                    |
| `fly-secrets-staging.sh`  | every staging secret on both Fly apps       | `infra/fly-secrets-staging.sh`, with the vault unlocked                                         |
| `r2-cors-dev.json`        | upload CORS on `vows-originals-dev`         | `npx wrangler r2 bucket cors set vows-originals-dev --file infra/r2-cors-dev.json`              |
| `r2-cors-staging.json`    | upload CORS on `vows-originals-staging`     | `npx wrangler r2 bucket cors set vows-originals-staging --file infra/r2-cors-staging.json`      |
| `r2-bucket-policy.json`   | upload CORS on the production originals     | as its comment says                                                                             |

Vercel is configured in its dashboard and in `apps/web/next.config.ts`, not
here. Staging is the Vercel project `vows-staging`, root `apps/web`, whose
production deployment is staging. Neon is configured in its dashboard; the branch names are in chapter 11.

**Secrets.** Bitwarden is the source of truth (chapter 19). Fly, Vercel and
GitHub are write-only copies. Push a value by reading it from the vault inline,
never by pasting it:

```sh
fly secrets set --stage -a vows-api-staging \
  DATABASE_URL="$(bw get item staging/app-secrets | python3 -c '…field DATABASE_URL…')"
```

`fly-secrets-staging.sh` does this for every staging value. The vault items
it reads: `staging/app-secrets` (made for staging: the rebuild secret, the IP
salt, both database URLs), `clerk/dev-secrets`, `r2/dev-secrets` and
`resend/dev-secrets`.
