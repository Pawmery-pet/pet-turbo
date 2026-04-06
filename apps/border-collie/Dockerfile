FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
ARG APP_NAME=border-collie
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN pnpm install -g turbo@^2
COPY . .

RUN turbo prune $APP_NAME --docker

FROM base AS installer
ARG APP_NAME=border-collie
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=$APP_NAME

FROM base AS runner
ARG APP_NAME=border-collie
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4111

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 mastra

# .mastra/output is self-contained (includes its own node_modules)
COPY --from=installer --chown=mastra:nodejs /app/apps/$APP_NAME/.mastra/output ./output

# @repo/pet-client is a workspace dependency not bundled by mastra build
COPY --from=installer --chown=mastra:nodejs /app/packages/pet-client/dist ./packages/pet-client/dist
COPY --from=installer --chown=mastra:nodejs /app/packages/pet-client/package.json ./packages/pet-client/package.json

USER mastra

EXPOSE 4111

# Run from /app/output so that relative paths (e.g. ./mastra.db) resolve
# to a directory owned by the mastra user
WORKDIR /app/output
CMD ["node", "index.mjs"]
