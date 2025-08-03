FROM node:22-alpine AS base
ARG APP_NAME=client

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
RUN pnpm turbo run build

FROM base AS runner
WORKDIR /app

ENV APP_NAME=$APP_NAME
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer --chown=nextjs:nodejs /app/apps/$APP_NAME/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/$APP_NAME/.next/static ./apps/$APP_NAME/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/$APP_NAME/public ./apps/$APP_NAME/public

CMD node apps/$APP_NAME/server.js
