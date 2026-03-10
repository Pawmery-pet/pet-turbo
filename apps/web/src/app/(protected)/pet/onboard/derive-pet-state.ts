import type { ToolUIPart, UIMessage } from "ai";

export interface PetOnboardingState {
	petId: string | null;
	name: string | null;
	type: string | null;
	breed: string | null;
	traits: Record<string, number> | null;
	narrative: string | null;
}

const emptyState: PetOnboardingState = {
	petId: null, name: null, type: null, breed: null, traits: null, narrative: null,
};

export function derivePetState(messages: UIMessage[]): PetOnboardingState {
	return messages
		.flatMap((msg) => msg.parts ?? [])
		.filter((part): part is ToolUIPart =>
			!!part.type?.startsWith("tool-") && (part as ToolUIPart).state === "output-available",
		)
		.reduce((state, tool) => {
			if (tool.type === "tool-registerPetTool") {
				const r = tool.output as { id: string; name: string; type: string; breed: string };
				return { ...state, petId: r.id, name: r.name, type: r.type, breed: r.breed };
			}
			if (tool.type === "tool-savePersonalityProfileTool") {
				const r = tool.output as { traits: Record<string, number>; narrative: string };
				return { ...state, traits: r.traits, narrative: r.narrative };
			}
			return state;
		}, emptyState);
}
