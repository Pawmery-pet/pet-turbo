import { createTool } from "@mastra/core/tools";
import { PetClient, CreatePetSchema, PetSchema } from "@repo/pet-client";

export const registerPetTool = createTool({
  id: "register-pet",
  description:
    "Register a new pet in the system. Call this after collecting name, type, and breed from the owner.",
  inputSchema: CreatePetSchema,
  outputSchema: PetSchema,
  execute: async (context) => {
    const { userId, name, type, breed } = context;
    const client = new PetClient(
      process.env.PET_SERVICE_URL ?? "http://localhost:3020",
    );
    const { data } = await client.create({ userId, name, type, breed });

    return data;
  },
});
