import { createTool } from "@mastra/core/tools";
import { PetClient, CreatePetSchema, PetSchema } from "@repo/pet-client";

export const createPetTool = createTool({
	id: "create-pet",
	description:
		"Create the pet record after collecting name, type, breed, and narrative from the owner. Call this ONCE at the end of onboarding after the owner confirms.",
	inputSchema: CreatePetSchema,
	outputSchema: PetSchema,
	execute: async (context) => {
		const { userId, name, type, breed, narrative } = context;
		const client = new PetClient(
			process.env.PET_SERVICE_URL ?? "http://localhost:3020",
		);
		const { data } = await client.create({ userId, name, type, breed, narrative });

		return data;
	},
});
