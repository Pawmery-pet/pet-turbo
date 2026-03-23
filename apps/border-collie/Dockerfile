FROM node:22-alpine AS base
ARG APP_NAME=border-collie

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN pnpm install -g turbo@^2
COPY . .

RUN turbo prune $APP_NAME --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=$APP_NAME

FROM base AS runner
WORKDIR /app

ENV APP_NAME=$APP_NAME
ENV NODE_ENV=production
ENV PORT=4111

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 mastra

# .mastra/output is self-contained (includes its own node_modules)
COPY --from=installer --chown=mastra:nodejs /app/apps/$APP_NAME/.mastra/output ./output

USER mastra

EXPOSE 4111

CMD ["node", "output/index.mjs"]
