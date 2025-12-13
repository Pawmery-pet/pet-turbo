# Golden Retriver Service

NestJS microservice with Fastify adapter for the pet-turbo monorepo.

## Tech Stack

- NestJS 11.x with Fastify
- TypeScript (ES2023)
- Jest for testing

## Configuration

- **Port**: 3010 (configurable via `PORT` env var)
- **Note**: Port conflicts with `user` service - change if running both

## Development

```bash
# From this directory
pnpm dev          # Start in watch mode
pnpm build        # Build for production
pnpm test         # Run tests
```

## Structure

```
src/
├── main.ts           # Entry point with Fastify setup
├── app.module.ts     # Root module
├── app.controller.ts # Main controller
└── app.service.ts    # Main service
```

## Default Endpoint

- **GET** `/` - Returns "Hello World"
