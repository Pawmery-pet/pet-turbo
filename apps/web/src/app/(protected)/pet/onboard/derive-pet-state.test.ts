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

	it("extracts all pet fields from create-pet result", () => {
		const state = derivePetState([
			makeToolMsg("tool-createPetTool", {
				id: "pet-1",
				name: "Max",
				type: "dog",
				breed: "Golden Retriever",
				traits: { energy: 4, playfulness: 5 },
				narrative: "Max is energetic.",
			}),
		]);
		expect(state).toEqual({
			petId: "pet-1",
			name: "Max",
			type: "dog",
			breed: "Golden Retriever",
			traits: { energy: 4, playfulness: 5 },
			narrative: "Max is energetic.",
		});
	});

	it("ignores tool calls not yet resolved", () => {
		const state = derivePetState([
			makeToolMsg("tool-createPetTool", null, "input-available"),
		]);
		expect(state.petId).toBeNull();
	});
});
