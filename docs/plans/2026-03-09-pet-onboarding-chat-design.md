# Pet Onboarding Chat Interface — Design

## Context

The `pet-onboarding` Mastra agent (border-collie, port 3030) runs a multi-phase conversation to register a pet and build its personality profile. The web app has `@ai-sdk/react`, `@mastra/ai-sdk`, and a rich component library (`Conversation`, `PromptInput`, etc.) already installed. A proxy route at `/api/agent/[...path]` forwards to border-collie. The dashboard already links to `/pet/onboard`.

## Layout

Full-page two-column experience at `/pet/onboard`:

- **Left**: scrollable chat history + prompt input at bottom
- **Right**: live pet preview card — updates in real-time as the agent collects info

```
┌──────────────────────────┬────────────────────────────┐
│  Chat                    │  Your Pet                  │
│                          │                            │
│  [assistant messages]    │  name / type / breed       │
│  [user messages]         │  trait bars (1–5)          │
│                          │  narrative summary         │
│  [prompt input]          │                            │
└──────────────────────────┴────────────────────────────┘
```

## Components

### Page (`/pet/onboard`)
- Server component — reads `userId` from session via `getSession()`
- Renders `<PetOnboardingPage userId={userId} />` (client boundary)

### `PetOnboardingPage` (client)
- Owns `useChat` from `@ai-sdk/react`
- `api`: `/api/agent/agents/pet-onboarding/stream`
- `body`: `{ resourceId: userId }` — for Mastra memory scoping
- Passes `messages`, `input`, `status`, handlers to children

### `ChatPanel`
- Uses existing `Conversation` + `ConversationContent` + `ConversationScrollButton`
- Renders user/assistant messages (filters out system messages)
- Uses `PromptInput` + `PromptInputTextarea` + `PromptInputSubmit`

### `PetPreviewPanel`
- Derives state from `messages` by scanning `toolInvocations`
- Three progressive display states (see Data Flow)

## Data Flow

```
useChat.append(msg)
  → POST /api/agent/agents/pet-onboarding/stream
      proxy injects [SYSTEM] userId: <userId> as first message
  → Mastra streams AI SDK-compatible response
  → tool results appear as toolInvocation parts on assistant messages

messages[] scan → PetPreviewState {
  name, type, breed, petId  ← register-pet result
  traits                    ← save-personality-profile result
  narrative                 ← save-personality-profile result
}
```

## userId Injection

The proxy route (`/api/agent/[...path]/route.ts`) reads `resourceId` from the request body and prepends a system message `[SYSTEM] userId: <resourceId>` to the messages array before forwarding to Mastra. This keeps the client clean.

## Right Panel States

| State | Trigger | Display |
|-------|---------|---------|
| Waiting | no tool results yet | dotted placeholders, paw icon |
| Registered | `register-pet` result present | name/type/breed filled, trait bars empty |
| Complete | `save-personality-profile` result present | full card with traits + narrative |

## Trait Vocabulary (per pet type)

From `TRAIT_VOCABULARY` in border-collie:
- dog: energy, playfulness, loyalty, trainability, affection
- cat: independence, curiosity, playfulness, affection, mischief
- bird: vocality, curiosity, affection, mimicry, restlessness
- rabbit: skittishness, affection, curiosity, energy, playfulness
- sheep: curiosity, friendliness, energy, independence, stubbornness

Trait bars render scores 1–5 as a filled progress bar.

## Files to Create / Modify

| File | Action |
|------|--------|
| `apps/web/src/app/(protected)/pet/onboard/page.tsx` | Create — server component shell |
| `apps/web/src/app/(protected)/pet/onboard/pet-onboarding-page.tsx` | Create — client component with useChat |
| `apps/web/src/app/(protected)/pet/onboard/chat-panel.tsx` | Create — left column |
| `apps/web/src/app/(protected)/pet/onboard/pet-preview-panel.tsx` | Create — right column |
| `apps/web/src/app/api/agent/[...path]/route.ts` | Modify — inject userId system message |
