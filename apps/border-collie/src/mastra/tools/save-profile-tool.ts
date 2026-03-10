import { createTool } from "@mastra/core/tools";
import {
  PetClient,
  CreatePetProfileSchema,
  PetProfileSchema,
} from "@repo/pet-client";
import { z } from "zod";

export const savePersonalityProfileTool = createTool({
  id: "save-personality-profile",
  description:
    "Save the pet's personality profile after completing the interview. Call this once you have assessed all traits and written the narrative.",
  inputSchema: CreatePetProfileSchema.extend({
    petId: z.string().describe("The pet's ID returned by register-pet"),
  }),
  outputSchema: PetProfileSchema,
  execute: async (context) => {
    const { petId, userId, traits, narrative } = context;
    const client = new PetClient(
      process.env.PET_SERVICE_URL ?? "http://localhost:3020",
    );
    const { data } = await client.createProfile(petId, {
      userId,
      traits,
      narrative,
    });

    return data;
  },
});
