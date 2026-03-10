# Pet Onboarding Stage 2 — Chat Panel Implementation Plan ✅ COMPLETE

> Committed: `feat(web): stage 2 — ChatPanel with latest-message-only display and tool visibility`

**Goal:** Replace the full-width chat with a two-column layout where the left panel shows only the latest agent message (wizard-style) and the right column holds a placeholder for Stage 3.

**Architecture:** Extract a `ChatPanel` component that filters `messages` to show only the last assistant message. `PetOnboardingPage` becomes a thin wrapper that owns `useChat` and renders the two-column grid. `PromptInput` is uncontrolled — no `useState` needed for input text.

**Tech Stack:** Next.js 15 App Router, `@ai-sdk/react` (useChat v6), `ai` (DefaultChatTransport), existing `ai-elements` components, Tailwind CSS v4, Biome (tabs, double quotes)

---

## Task 1: Create `ChatPanel`

**File:** Create `apps/web/src/app/(protected)/pet/onboard/chat-panel.tsx`

No tests for pure UI components — verify visually in Task 2.

**Step 1: Create the file**

```typescript
"use client";

import type { ChatStatus, UIMessage } from "ai";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

interface ChatPanelProps {
	messages: UIMessage[];
	status: ChatStatus;
	sendMessage: (msg: { text: string }) => void;
}

export function ChatPanel({ messages, status, sendMessage }: ChatPanelProps) {
	const lastAgentMessage = messages.findLast((m) => m.role === "assistant");

	return (
		<div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
			<div className="border-b border-gray-100 px-4 py-3">
				<h2 className="font-semibold text-gray-900">Pet Registration</h2>
				<p className="text-sm text-gray-500">Tell me about your pet</p>
			</div>

			<div className="flex flex-1 items-center justify-center p-6">
				{lastAgentMessage ? (
					<Message className="w-full" from="assistant">
						<MessageContent>
							{lastAgentMessage.parts?.map((part, i) =>
								part.type === "text" ? (
									<MessageResponse key={i}>{part.text}</MessageResponse>
								) : null,
							)}
						</MessageContent>
					</Message>
				) : (
					<p className="text-sm text-gray-400">
						Starting your pet registration…
					</p>
				)}
			</div>

			<div className="border-t border-gray-100 p-3">
				<PromptInput
					onSubmit={({ text }) => {
						if (!text.trim()) return;
						sendMessage({ text });
					}}
				>
					<PromptInputBody>
						<PromptInputTextarea placeholder="Type your answer…" />
					</PromptInputBody>
					<PromptInputFooter>
						<div />
						<PromptInputSubmit status={status} />
					</PromptInputFooter>
				</PromptInput>
			</div>
		</div>
	);
}
```

> **Note on PromptInput:** It is self-managed (uncontrolled) when used without `PromptInputProvider`. The form handles submit internally and resets after each submission — no `useState` needed for the input value.

---

## Task 2: Update `PetOnboardingPage` to two-column layout

**File:** Modify `apps/web/src/app/(protected)/pet/onboard/pet-onboarding-page.tsx`

**Step 1: Replace the file contents**

```typescript
"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { useMemo } from "react";
import { ChatPanel } from "./chat-panel";

interface PetOnboardingPageProps {
	userId: string;
}

export function PetOnboardingPage({ userId }: PetOnboardingPageProps) {
	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: "http://localhost:3030/chat/pet-onboarding-agent",
				body: { resourceId: userId },
			}),
		[userId],
	);

	const { messages, status, sendMessage } = useChat({ transport });

	return (
		<div className="flex h-[calc(100vh-8rem)] gap-6 p-6">
			<div className="flex w-1/2 flex-col">
				<ChatPanel
					messages={messages}
					sendMessage={sendMessage}
					status={status}
				/>
			</div>
			<div className="w-1/2 rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
				Preview panel coming soon
			</div>
		</div>
	);
}
```

> **Note on transport:** `useMemo` prevents re-creating `DefaultChatTransport` on every render. `userId` is the only dependency.

**Step 2: Start dev servers and verify visually**

```bash
# Terminal 1
cd apps/border-collie && pnpm dev

# Terminal 2
cd apps/web && pnpm dev
```

Navigate to `http://localhost:3000/pet/onboard`.

✅ Left column: header + empty state text + input box
✅ Right column: dashed placeholder
✅ Send a message → only the latest agent response appears in the bubble
✅ Send another message → bubble updates to show the new response
✅ Submit button shows spinner while streaming

**Step 3: Commit**

```bash
git add apps/web/src/app/'(protected)'/pet/onboard/
git commit -m "feat(web): add ChatPanel with latest-message-only display"
```

---

## Troubleshooting

**`PromptInput` not clearing after submit:**
The uncontrolled form calls `form.reset()` internally after submit. If using `value` prop on `PromptInputTextarea`, remove it — the textarea must be uncontrolled for the reset to work.

**Height looks off:**
The nav is `h-16` (4rem) and the page has `p-6` (1.5rem top+bottom = 3rem). Try adjusting `calc(100vh-8rem)` up or down by `1rem` increments.

**`status` type error:**
`ChatStatus` is exported from `"ai"` — make sure to import it: `import type { ChatStatus, UIMessage } from "ai"`.
