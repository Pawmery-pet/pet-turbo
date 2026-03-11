# Pet Onboarding Chat Interface Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-page two-column chat interface at `/pet/onboard` that connects to the `pet-onboarding` Mastra agent, with a live pet preview panel that updates from tool call results.

**Architecture:** `useChat` from `@ai-sdk/react` calls border-collie directly (`http://localhost:3030/chat/pet-onboarding-agent`) with `resourceId: userId` in the body. A hidden trigger message is auto-sent on mount (via `useEffect`) seeding the agent's working memory. Tool results (`register-pet`, `save-personality-profile`) arrive as `ToolUIPart` parts — a pure `derivePetState` function reads them to drive the right panel.

**Tech Stack:** Next.js 15 App Router, `@ai-sdk/react@^3` + `ai@^6` (`useChat` + `DefaultChatTransport`), existing `ai-elements` components, Tailwind CSS v4, pnpm, Biome (tabs, double quotes)

---

## Stage 1 — Wire up the agent connection ✅

**Completed:** `feat(web): wire up pet onboarding page to mastra agent`

**What was built:**
- `apps/web/src/app/(protected)/pet/onboard/page.tsx` — server component, reads `session.user.uid`, redirects if no session
- `apps/web/src/app/(protected)/pet/onboard/pet-onboarding-page.tsx` — client component with `useChat` + `DefaultChatTransport` calling `http://localhost:3030/chat/pet-onboarding-agent`
- Proxy route (`/api/agent/[...path]`) exists but is not used for pet onboarding — border-collie is called directly

**Key discovery:** Mastra streams its own SSE format; border-collie exposes an AI SDK-compatible endpoint via `@mastra/ai-sdk`'s `chatRoute` at `/chat/pet-onboarding-agent`. Do not proxy raw Mastra streams through `/api/agent`.

---

## Stage 2 — Chat UI (left column) ✅

**Completed:** `feat(web): stage 2 — ChatPanel with latest-message-only display and tool visibility`

**What was built:**
- `apps/web/src/app/(protected)/pet/onboard/chat-panel.tsx` — wizard-style panel showing **only the last assistant message** (`messages.findLast(m => m.role === "assistant")`), plus all tool call parts as collapsible activity badges below
- `apps/web/src/app/(protected)/pet/onboard/pet-onboarding-page.tsx` — two-column layout; auto-initiates conversation on mount via `useEffect` + `sendMessage` with a working memory seed message

**Key decisions vs original plan:**
- Shows only the **latest** agent message (not full history) — wizard interview feel
- Tool calls surface in the chat panel as `Tool`/`ToolHeader` collapsibles (state badges: Running → Completed)
- `useEffect` with `useRef` guard auto-triggers on mount — no user input needed to start
- Working memory seed message includes `userId` and a registration template so the agent has context from the first turn
- Agent (`pet-onboarding-agent`) has Mastra `Memory` with `workingMemory.enabled: true` and a registration form template

---

## Stage 3 — Live pet preview panel (right column) ✅

**Completed:** `feat(web): stage 3 — live pet preview panel with Done button`

**What was built:**
- `derive-pet-state.ts` — pure `flatMap → filter → reduce` function scanning `UIMessage[]` for tool parts; 4 vitest tests
- `pet-preview-panel.tsx` — identity card (emoji, name/type/breed), personality section (trait bars + narrative), Done button (appears after `save-personality-profile` completes, navigates to `/dashboard`)
- `pet-onboarding-page.tsx` — placeholder replaced with `<PetPreviewPanel messages={messages} />`

**Key discoveries vs original plan:**
- Tool `part.type` uses the agent `tools` object **key** (not the `createTool` id): `"tool-registerPetTool"` / `"tool-savePersonalityProfileTool"`
- `PetClient` returns `{ data: ... }` — border-collie tools needed `.data` unwrapping before returning to the agent (fixed in `fix(border-collie): unwrap .data from pet client responses in tools`)

---

## Stage 4 — Typecheck & build ✅

**Completed:** `pnpm typecheck` passes (4 tasks successful).

**Note:** `UIMessage` in AI SDK v6 has no `content` field — test helper used `content: ""` which caused a TS error; removed to fix.

```bash
# From repo root
pnpm typecheck
turbo build --filter=web
```

Fix any TypeScript errors, then:

```bash
git add -p
git commit -m "fix(web): resolve typecheck errors in pet onboarding page"
```

---

## Troubleshooting

**Tool output missing from `derivePetState`:**
Log `messages` in the browser console and check that tool parts have `state: "output-available"` and a non-null `output`. If `state` is `"input-available"` the tool is still running. If `output` is null, check the border-collie tool execution for errors.

**`calc(100vh-8rem)` height is off:**
Nav is `h-16` = 4rem, page padding `p-6` = 1.5rem top + 1.5rem bottom = 3rem. Adjust `calc(100vh-8rem)` by `±1rem` increments until the panel fills nicely without page scroll.

**Agent not calling tools / wrong userId in tool calls:**
Check the Mastra working memory — the seed message sent on mount should contain the userId in the template. Confirm the border-collie `pet-onboarding-agent` has `memory.options.workingMemory.enabled: true`. The agent reads userId from working memory, not from the message content.
