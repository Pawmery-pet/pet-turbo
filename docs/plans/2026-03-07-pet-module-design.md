# Pet Module Design — golden-retriver

Date: 2026-03-07

## Context

First step toward the Mastra-powered pet registration workflow. The pet module lives in `apps/golden-retriver` (NestJS + Drizzle + Postgres) and exposes a REST API consumed by `apps/web`.

## Schema

Drizzle table in `src/pets/pets.schema.ts`:

| Column      | Type      | Notes                        |
|-------------|-----------|------------------------------|
| id          | text PK   | cuid2 via @paralleldrive/cuid2 |
| userId      | text FK   | → user.id, cascade delete    |
| name        | text      | not null                     |
| type        | enum      | dog \| cat \| bird           |
| breed       | text      | not null                     |
| status      | enum      | registered \| survey_pending \| active |
| createdAt   | timestamp | defaultNow                   |
| updatedAt   | timestamp | auto-updated                 |

## API Endpoints

All endpoints accept `userId` in the JSON body (server-to-server, userId pre-verified by Better Auth in `web`).

| Method | Path           | Body                          | Description      |
|--------|----------------|-------------------------------|------------------|
| POST   | /pets          | userId, name, type, breed     | Create pet       |
| POST   | /pets/list     | userId                        | List user's pets |
| POST   | /pets/:id      | userId                        | Get single pet   |
| PATCH  | /pets/:id      | userId, ...fields             | Update pet       |
| DELETE | /pets/:id      | userId                        | Delete pet       |

## Module Structure

```
src/pets/
  pets.module.ts      NestJS module
  pets.controller.ts  Route handlers
  pets.service.ts     Business logic + Drizzle queries
  pets.schema.ts      Drizzle table definition
  pets.dto.ts         Zod request/response schemas
```

Follows the existing `test` module pattern. Zod + nestjs-zod already wired globally.

## Auth

No guard for now. `web` passes `userId` in the request body, pre-verified from the Better Auth session. Service-to-service trust model (golden-retriver not publicly exposed).

## Future Considerations

- Migrate `pets.dto.ts` Zod schemas to a shared package for a type-safe API client
- Add a session guard once security requirements harden
- Expand pet schema (age, gender, photo, etc.) as needed
