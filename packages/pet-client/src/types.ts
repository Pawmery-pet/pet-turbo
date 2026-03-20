import type { z } from "zod";
import type {
	CreatePetSchema,
	UpdatePetSchema,
	PetSchema,
	PetTypeSchema,
} from "./schemas";

export type PetType = z.infer<typeof PetTypeSchema>;
export type Pet = z.infer<typeof PetSchema>;
export type CreatePetInput = z.infer<typeof CreatePetSchema>;
export type UpdatePetInput = z.infer<typeof UpdatePetSchema>;
