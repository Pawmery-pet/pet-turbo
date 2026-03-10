import { describe, expect, it } from "vitest";
import { derivePetState } from "./derive-pet-state";
import type { UIMessage } from "ai";

const makeToolMsg = (toolType: string, output: unknown, state = "output-available"): UIMessage => ({
	id: "msg-1",
	role: "assistant",
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
			makeToolMsg("tool-registerPetTool", { id: "pet-1", name: "Max", type: "dog", breed: "Golden Retriever" }),
		]);
		expect(state).toMatchObject({ petId: "pet-1", name: "Max", type: "dog", breed: "Golden Retriever" });
		expect(state.traits).toBeNull();
	});

	it("extracts traits and narrative from save-personality-profile result", () => {
		const state = derivePetState([
			makeToolMsg("tool-registerPetTool", { id: "pet-1", name: "Max", type: "dog", breed: "Golden" }),
			makeToolMsg("tool-savePersonalityProfileTool", {
				traits: { energy: 4, playfulness: 5 },
				narrative: "Max is energetic.",
			}),
		]);
		expect(state.traits).toEqual({ energy: 4, playfulness: 5 });
		expect(state.narrative).toBe("Max is energetic.");
	});

	it("ignores tool calls not yet resolved", () => {
		const state = derivePetState([
			makeToolMsg("tool-registerPetTool", null, "input-available"),
		]);
		expect(state.petId).toBeNull();
	});
});
