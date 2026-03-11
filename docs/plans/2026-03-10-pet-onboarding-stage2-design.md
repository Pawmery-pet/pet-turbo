# Pet Onboarding Stage 2 — Chat Panel UI Design

## Goal

Replace the full-width debug chat with a two-column layout. Left column shows a wizard-style chat that displays only the latest agent message. Right column is the live pet preview (Stage 3).

## Layout

```
┌─────────────────────────────┬──────────────────────────────┐
│  ChatPanel (w-1/2)          │  PreviewPanel (w-1/2)        │
│                             │                              │
│  [header]                   │  [pet card + traits]         │
│                             │                              │
│  [agent bubble — latest     │                              │
│   assistant msg only]       │                              │
│                             │                              │
│  [PromptInput at bottom]    │                              │
└─────────────────────────────┴──────────────────────────────┘
```

## Approach

Filter on render (Option A): keep standard `useChat` messages array, render only `messages.findLast(m => m.role === 'assistant')`. No extra state. Streaming renders live inside the single bubble.

## Components

### `ChatPanel`

Props: `messages`, `status`, `sendMessage`

- **Header**: static title "Pet Registration" + subtitle
- **Agent bubble**: last assistant message only, using `Message` + `MessageContent` + `MessageResponse`
- **Empty state**: shown before first agent response
- **PromptInput**: uncontrolled form (no `useState` for input), disabled while `status !== 'ready'`

### `PetOnboardingPage`

- Owns `useChat` with `DefaultChatTransport`
- Passes `messages`, `status`, `sendMessage` to `ChatPanel`
- Right column: dashed placeholder (Stage 3)

## Files

| File | Action |
|------|--------|
| `apps/web/src/app/(protected)/pet/onboard/chat-panel.tsx` | Create |
| `apps/web/src/app/(protected)/pet/onboard/pet-onboarding-page.tsx` | Update — two-column layout, use ChatPanel |
