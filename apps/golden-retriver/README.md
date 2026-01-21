# Golden Retriver Service

NestJS microservice with Fastify adapter for the pet-turbo monorepo.

## Tech Stack

- NestJS 11.x with Fastify
- TypeScript (ES2023)
- Jest for testing

## Configuration

- **Port**: 3010 (configurable via `PORT` env var)
- **Swagger**: Available at `/swagger` when running

## Development

```bash
# From this directory
pnpm dev          # Start in watch mode
pnpm build        # Build for production
pnpm test         # Run tests
```

### Quick Start with Docker

```bash
# Build the image (from repository root)
docker build -f apps/golden-retriver/Dockerfile -t golden-retriver:latest .

# Run the container
docker run -d -p 3010:3010 --env-file apps/golden-retriver/.env --name golden-retriver golden-retriver:latest

# Or use docker-compose
cd apps/golden-retriver
docker-compose up -d
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
