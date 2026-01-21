FROM node:22-alpine AS base
ARG APP_NAME=golden-retriver

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
ENV NODE_ENV=development
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nestjs:nodejs /app/apps/$APP_NAME/node_modules ./apps/$APP_NAME/node_modules
COPY --from=installer --chown=nestjs:nodejs /app/package.json ./package.json

COPY --from=installer --chown=nestjs:nodejs /app/apps/$APP_NAME/dist ./apps/$APP_NAME/dist
COPY --from=installer --chown=nestjs:nodejs /app/apps/$APP_NAME/package.json ./apps/$APP_NAME/package.json

USER nestjs

EXPOSE 3010

WORKDIR /app/apps/$APP_NAME
CMD ["node", "dist/main.js"]
