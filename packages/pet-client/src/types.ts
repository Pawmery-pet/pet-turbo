import type { z } from "zod";
import type {
	CreatePetSchema,
	UpdatePetSchema,
	PetSchema,
	PetTypeSchema,
	PetStatusSchema,
	PetProfileSchema,
	CreatePetProfileSchema,
} from "./schemas";

export type PetType = z.infer<typeof PetTypeSchema>;
export type PetStatus = z.infer<typeof PetStatusSchema>;
export type Pet = z.infer<typeof PetSchema>;
export type CreatePetInput = z.infer<typeof CreatePetSchema>;
export type UpdatePetInput = z.infer<typeof UpdatePetSchema>;
export type PetProfile = z.infer<typeof PetProfileSchema>;
export type CreatePetProfileInput = z.infer<typeof CreatePetProfileSchema>;
