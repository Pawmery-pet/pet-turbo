# Pet Onboarding Agent Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the `/pet/register` form with a conversational Mastra agent that registers the pet and conducts a personality interview in one chat session, saving a `pet_profile` for downstream companion and event systems.

**Architecture:** `apps/web` chat page → Next.js API proxy → `apps/border-collie` Mastra agent (`pet-onboarding`) → two tools that call `apps/golden-retriver` REST API to create the pet and save the profile.

**Tech Stack:** Mastra (`@mastra/core`, `@mastra/memory`), DeepSeek (`deepseek/deepseek-chat`), NestJS + Drizzle (golden-retriver), Next.js 15 App Router (web), `@repo/pet-client` shared types.

> **Agent iteration note:** The system prompt in Task 8 (`pet-onboarding-agent.ts`) is the primary iteration surface — tone, question flow, and interview depth will all need tuning based on real usage. Treat the initial instructions as a v1 baseline. Iterate on the prompt independently of the API/UI changes.

---

## Stages

| Stage | Tasks | ✅ Done when... |
|-------|-------|----------------|
| **1 — API layer** | 1–4 | `curl` to golden-retriver profile endpoints returns correct data |
| **2 — Agent** | 5–9 | `curl` to border-collie agent completes a full registration + interview flow |
| **3 — Web UI** | 10–12 | Browser end-to-end: chat page registers a pet and shows it on dashboard |

**Stop at each `---STAGE CHECKPOINT---` and verify before continuing.**

---

### Task 1: Add `pet_profile` table to golden-retriver schema

**Files:**
- Modify: `apps/golden-retriver/src/pet/pet.schema.ts`
- Modify: `apps/golden-retriver/src/db/schema/index.ts`

**Step 1: Add the table to pet.schema.ts**

Add below the existing `pet` table:

```ts
import { pgEnum, pgTable, text, timestamp, index, jsonb } from "drizzle-orm/pg-core";
// ... existing imports + petTypeEnum + petStatusEnum + pet table ...

export const petProfile = pgTable(
	"pet_profile",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		petId: text("pet_id")
			.notNull()
			.references(() => pet.id),
		traits: jsonb("traits").notNull().$type<Record<string, number>>(),
		narrative: text("narrative").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [index("pet_profile_petId_idx").on(table.petId)],
);
```

**Step 2: Export from DB schema index**

In `apps/golden-retriver/src/db/schema/index.ts`, it currently exports `../../pet/pet.schema` — `petProfile` is already covered by the wildcard export. Verify:

```ts
// should already contain:
export * from "../../pet/pet.schema";
```

No change needed if wildcard is there.

**Step 3: Commit**

```bash
cd apps/golden-retriver
git add src/pet/pet.schema.ts
git commit -m "feat(golden-retriver): add pet_profile table schema"
```

---

### Task 2: Add profile schemas and types to `@repo/pet-client`

**Files:**
- Modify: `packages/pet-client/src/schemas.ts`
- Modify: `packages/pet-client/src/types.ts`
- Modify: `packages/pet-client/src/client.ts`

**Step 1: Add schemas to schemas.ts**

```ts
export const CreatePetProfileSchema = z.object({
	traits: z.record(z.string(), z.number()),
	narrative: z.string().min(1),
});

export const PetProfileSchema = z.object({
	id: z.string(),
	petId: z.string(),
	traits: z.record(z.string(), z.number()),
	narrative: z.string(),
	createdAt: z.coerce.date(),
});
```

**Step 2: Add types to types.ts**

```ts
import type { CreatePetProfileSchema, PetProfileSchema } from "./schemas";

export type PetProfile = z.infer<typeof PetProfileSchema>;
export type CreatePetProfileInput = z.infer<typeof CreatePetProfileSchema>;
```

**Step 3: Add profile methods to client.ts**

```ts
import type { CreatePetInput, UpdatePetInput, Pet, PetProfile, CreatePetProfileInput } from "./types";

// inside PetClient class, add:
createProfile(petId: string, dto: CreatePetProfileInput): Promise<PetProfile> {
	return this.request<PetProfile>(`/pet/${petId}/profile`, "POST", dto);
}

getProfile(petId: string): Promise<PetProfile> {
	return this.request<PetProfile>(`/pet/${petId}/profile`, "GET");
}

getProfileHistory(petId: string): Promise<PetProfile[]> {
	return this.request<PetProfile[]>(`/pet/${petId}/profile/history`, "GET");
}
```

**Step 4: Commit**

```bash
git add packages/pet-client/src/
git commit -m "feat(pet-client): add pet profile schemas and client methods"
```

---

### Task 3: Build pet-client and push DB schema

**Step 1: Build pet-client**

```bash
pnpm --filter=@repo/pet-client build
```

Expected: `dist/` updated with new types.

**Step 2: Push DB schema**

```bash
cd apps/golden-retriver
pnpm db:push
```

Expected: Drizzle prints `pet_profile` table created. When prompted about the `pet_status` enum change (removing `survey_started`, renaming `activated` → `active`), confirm.

**Step 3: Commit**

```bash
git add pnpm-lock.yaml
git commit -m "chore: rebuild pet-client with profile types"
```

---

### Task 4: Add profile repository + service + controller routes to golden-retriver

**Files:**
- Create: `apps/golden-retriver/src/pet/pet-profile.repository.ts`
- Create: `apps/golden-retriver/src/pet/pet-profile.service.ts`
- Modify: `apps/golden-retriver/src/pet/pet.dto.ts`
- Modify: `apps/golden-retriver/src/pet/pet.controller.ts`
- Modify: `apps/golden-retriver/src/pet/pet.module.ts`

**Step 1: Create pet-profile.repository.ts**

```ts
import { Inject, Injectable } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "../db/db.constants";
import * as schema from "../db/schema";
import { petProfile } from "./pet.schema";
import type { CreatePetProfileInput } from "@repo/pet-client";

@Injectable()
export class PetProfileRepository {
	constructor(
		@Inject(DRIZZLE)
		private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async create(petId: string, dto: CreatePetProfileInput) {
		const [created] = await this.db
			.insert(petProfile)
			.values({ petId, traits: dto.traits, narrative: dto.narrative })
			.returning();
		return created;
	}

	async findLatest(petId: string) {
		const [latest] = await this.db
			.select()
			.from(petProfile)
			.where(eq(petProfile.petId, petId))
			.orderBy(desc(petProfile.createdAt))
			.limit(1);
		return latest ?? null;
	}

	async findAll(petId: string) {
		return this.db
			.select()
			.from(petProfile)
			.where(eq(petProfile.petId, petId))
			.orderBy(desc(petProfile.createdAt));
	}
}
```

**Step 2: Create pet-profile.service.ts**

```ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PetProfileRepository } from "./pet-profile.repository";
import { PetRepository } from "./pet.repository";
import type { CreatePetProfileInput } from "@repo/pet-client";

@Injectable()
export class PetProfileService {
	constructor(
		private readonly profileRepo: PetProfileRepository,
		private readonly petRepo: PetRepository,
	) {}

	async create(petId: string, userId: string, dto: CreatePetProfileInput) {
		const pet = await this.petRepo.findById(petId);
		if (!pet) throw new NotFoundException("Pet not found");
		// Mark pet as active after profile is saved
		await this.petRepo.update(petId, userId, { status: "active" });
		return this.profileRepo.create(petId, dto);
	}

	async getLatest(petId: string) {
		const profile = await this.profileRepo.findLatest(petId);
		if (!profile) throw new NotFoundException("Profile not found");
		return profile;
	}

	async getHistory(petId: string) {
		return this.profileRepo.findAll(petId);
	}
}
```

**Step 3: Add DTOs to pet.dto.ts**

```ts
import { CreatePetProfileSchema } from "@repo/pet-client";

export class CreatePetProfileDto extends createZodDto(CreatePetProfileSchema) {}
```

**Step 4: Add profile routes to pet.controller.ts**

```ts
import { Get } from "@nestjs/common";
import { PetProfileService } from "./pet-profile.service";
import { CreatePetProfileDto } from "./pet.dto";

// Add to constructor: private readonly profileService: PetProfileService
// Add these routes:

@Post(":id/profile")
createProfile(
	@Param("id") id: string,
	@Body() dto: CreatePetProfileDto,
	// userId passed via query or separate DTO — use @Query for simplicity
) {
	// NOTE: userId ownership check is inside PetProfileService.create
	// For the agent tool, we pass userId in the body — extend CreatePetProfileDto
	return this.profileService.create(id, dto.userId, dto);
}

@Get(":id/profile")
getProfile(@Param("id") id: string) {
	return this.profileService.getLatest(id);
}

@Get(":id/profile/history")
getProfileHistory(@Param("id") id: string) {
	return this.profileService.getHistory(id);
}
```

**⚠️ Note on CreatePetProfileDto:** The `CreatePetProfileSchema` in pet-client needs a `userId` field added for the controller to verify ownership. Add it:

In `packages/pet-client/src/schemas.ts`:
```ts
export const CreatePetProfileSchema = z.object({
	userId: z.string().min(1),
	traits: z.record(z.string(), z.number()),
	narrative: z.string().min(1),
});
```

**Step 5: Register in pet.module.ts**

```ts
@Module({
	controllers: [PetController],
	providers: [PetRepository, PetService, PetProfileRepository, PetProfileService],
})
export class PetModule {}
```

**Step 6: Verify it builds**

```bash
cd apps/golden-retriver
pnpm build
```

Expected: no TypeScript errors.

**Step 7: Commit**

```bash
git add apps/golden-retriver/src/pet/
git commit -m "feat(golden-retriver): add pet profile API endpoints"
```

---

---
## ✅ STAGE 1 CHECKPOINT — Verify before continuing

Run golden-retriver (`cd apps/golden-retriver && pnpm dev`).

**1. Create a test pet:**
```bash
curl -s -X POST http://localhost:3020/pet \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","name":"Milo","type":"dog","breed":"Labrador"}' | python3 -m json.tool
```
Expected: JSON with `"id"`, `"status": "registered"`.

**2. Save a profile (use the `id` from above):**
```bash
curl -s -X POST http://localhost:3020/pet/<PET_ID>/profile \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","traits":{"energy":4,"playfulness":5,"loyalty":5,"trainability":3,"affection":4},"narrative":"Milo is a boisterous, love-seeking lab who treats every walk like a grand expedition."}' | python3 -m json.tool
```
Expected: JSON with `"id"`, `"petId"`, `"traits"`, `"narrative"`.

**3. Fetch latest profile:**
```bash
curl -s http://localhost:3020/pet/<PET_ID>/profile | python3 -m json.tool
```
Expected: same profile object.

**4. Verify pet status flipped to active:**
```bash
curl -s -X POST http://localhost:3020/pet/<PET_ID> \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user"}' | python3 -m json.tool | grep status
```
Expected: `"status": "active"`.

✅ All passing? Commit and move to Stage 2.

---

### Task 5: Create trait vocabulary constants in border-collie

**Files:**
- Create: `apps/border-collie/src/mastra/traits.ts`

**Step 1: Create the file**

```ts
export const TRAIT_VOCABULARY: Record<string, string[]> = {
	dog:    ["energy", "playfulness", "loyalty", "trainability", "affection"],
	cat:    ["independence", "curiosity", "playfulness", "affection", "mischief"],
	bird:   ["vocality", "curiosity", "affection", "mimicry", "restlessness"],
	rabbit: ["skittishness", "affection", "curiosity", "energy", "playfulness"],
	sheep:  ["curiosity", "friendliness", "energy", "independence", "stubbornness"],
};

export function getTraitVocabulary(type: string): string[] {
	return TRAIT_VOCABULARY[type] ?? TRAIT_VOCABULARY["dog"];
}
```

**Step 2: Commit**

```bash
git add apps/border-collie/src/mastra/traits.ts
git commit -m "feat(border-collie): add pet trait vocabulary constants"
```

---

### Task 6: Create `registerPet` tool in border-collie

**Files:**
- Create: `apps/border-collie/src/mastra/tools/register-pet-tool.ts`

**Step 1: Add PET_SERVICE_URL to .env**

In `apps/border-collie/.env`:
```
PET_SERVICE_URL=http://localhost:3020
```

Also add to `.env.example`:
```
PET_SERVICE_URL=http://localhost:3020
```

**Step 2: Create the tool**

```ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const registerPetTool = createTool({
	id: "register-pet",
	description: "Register a new pet in the system. Call this after collecting name, type, and breed from the owner.",
	inputSchema: z.object({
		userId: z.string().describe("The owner's user ID"),
		name: z.string().describe("The pet's name"),
		type: z.enum(["dog", "cat", "bird", "rabbit", "sheep"]).describe("Type of pet"),
		breed: z.string().describe("The pet's breed"),
	}),
	outputSchema: z.object({
		petId: z.string(),
		name: z.string(),
		type: z.string(),
		breed: z.string(),
	}),
	execute: async ({ userId, name, type, breed }) => {
		const url = process.env.PET_SERVICE_URL ?? "http://localhost:3020";
		const res = await fetch(`${url}/pet`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId, name, type, breed }),
		});
		if (!res.ok) {
			throw new Error(`Failed to register pet: ${res.status}`);
		}
		const pet = await res.json() as { id: string; name: string; type: string; breed: string };
		return { petId: pet.id, name: pet.name, type: pet.type, breed: pet.breed };
	},
});
```

**Step 3: Commit**

```bash
git add apps/border-collie/src/mastra/tools/register-pet-tool.ts apps/border-collie/.env.example
git commit -m "feat(border-collie): add registerPet tool"
```

---

### Task 7: Create `savePersonalityProfile` tool in border-collie

**Files:**
- Create: `apps/border-collie/src/mastra/tools/save-profile-tool.ts`

**Step 1: Create the tool**

```ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const savePersonalityProfileTool = createTool({
	id: "save-personality-profile",
	description: "Save the pet's personality profile after completing the interview. Call this once you have assessed all traits and written the narrative.",
	inputSchema: z.object({
		petId: z.string().describe("The pet's ID returned by register-pet"),
		userId: z.string().describe("The owner's user ID"),
		traits: z.record(z.string(), z.number().min(1).max(5)).describe("Trait scores 1-5, keys must match the pet type's vocabulary"),
		narrative: z.string().describe("2-3 sentence personality summary — rich, warm, specific. Used for both display and AI story generation."),
	}),
	outputSchema: z.object({
		profileId: z.string(),
		success: z.boolean(),
	}),
	execute: async ({ petId, userId, traits, narrative }) => {
		const url = process.env.PET_SERVICE_URL ?? "http://localhost:3020";
		const res = await fetch(`${url}/pet/${petId}/profile`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId, traits, narrative }),
		});
		if (!res.ok) {
			throw new Error(`Failed to save profile: ${res.status}`);
		}
		const profile = await res.json() as { id: string };
		return { profileId: profile.id, success: true };
	},
});
```

**Step 2: Commit**

```bash
git add apps/border-collie/src/mastra/tools/save-profile-tool.ts
git commit -m "feat(border-collie): add savePersonalityProfile tool"
```

---

### Task 8: Create `pet-onboarding` agent

**Files:**
- Create: `apps/border-collie/src/mastra/agents/pet-onboarding-agent.ts`

**Step 1: Create the agent**

```ts
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { registerPetTool } from "../tools/register-pet-tool";
import { savePersonalityProfileTool } from "../tools/save-profile-tool";
import { TRAIT_VOCABULARY } from "../traits";

const traitVocabularyContext = Object.entries(TRAIT_VOCABULARY)
	.map(([type, traits]) => `  ${type}: [${traits.join(", ")}]`)
	.join("\n");

export const petOnboardingAgent = new Agent({
	id: "pet-onboarding",
	name: "Pet Onboarding Agent",
	instructions: `
You are a warm, friendly pet registration assistant for Pawmery. Your job is to register the owner's pet and conduct a short personality interview — all in one natural conversation.

## Opening
When the conversation starts, greet the owner and ask for their pet's name FIRST. Do not wait for them to introduce themselves.
Example: "Hey there! 🐾 Welcome to Pawmery! I'm here to get your pet set up. What's their name?"

## Phase 1: Registration
Collect in order, one question at a time:
1. Pet's name (asked in the opening)
2. Pet type (dog, cat, bird, rabbit, or sheep)
3. Breed

Once you have all three, call the register-pet tool immediately.
The userId is passed as your resourceId — use it in the tool call.

## Phase 2: Personality Interview
After registration, transition warmly: "Great, [name] is all registered! Now I'd love to learn a bit about their personality — it helps us bring them to life as your digital companion."

Ask 4-6 behavioural questions tailored to the pet type. Examples:
- "How does [name] react when you come home?"
- "Is [name] more of a cuddler or an explorer?"
- "How does [name] handle new people or animals?"
- "What's [name]'s energy level like day-to-day?"

## Phase 3: Save Profile
Once you have enough to assess the personality, call save-personality-profile with:
- traits: scored 1-5 using the correct vocabulary for the pet type:
${traitVocabularyContext}
- narrative: 2-3 rich, specific sentences about this pet's personality. Write it warmly and vividly — it will be used to generate stories and adventures for [name]'s digital companion.

End with: "Done! [name]'s profile is ready. Head back to your dashboard to meet your digital companion. 🐾"

## Rules
- Initiate — open with the first question, don't wait for the user to lead
- One question at a time
- Keep tone warm and playful
- Do not ask for information already provided
- Do not explain your internal steps
`,
	model: "deepseek/deepseek-chat",
	tools: { registerPetTool, savePersonalityProfileTool },
	memory: new Memory(),
});
```

**Step 2: Commit**

```bash
git add apps/border-collie/src/mastra/agents/pet-onboarding-agent.ts
git commit -m "feat(border-collie): add pet-onboarding conversational agent"
```

---

### Task 9: Register agent in border-collie mastra index

**Files:**
- Modify: `apps/border-collie/src/mastra/index.ts`

**Step 1: Add import and register**

```ts
import { petOnboardingAgent } from "./agents/pet-onboarding-agent";

export const mastra = new Mastra({
	agents: { weatherAgent, petOnboardingAgent },  // add petOnboardingAgent
	// ... rest unchanged
});
```

**Step 2: Restart border-collie and verify**

```bash
# kill existing process, then:
cd apps/border-collie && pnpm dev &
sleep 5
curl -s http://localhost:3030/api/agents | python3 -m json.tool | grep '"id"'
```

Expected: both `weather-agent` and `pet-onboarding` appear.

**Step 3: Commit**

```bash
git add apps/border-collie/src/mastra/index.ts
git commit -m "feat(border-collie): register pet-onboarding agent"
```

---

### Task 10: Create Next.js API proxy for border-collie

**Files:**
- Create: `apps/web/src/app/api/agent/[...path]/route.ts`

The web app proxies all `/api/agent/*` requests to border-collie. This avoids CORS issues.

**Step 1: Add BORDER_COLLIE_URL to web .env**

In `apps/web/.env` (or `.env.local`):
```
BORDER_COLLIE_URL=http://localhost:3030
```

**Step 2: Create the catch-all proxy route**

```ts
const BORDER_COLLIE_URL = process.env.BORDER_COLLIE_URL ?? "http://localhost:3030";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path } = await params;
	const upstream = `${BORDER_COLLIE_URL}/api/${path.join("/")}`;
	const body = await req.text();

	const res = await fetch(upstream, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body,
	});

	return new Response(res.body, {
		status: res.status,
		headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
	});
}

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path } = await params;
	const upstream = `${BORDER_COLLIE_URL}/api/${path.join("/")}`;
	const res = await fetch(upstream);
	return new Response(res.body, {
		status: res.status,
		headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
	});
}
```

**Step 3: Verify proxy works**

```bash
curl -s -X POST http://localhost:3000/api/agent/agents/pet-onboarding/generate \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

Expected: JSON response from the agent.

**Step 4: Commit**

```bash
git add apps/web/src/app/api/agent/
git commit -m "feat(web): add Next.js proxy route for border-collie agent API"
```

---

### Task 11: Create `/pet/onboard` chat page

**Files:**
- Create: `apps/web/src/app/(protected)/pet/onboard/ChatUI.tsx`
- Create: `apps/web/src/app/(protected)/pet/onboard/page.tsx`

**Step 1: Create ChatUI.tsx (client component)**

```tsx
"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
	role: "user" | "assistant";
	content: string;
}

interface ChatUIProps {
	userId: string;
	threadId: string;
}

export function ChatUI({ userId, threadId }: ChatUIProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const bottomRef = useRef<HTMLDivElement>(null);

	// Kick off with initial greeting
	useEffect(() => {
		sendMessage(`My user ID is ${userId}. Hello, I'd like to register my pet.`);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	async function sendMessage(text: string) {
		const newMessages: Message[] = [...messages, { role: "user", content: text }];
		setMessages(newMessages);
		setInput("");
		setLoading(true);
		try {
			const res = await fetch("/api/agent/agents/pet-onboarding/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: newMessages,
					threadId,
					resourceId: userId,
				}),
			});
			const data = await res.json() as { text?: string; error?: string };
			setMessages((prev) => [
				...prev,
				{ role: "assistant", content: data.text ?? "Sorry, something went wrong." },
			]);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col h-[calc(100vh-8rem)]">
			<div className="flex-1 overflow-y-auto space-y-4 pb-4">
				{messages.map((msg, i) => (
					<div
						key={i}
						className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
					>
						<div
							className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
								msg.role === "user"
									? "bg-orange-500 text-white rounded-br-sm"
									: "bg-gray-100 text-gray-900 rounded-bl-sm"
							}`}
						>
							{msg.content}
						</div>
					</div>
				))}
				{loading && (
					<div className="flex justify-start">
						<div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-400">
							Thinking…
						</div>
					</div>
				)}
				<div ref={bottomRef} />
			</div>

			<form
				onSubmit={(e) => { e.preventDefault(); if (input.trim()) sendMessage(input.trim()); }}
				className="flex gap-2 pt-3 border-t border-gray-100"
			>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type a message…"
					disabled={loading}
					className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 disabled:opacity-50"
				/>
				<button
					type="submit"
					disabled={loading || !input.trim()}
					className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
				>
					Send
				</button>
			</form>
		</div>
	);
}
```

**Step 2: Create page.tsx (server component)**

```tsx
import { getSession } from "@/lib/auth-server";
import { ChatUI } from "./ChatUI";
import Link from "next/link";

// Generate a threadId per page load — each onboarding session is a new thread
function generateThreadId() {
	return `onboard-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default async function OnboardPage() {
	const session = await getSession();
	const userId = session!.user.id;
	const threadId = generateThreadId();

	return (
		<div className="px-4 py-6 sm:px-0 max-w-lg mx-auto">
			<div className="mb-4">
				<Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
					← Back to dashboard
				</Link>
				<h1 className="text-xl font-bold text-gray-900 mt-2">Register your pet</h1>
				<p className="text-sm text-gray-500">Chat with our assistant to get started.</p>
			</div>
			<ChatUI userId={userId} threadId={threadId} />
		</div>
	);
}
```

**Step 3: Test the page**

Navigate to `http://localhost:3000/pet/onboard` when logged in. The assistant should greet and start asking questions.

**Step 4: Commit**

```bash
git add apps/web/src/app/\(protected\)/pet/onboard/
git commit -m "feat(web): add /pet/onboard conversational chat page"
```

---

### Task 12: Update dashboard CTAs and remove `/pet/register`

**Files:**
- Modify: `apps/web/src/app/(protected)/dashboard/page.tsx`
- Delete: `apps/web/src/app/(protected)/pet/register/` (entire directory)

**Step 1: Update dashboard links**

In `dashboard/page.tsx`, replace all `/pet/register` → `/pet/onboard`.

Two occurrences:
- `EmptyState` component href
- "Add pet" button href

```tsx
// EmptyState
<Link href="/pet/onboard" ...>Register a pet</Link>

// Add pet button
<Link href="/pet/onboard" ...>+ Add pet</Link>
```

**Step 2: Delete /pet/register**

```bash
rm -rf apps/web/src/app/\(protected\)/pet/register
```

**Step 3: Build web to confirm no broken imports**

```bash
pnpm --filter=web build
```

Expected: no TypeScript or build errors.

**Step 4: Commit**

```bash
git add apps/web/src/app/\(protected\)/dashboard/page.tsx
git rm -r apps/web/src/app/\(protected\)/pet/register/
git commit -m "feat(web): replace /pet/register form with /pet/onboard chat agent"
```

---

## End-to-End Test Checklist

Run all services: `pnpm dev` from repo root, plus `cd apps/border-collie && pnpm dev`.

- [ ] `GET http://localhost:3030/api/agents` returns both `weather-agent` and `pet-onboarding`
- [ ] `GET http://localhost:3020/pet/list` (POST with userId) still works
- [ ] Navigate to `http://localhost:3000/pet/onboard` — chat UI loads, greeting appears
- [ ] Complete registration: agent asks name → type → breed → calls `register-pet` tool
- [ ] Personality interview: agent asks 4-6 questions
- [ ] Profile saved: agent calls `save-personality-profile`, pet status → `active`
- [ ] Dashboard: registered pets show `active` status badge
- [ ] `/pet/register` returns 404 (removed)
