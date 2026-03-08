# Pet Onboarding Agent Design

**Date:** 2026-03-08
**Status:** Approved

## Goal

Replace the `/pet/register` form with a single conversational agent (`pet-onboarding`) that handles pet registration and personality analysis in one chat flow. The resulting profile powers two downstream systems: the **digital companion** (chat AI) and the **event/adventure generator** (Travel Frog-style encounters).

## Architecture

```
apps/web /pet/onboard  ──chat──►  apps/border-collie /api/agents/pet-onboarding
                                            │
                            ┌───────────────┴───────────────┐
                            ▼                               ▼
                   registerPet tool             savePersonalityProfile tool
                            │                               │
                            └───────────┬───────────────────┘
                                        ▼
                            apps/golden-retriver (port 3020)
                              POST /pets  |  POST /pets/:id/profile
```

## Agent: `pet-onboarding`

**File:** `apps/border-collie/src/mastra/agents/pet-onboarding-agent.ts`
**Model:** `deepseek/deepseek-chat`
**Memory:** `@mastra/memory` — conversation persists across messages

**Conversation flow:**
1. Greet owner, ask for pet name
2. Ask for pet type (dog / cat / bird / rabbit / sheep)
3. Ask for breed
4. Call `registerPet` → pet created, status: `registered`
5. Conduct personality interview (4–6 behavioral questions, type-aware)
6. Call `savePersonalityProfile` → profile created, pet status: `active`

**Tools:**
- `registerPet(name, type, breed)` → `POST /pets` → returns `petId`
- `savePersonalityProfile(petId, traits, narrative)` → `POST /pets/:id/profile`

## Trait Vocabulary (hardcoded constants in border-collie)

Type-specific, fixed per animal type. Scores 1–5. Used to parameterize digital companion behavior and event generation.

```ts
const TRAIT_VOCABULARY = {
  dog:    ["energy", "playfulness", "loyalty", "trainability", "affection"],
  cat:    ["independence", "curiosity", "playfulness", "affection", "mischief"],
  bird:   ["vocality", "curiosity", "affection", "mimicry", "restlessness"],
  rabbit: ["skittishness", "affection", "curiosity", "energy", "playfulness"],
  sheep:  ["curiosity", "friendliness", "energy", "independence", "stubbornness"],
}
```

## Personality Profile

### Why narrative drives both display and AI

The `narrative` is a rich paragraph describing the pet's personality in warm, specific language. It serves dual purpose:
- **Human display** — shown on the pet profile page
- **AI context** — passed as system prompt context to the companion chat agent and event generator, giving richer grounding than a short tag

### `pet_profile` table

```ts
{
  id:        text (cuid2, PK)
  petId:     text (FK → pet.id)
  traits:    jsonb   // Record<string, number> — type-specific vocab, scores 1–5
  narrative: text    // rich paragraph, human-readable + AI story context
  createdAt: timestamp
}
```

Multiple rows per pet = full history. Latest row = active profile. Re-running analysis never overwrites — always appends.

## Pet Status (simplified)

```
registered  →  active
```

- `registered`: pet record created, onboarding in progress
- `active`: personality profile saved, companion ready

## API Changes (golden-retriver)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/pets/:id/profile` | Create new profile entry |
| `GET`  | `/pets/:id/profile` | Return latest profile |
| `GET`  | `/pets/:id/profile/history` | Return all profiles ordered by createdAt desc |

## Web Changes

- **New:** `apps/web/src/app/(protected)/pet/onboard/page.tsx` — chat UI
- **Remove:** `apps/web/src/app/(protected)/pet/register/` (form + page)
- Dashboard CTA → `/pet/onboard`
- Pet card: show narrative snippet when status is `active`

## Future: Downstream Consumers of the Profile

- **Companion agent** — receives `traits` + `narrative` as context, generates in-character responses
- **Event generator** — reads `traits` to determine encounter probability/type; uses `narrative` for story flavour
