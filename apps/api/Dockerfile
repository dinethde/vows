# Built from the repository root:
#   fly deploy -c infra/fly.api.toml --dockerfile apps/api/Dockerfile
# The root is the build context because pnpm needs the workspace lockfile.

FROM node:22-alpine AS base
RUN corepack enable && apk add --no-cache libc6-compat
WORKDIR /repo

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
COPY packages/contracts/package.json packages/contracts/
COPY packages/mail/package.json packages/mail/
COPY packages/config/package.json packages/config/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @vows/api... build
RUN pnpm deploy --filter @vows/api --prod /out

FROM node:22-alpine AS runtime
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/apps/api/package.json ./package.json
USER node
EXPOSE 8080
# Fly health-checks /health — see infra/fly.api.toml.
CMD ["node", "dist/main.js"]
