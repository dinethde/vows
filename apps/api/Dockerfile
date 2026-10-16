# Built from the repository root, because pnpm needs the workspace lockfile:
#   fly deploy -c infra/fly.api.staging.toml --dockerfile apps/api/Dockerfile

FROM node:22-bookworm-slim AS build
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
# The API and every package it loads from dist: tokens, contracts, db, mail, server.
RUN pnpm turbo run build --filter=@vows/api...
RUN pnpm deploy --filter=@vows/api --prod /out

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/dist ./dist
COPY --from=build /out/package.json ./package.json
USER node
EXPOSE 8080
CMD ["node", "dist/main.js"]
