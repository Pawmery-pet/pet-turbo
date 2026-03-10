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

## Stage 3 — Live pet preview panel (right column)

**Goal:** Right panel updates in real-time as the agent collects pet info and calls tools.

**✅ Stage complete when:** After providing name/type/breed, the right panel shows the pet card. After completing the personality interview, trait bars fill in and narrative appears.

> ⚠️ **AI SDK v6 tool part format:** Tool parts are `ToolUIPart` from `"ai"` — NOT the old `tool-invocation` format. Key differences:
> - `part.type` is `"tool-register-pet"` or `"tool-save-personality-profile"` (prefixed with `"tool-"`)
> - `part.state` is `"output-available"` when done (not `toolInvocation.state === "result"`)
> - `part.output` holds the result (not `toolInvocation.result`)
> - `part.input` holds the call arguments

### Task 3.1: Create `derivePetState` utility + tests

**Step 1: Check if vitest is available**

```bash
cd apps/web && cat package.json | grep -E 'vitest|jest|test'
```

If no test runner, add vitest:
```bash
cd apps/web && pnpm add -D vitest
# Add to package.json scripts: "test": "vitest run"
```

**Step 2: Create the test file**

**Create:** `apps/web/src/app/(protected)/pet/onboard/derive-pet-state.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { derivePetState } from "./derive-pet-state";
import type { UIMessage } from "ai";

const makeToolMsg = (toolType: string, output: unknown, state = "output-available"): UIMessage => ({
	id: "msg-1",
	role: "assistant",
	content: "",
	parts: [
		{
			type: toolType,
			state,
			input: {},
			output,
		} as never,
	],
});

describe("derivePetState", () => {
	it("returns null state for no messages", () => {
		expect(derivePetState([])).toEqual({
			petId: null, name: null, type: null, breed: null, traits: null, narrative: null,
		});
	});

	it("extracts pet identity from register-pet result", () => {
		const state = derivePetState([
			makeToolMsg("tool-register-pet", { id: "pet-1", name: "Max", type: "dog", breed: "Golden Retriever" }),
		]);
		expect(state).toMatchObject({ petId: "pet-1", name: "Max", type: "dog", breed: "Golden Retriever" });
		expect(state.traits).toBeNull();
	});

	it("extracts traits and narrative from save-personality-profile result", () => {
		const state = derivePetState([
			makeToolMsg("tool-register-pet", { id: "pet-1", name: "Max", type: "dog", breed: "Golden" }),
			makeToolMsg("tool-save-personality-profile", {
				traits: { energy: 4, playfulness: 5 },
				narrative: "Max is energetic.",
			}),
		]);
		expect(state.traits).toEqual({ energy: 4, playfulness: 5 });
		expect(state.narrative).toBe("Max is energetic.");
	});

	it("ignores tool calls not yet resolved", () => {
		const state = derivePetState([
			makeToolMsg("tool-register-pet", null, "input-available"),
		]);
		expect(state.petId).toBeNull();
	});
});
```

**Step 3: Run — expect FAIL**

```bash
cd apps/web && pnpm test
```

**Step 4: Create the implementation**

**Create:** `apps/web/src/app/(protected)/pet/onboard/derive-pet-state.ts`

```typescript
import type { ToolUIPart, UIMessage } from "ai";

export interface PetOnboardingState {
	petId: string | null;
	name: string | null;
	type: string | null;
	breed: string | null;
	traits: Record<string, number> | null;
	narrative: string | null;
}

export function derivePetState(messages: UIMessage[]): PetOnboardingState {
	const state: PetOnboardingState = {
		petId: null, name: null, type: null, breed: null, traits: null, narrative: null,
	};

	for (const msg of messages) {
		for (const part of msg.parts ?? []) {
			if (!part.type?.startsWith("tool-")) continue;
			const tool = part as ToolUIPart;
			if (tool.state !== "output-available") continue;

			if (tool.type === "tool-register-pet") {
				const r = tool.output as { id: string; name: string; type: string; breed: string };
				state.petId = r.id;
				state.name = r.name;
				state.type = r.type;
				state.breed = r.breed;
			}

			if (tool.type === "tool-save-personality-profile") {
				const r = tool.output as { traits: Record<string, number>; narrative: string };
				state.traits = r.traits;
				state.narrative = r.narrative;
			}
		}
	}

	return state;
}
```

**Step 5: Run — expect PASS**

```bash
cd apps/web && pnpm test
```

**Commit:**
```bash
git add apps/web/src/app/'(protected)'/pet/onboard/derive-pet-state.ts \
        apps/web/src/app/'(protected)'/pet/onboard/derive-pet-state.test.ts
git commit -m "feat(web): add derivePetState utility with tests"
```

### Task 3.2: Create `PetPreviewPanel`

**Create:** `apps/web/src/app/(protected)/pet/onboard/pet-preview-panel.tsx`

```typescript
"use client";

import type { UIMessage } from "ai";
import { derivePetState } from "./derive-pet-state";

const PET_EMOJI: Record<string, string> = {
	dog: "🐶", cat: "🐱", bird: "🦜", rabbit: "🐰", sheep: "🐑",
};

const TRAIT_LABELS: Record<string, string[]> = {
	dog: ["energy", "playfulness", "loyalty", "trainability", "affection"],
	cat: ["independence", "curiosity", "playfulness", "affection", "mischief"],
	bird: ["vocality", "curiosity", "affection", "mimicry", "restlessness"],
	rabbit: ["skittishness", "affection", "curiosity", "energy", "playfulness"],
	sheep: ["curiosity", "friendliness", "energy", "independence", "stubbornness"],
};

function TraitBar({ label, score }: { label: string; score: number }) {
	return (
		<div className="flex items-center gap-3">
			<span className="w-28 shrink-0 text-right text-sm capitalize text-gray-500">
				{label}
			</span>
			<div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
				<div
					className="h-full rounded-full bg-orange-400 transition-all duration-500"
					style={{ width: `${(score / 5) * 100}%` }}
				/>
			</div>
			<span className="w-6 text-sm text-gray-400">{score}</span>
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
	return (
		<div className="flex items-center gap-2 text-sm">
			<span className="w-12 text-gray-400">{label}</span>
			{value ? (
				<span className="font-medium capitalize text-gray-900">{value}</span>
			) : (
				<span className="text-gray-300">···</span>
			)}
		</div>
	);
}

export function PetPreviewPanel({ messages }: { messages: UIMessage[] }) {
	const state = derivePetState(messages);
	const traitKeys = state.type ? (TRAIT_LABELS[state.type] ?? []) : [];

	return (
		<div className="flex h-full flex-col gap-4">
			<div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
				<h2 className="mb-4 font-semibold text-gray-900">Your Pet</h2>
				<div className="flex items-center gap-4">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-3xl">
						{state.type ? PET_EMOJI[state.type] : "🐾"}
					</div>
					<div className="flex flex-col gap-1">
						<InfoRow label="Name" value={state.name} />
						<InfoRow label="Type" value={state.type} />
						<InfoRow label="Breed" value={state.breed} />
					</div>
				</div>
			</div>

			{state.petId && (
				<div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
					<h2 className="font-semibold text-gray-900">Personality</h2>
					{traitKeys.length > 0 && (
						<div className="flex flex-col gap-2">
							{traitKeys.map((trait) => (
								<TraitBar key={trait} label={trait} score={state.traits?.[trait] ?? 0} />
							))}
						</div>
					)}
					{state.narrative && (
						<p className="text-sm leading-relaxed text-gray-600">{state.narrative}</p>
					)}
					{!state.traits && (
						<p className="text-sm text-gray-400">Interview in progress…</p>
					)}
				</div>
			)}

			{!state.petId && (
				<div className="flex flex-1 items-center justify-center text-sm text-gray-400">
					Pet details will appear here as we chat.
				</div>
			)}
		</div>
	);
}
```

### Task 3.3: Wire `PetPreviewPanel` into the page

Update `pet-onboarding-page.tsx` — replace the dashed placeholder div:

```typescript
// add import at top
import { PetPreviewPanel } from "./pet-preview-panel";

// replace the placeholder div with:
<div className="w-1/2">
	<PetPreviewPanel messages={messages} />
</div>
```

### Task 3.4: End-to-end verification

1. Navigate to `http://localhost:3000/pet/onboard`
2. ✅ Right panel: paw emoji + dotted placeholders, "Pet details will appear here as we chat."
3. Complete Phase 1 (name, type, breed) — ✅ right panel fills in pet identity card and emoji updates
4. Complete personality interview + confirm — ✅ trait bars animate in
5. ✅ Narrative appears below bars

**Commit:**
```bash
git add apps/web/src/app/'(protected)'/pet/onboard/
git commit -m "feat(web): add live pet preview panel"
```

---

## Stage 4 — Typecheck & build

**✅ Stage complete when:** `pnpm typecheck` and `turbo build --filter=web` both exit 0.

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
