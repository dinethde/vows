# Built from the repository root, because pnpm needs the workspace lockfile:
#   fly deploy -c infra/fly.worker.staging.toml --dockerfile apps/worker/Dockerfile

FROM node:22-bookworm-slim AS build
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@vows/worker...
RUN pnpm deploy --filter=@vows/worker --prod /out

FROM node:22-bookworm-slim AS runtime
# db.backup runs pg_dump, and pg_dump must be at least as new as the server.
# Neon is on Postgres 18, which Debian does not ship, so it comes from the
# PostgreSQL project's own repository.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
  && install -d /usr/share/postgresql-common/pgdg \
  && curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc \
  && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends postgresql-client-18 \
  && apt-get purge -y curl gnupg && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/dist ./dist
COPY --from=build /out/package.json ./package.json
USER node
# No ports. The worker pulls jobs from the queue; nothing calls it.
CMD ["node", "dist/main.js"]
