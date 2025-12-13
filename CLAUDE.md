# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Turborepo monorepo for a pet management application with a microservices architecture. The stack consists of:
- **Frontend**: Next.js 15+ with React, TypeScript, and Tailwind CSS
- **Backend Services**: Express.js microservices with Prisma ORM
- **Database**: MongoDB for both services
- **Authentication**: NextAuth.js v5 with custom OIDC provider (Authentik) and GitHub OAuth
- **Package Manager**: pnpm (v9.0.0)
- **Code Quality**: Biome for formatting and linting (uses tabs, double quotes)

## Project Structure

```
apps/
├── client/          # Next.js frontend application (port 3000)
├── pet/             # Pet microservice API (port 3020)
└── user/            # User microservice API (port 3010)
```

### Frontend (apps/client)
- Next.js with App Router
- NextAuth.js v5 for authentication with custom database adapter
- Auth adapter communicates with user service API for user/session management
- Pet management via `petService` client that calls pet microservice
- Tailwind CSS v4 for styling

### Pet Service (apps/pet)
- Express.js REST API on port 3020
- Prisma with MongoDB for pet data storage
- Swagger documentation at `/api-docs`
- Schema: `apps/pet/src/lib/prisma/schema.prisma`

### User Service (apps/user)
- Express.js REST API on port 3010
- Prisma with MongoDB for user/auth data storage (NextAuth.js schema)
- Manages Users, Accounts, Sessions, VerificationTokens, Authenticators
- Swagger documentation at `/api-docs`
- Schema: `apps/user/src/lib/prisma/schema.prisma`

## Common Commands

### Development
```bash
# Run all apps in dev mode
pnpm dev

# Run specific app
turbo dev --filter=client
turbo dev --filter=pet
turbo dev --filter=user

# Build all apps
pnpm build

# Build specific app
turbo build --filter=client
```

### Database (Prisma)
```bash
# Pet service
cd apps/pet
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to MongoDB
pnpm db:studio      # Open Prisma Studio

# User service
cd apps/user
pnpm db:generate
pnpm db:push
pnpm db:studio
```

### Code Quality
```bash
# Format code (Biome - tabs, double quotes)
pnpm format

# Run linting
pnpm lint

# Type checking
pnpm typecheck
```

## Architecture Notes

### Microservices Communication
- The Next.js client app does NOT directly access databases
- Client communicates with backend services via REST APIs:
  - Pet operations: `apps/client/src/services/petService.ts` → Pet API (port 3020)
  - User/auth operations: NextAuth adapter services → User API (port 3010)
- Each microservice has its own Prisma schema and MongoDB database
- Service URLs configured via environment variables:
  - `NEXT_PUBLIC_PET_SERVICE_URL` (default: http://localhost:3020)
  - User service URLs configured in adapter services (default: http://localhost:3010)

### Authentication Flow
1. NextAuth.js in client app handles OAuth flow (GitHub, Authentik OIDC)
2. Custom database adapter (`apps/client/src/auth/adapter.ts`) uses service clients
3. Service clients (`userService`, `accountService`, `sessionService`, etc.) make HTTP requests to user service API
4. User service API performs actual database operations via Prisma

### Database Schema Relationship
- User service manages all NextAuth.js tables (User, Account, Session, etc.)
- Pet service stores Pet records with `userId` field referencing users
- No direct foreign key relationship between services (microservices pattern)

## Development Notes

### Service Dependencies
When running the full stack locally:
1. Start user service first (port 3010)
2. Start pet service (port 3020)
3. Start client app (port 3000)

Or use `pnpm dev` from root to start all services concurrently.

### Environment Variables
Each service requires a `.env` file:
- `DATABASE_URL`: MongoDB connection string
- `CORS_ORIGIN`: Allowed CORS origin (default: http://localhost:3000)

Client app requires:
- `AUTH_SECRET`: NextAuth.js secret
- `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`: GitHub OAuth credentials
- `NEXT_PUBLIC_PET_SERVICE_URL`: Pet service URL

### Prisma Schema Location
Unlike standard Prisma setups, schemas are at:
- `apps/pet/src/lib/prisma/schema.prisma`
- `apps/user/src/lib/prisma/schema.prisma`

Generated clients output to `.prisma` directory within each service.

### Git Hooks
Pre-commit hook automatically runs `pnpm format` on changes in `apps/` directory.
