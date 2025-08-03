FROM --platform=linux/amd64 node:22-alpine AS base
ARG APP_NAME=pet

RUN apk add --no-cache musl openssl

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

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 express
USER express

ENV APP_NAME=$APP_NAME

COPY --from=installer --chown=express:nodejs /app/ ./

CMD node apps/$APP_NAME/dist/index.cjs
