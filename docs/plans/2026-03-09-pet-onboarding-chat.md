# Pet Onboarding Chat Interface Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-page two-column chat interface at `/pet/onboard` that connects to the `pet-onboarding` Mastra agent, with a live pet preview panel that updates from tool call results.

**Architecture:** `useChat` from `@ai-sdk/react` calls the existing proxy route (`/api/agent/[...path]`), which injects `userId` as a system message before forwarding to border-collie. Tool results (`register-pet`, `save-personality-profile`) arrive as structured `tool-invocation` parts on assistant messages — a pure `derivePetState` function reads them to drive the right panel.

**Tech Stack:** Next.js 15 App Router, `@ai-sdk/react` (useChat), existing `ai-elements` components (`Conversation`, `PromptInput`, `Message`, `MessageResponse`), Tailwind CSS v4, pnpm, Biome (tabs, double quotes)

---

## Stage 1 — Wire up the agent connection

**Goal:** `/pet/onboard` exists and sending a message gets a streaming response from the agent.

**✅ Stage complete when:** You can type "hello" in the browser and see the agent stream back a greeting.

### Task 1.1: Modify proxy route to inject userId

**File:** `apps/web/src/app/api/agent/[...path]/route.ts`

The proxy already forwards requests. Extend it to read `resourceId` from the body and prepend a `[SYSTEM]` message so the agent knows who the user is.

Replace the POST handler:

```typescript
const BORDER_COLLIE_URL = process.env.BORDER_COLLIE_URL ?? "http://localhost:3030";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path } = await params;
	const upstream = `${BORDER_COLLIE_URL}/api/${path.join("/")}`;
	const raw = await req.text();

	let finalBody = raw;
	try {
		const parsed = JSON.parse(raw);
		if (parsed.resourceId && Array.isArray(parsed.messages)) {
			const alreadyInjected = parsed.messages.some(
				(m: { id?: string }) => m.id === "system-userid",
			);
			if (!alreadyInjected) {
				parsed.messages = [
					{
						id: "system-userid",
						role: "system",
						content: `[SYSTEM] userId: ${parsed.resourceId}`,
					},
					...parsed.messages,
				];
				finalBody = JSON.stringify(parsed);
			}
		}
	} catch {
		// not JSON, forward as-is
	}

	const res = await fetch(upstream, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: finalBody,
	});

	return new Response(res.body, {
		status: res.status,
		headers: {
			"Content-Type": res.headers.get("Content-Type") ?? "application/json",
		},
	});
}
```

GET handler stays unchanged.

### Task 1.2: Create server page + bare client shell

**Create:** `apps/web/src/app/(protected)/pet/onboard/page.tsx`

```typescript
import { getSession } from "@/lib/auth-server";
import { PetOnboardingPage } from "./pet-onboarding-page";

export default async function PetOnboardPage() {
	const session = await getSession();
	const userId = session!.user.id;
	return <PetOnboardingPage userId={userId} />;
}
```

**Create:** `apps/web/src/app/(protected)/pet/onboard/pet-onboarding-page.tsx`

Bare shell — just wire up `useChat` and dump raw output so we can verify the connection:

```typescript
"use client";

import { useChat } from "@ai-sdk/react";

interface PetOnboardingPageProps {
	userId: string;
}

export function PetOnboardingPage({ userId }: PetOnboardingPageProps) {
	const { messages, input, status, setInput, append } = useChat({
		api: "/api/agent/agents/pet-onboarding/stream",
		body: { resourceId: userId },
		maxSteps: 10,
	});

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="text-xs text-gray-400">status: {status}</div>
			{messages
				.filter((m) => m.role !== "system")
				.map((m) => (
					<div key={m.id}>
						<strong>{m.role}:</strong>{" "}
						{m.parts?.map((p, i) =>
							p.type === "text" ? <span key={i}>{p.text}</span> : null,
						)}
					</div>
				))}
			<input
				className="border p-2"
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && input.trim()) {
						append({ role: "user", content: input });
					}
				}}
				placeholder="Type a message…"
				value={input}
			/>
		</div>
	);
}
```

### Task 1.3: Smoke test

1. Start border-collie: `cd apps/border-collie && pnpm dev`
2. Start web: `cd apps/web && pnpm dev`
3. Navigate to `http://localhost:3000/pet/onboard`
4. Type "hello" → press Enter
5. ✅ Agent streams back a greeting

**Commit:**
```bash
git add apps/web/src/app/api/agent/ apps/web/src/app/'(protected)'/pet/onboard/
git commit -m "feat(web): wire up pet onboarding page to mastra agent"
```

---

## Stage 2 — Chat UI (left column)

**Goal:** Replace the bare debug UI with the proper chat interface using existing `ai-elements` components.

**✅ Stage complete when:** Messages render with proper styling, input works with Enter/button, and the agent conversation flows naturally.

### Task 2.1: Create `ChatPanel`

**Create:** `apps/web/src/app/(protected)/pet/onboard/chat-panel.tsx`

```typescript
"use client";

import type { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";
import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

interface ChatPanelProps {
	messages: UIMessage[];
	input: string;
	status: UseChatHelpers["status"];
	setInput: (v: string) => void;
	append: UseChatHelpers["append"];
	stop: UseChatHelpers["stop"];
}

export function ChatPanel({
	messages,
	input,
	status,
	setInput,
	append,
	stop,
}: ChatPanelProps) {
	const visibleMessages = messages.filter((m) => m.role !== "system");

	return (
		<div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
			<div className="border-b border-gray-100 px-4 py-3">
				<h2 className="font-semibold text-gray-900">Pet Registration</h2>
				<p className="text-sm text-gray-500">Tell me about your pet</p>
			</div>

			<Conversation className="flex-1">
				<ConversationContent>
					{visibleMessages.length === 0 ? (
						<ConversationEmptyState
							description="I'll guide you through registering your pet."
							title="Hey there! 🐾"
						/>
					) : (
						visibleMessages.map((msg) => {
							if (msg.role !== "user" && msg.role !== "assistant") return null;
							return (
								<Message from={msg.role} key={msg.id}>
									<MessageContent>
										{msg.parts?.map((part, i) => {
											if (part.type === "text") {
												return (
													<MessageResponse key={i}>
														{part.text}
													</MessageResponse>
												);
											}
											return null;
										})}
									</MessageContent>
								</Message>
							);
						})
					)}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>

			<div className="border-t border-gray-100 p-3">
				<PromptInput
					onSubmit={({ text }) => {
						if (!text.trim()) return;
						append({ role: "user", content: text });
					}}
				>
					<PromptInputTextarea
						onChange={(e) => setInput(e.target.value)}
						placeholder="Type a message…"
						value={input}
					/>
					<PromptInputFooter>
						<div />
						<PromptInputSubmit onStop={stop} status={status} />
					</PromptInputFooter>
				</PromptInput>
			</div>
		</div>
	);
}
```

### Task 2.2: Update `PetOnboardingPage` to use `ChatPanel` + two-column layout

Replace the bare debug content in `pet-onboarding-page.tsx`:

```typescript
"use client";

import { useChat } from "@ai-sdk/react";
import { ChatPanel } from "./chat-panel";

interface PetOnboardingPageProps {
	userId: string;
}

export function PetOnboardingPage({ userId }: PetOnboardingPageProps) {
	const { messages, input, status, setInput, append, stop } = useChat({
		api: "/api/agent/agents/pet-onboarding/stream",
		body: { resourceId: userId },
		maxSteps: 10,
	});

	return (
		<div className="flex h-[calc(100vh-10rem)] gap-6">
			<div className="flex w-1/2 flex-col">
				<ChatPanel
					append={append}
					input={input}
					messages={messages}
					setInput={setInput}
					status={status}
					stop={stop}
				/>
			</div>
			<div className="w-1/2 rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
				Preview panel coming soon
			</div>
		</div>
	);
}
```

### Task 2.3: Verify chat experience

1. Navigate to `http://localhost:3000/pet/onboard`
2. ✅ Empty state shows "Hey there! 🐾"
3. Send a message — ✅ user message appears right-aligned, assistant streams left-aligned
4. ✅ Submit button shows spinner while streaming, stop square during stream
5. ✅ Right column shows placeholder dashed box

**Commit:**
```bash
git add apps/web/src/app/'(protected)'/pet/onboard/
git commit -m "feat(web): add chat panel with ai-elements components"
```

---

## Stage 3 — Live pet preview panel (right column)

**Goal:** Right panel updates in real-time as the agent collects pet info and calls tools.

**✅ Stage complete when:** After providing name/type/breed, the right panel shows the pet card. After completing the personality interview, trait bars fill in and narrative appears.

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

const makeToolResultMsg = (toolName: string, result: unknown): UIMessage => ({
	id: "msg-1",
	role: "assistant",
	content: "",
	parts: [
		{
			type: "tool-invocation",
			toolInvocation: {
				toolCallId: "call-1",
				toolName,
				state: "result",
				args: {},
				result,
			},
		},
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
			makeToolResultMsg("register-pet", { id: "pet-1", name: "Max", type: "dog", breed: "Golden Retriever" }),
		]);
		expect(state).toMatchObject({ petId: "pet-1", name: "Max", type: "dog", breed: "Golden Retriever" });
		expect(state.traits).toBeNull();
	});

	it("extracts traits and narrative from save-personality-profile result", () => {
		const state = derivePetState([
			makeToolResultMsg("register-pet", { id: "pet-1", name: "Max", type: "dog", breed: "Golden" }),
			makeToolResultMsg("save-personality-profile", {
				traits: { energy: 4, playfulness: 5 },
				narrative: "Max is energetic.",
			}),
		]);
		expect(state.traits).toEqual({ energy: 4, playfulness: 5 });
		expect(state.narrative).toBe("Max is energetic.");
	});

	it("ignores tool calls not yet resolved", () => {
		const state = derivePetState([{
			id: "msg-1",
			role: "assistant",
			content: "",
			parts: [{ type: "tool-invocation", toolInvocation: { toolCallId: "c1", toolName: "register-pet", state: "call", args: {} } }],
		}]);
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
import type { UIMessage } from "ai";

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
		if (msg.role !== "assistant") continue;
		for (const part of msg.parts ?? []) {
			if (part.type !== "tool-invocation") continue;
			const { toolInvocation } = part;
			if (toolInvocation.state !== "result") continue;

			if (toolInvocation.toolName === "register-pet") {
				const r = toolInvocation.result as { id: string; name: string; type: string; breed: string };
				state.petId = r.id;
				state.name = r.name;
				state.type = r.type;
				state.breed = r.breed;
			}

			if (toolInvocation.toolName === "save-personality-profile") {
				const r = toolInvocation.result as { traits: Record<string, number>; narrative: string };
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
2. ✅ Right panel: paw emoji + dotted placeholders
3. Complete Phase 1 (name, type, breed) — ✅ right panel fills in pet identity card
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

**Tool invocations missing from messages:**
The Mastra stream must send tool call events in AI SDK data stream format. Inspect the raw stream in DevTools Network tab (the `/api/agent/agents/pet-onboarding/stream` request). You should see lines like `9:{"toolCallId":...}`. If not, check `@mastra/ai-sdk` docs — the Mastra server may need a specific config to emit AI SDK-compatible streams.

**`calc(100vh-10rem)` height is off:**
Nav is `h-16` = 4rem, layout `py-6` = 3rem total. Try `calc(100vh - 8rem)` or `calc(100vh - 7rem)` and adjust until the panel fills nicely without scrolling the page.

**Agent not receiving userId:**
Add `console.log` in the proxy POST handler to verify `finalBody` includes the system message before forwarding.
