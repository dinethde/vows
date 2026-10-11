# Built from the repository root:
#   fly deploy -c infra/fly.worker.toml --dockerfile apps/worker/Dockerfile
# sharp needs the glibc-compat layer on alpine; vips comes from the npm binary.

FROM node:22-alpine AS base
RUN corepack enable && apk add --no-cache libc6-compat vips-dev
WORKDIR /repo

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/worker/package.json apps/worker/
COPY packages/db/package.json packages/db/
COPY packages/contracts/package.json packages/contracts/
COPY packages/mail/package.json packages/mail/
COPY packages/config/package.json packages/config/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @vows/worker... build
RUN pnpm deploy --filter @vows/worker --prod /out

FROM node:22-alpine AS runtime
RUN apk add --no-cache libc6-compat vips
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /repo/apps/worker/dist ./dist
COPY --from=build /repo/apps/worker/package.json ./package.json
USER node
# No ports. The worker pulls from pg-boss; nothing calls it.
CMD ["node", "dist/main.js"]
