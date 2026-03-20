import type { z } from "zod";
import type {
	CreatePetSchema,
	UpdatePetSchema,
	PetSchema,
	PetTypeSchema,
	GetPhotoUploadUrlSchema,
	AddPhotoSchema,
	PhotoUploadUrlSchema,
	PetPhotoSchema,
} from "./schemas";

export type PetType = z.infer<typeof PetTypeSchema>;
export type Pet = z.infer<typeof PetSchema>;
export type CreatePetInput = z.infer<typeof CreatePetSchema>;
export type UpdatePetInput = z.infer<typeof UpdatePetSchema>;
export type GetPhotoUploadUrlInput = z.infer<typeof GetPhotoUploadUrlSchema>;
export type AddPhotoInput = z.infer<typeof AddPhotoSchema>;
export type PhotoUploadUrl = z.infer<typeof PhotoUploadUrlSchema>;
export type PetPhoto = z.infer<typeof PetPhotoSchema>;
