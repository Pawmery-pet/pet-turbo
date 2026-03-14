import { z } from "zod";

export const PetTypeSchema = z.enum(["dog", "cat", "bird", "rabbit", "sheep"]);

export const CreatePetSchema = z.object({
	userId: z.string().min(1),
	name: z.string().min(1),
	type: PetTypeSchema,
	breed: z.string().min(1),
	traits: z.record(z.string(), z.number()),
	narrative: z.string().min(1),
});

export const ListPetsSchema = z.object({
	userId: z.string().min(1),
});

export const GetPetSchema = z.object({
	userId: z.string().min(1),
});

export const UpdatePetSchema = z.object({
	userId: z.string().min(1),
	name: z.string().min(1).optional(),
	breed: z.string().min(1).optional(),
});

export const DeletePetSchema = z.object({
	userId: z.string().min(1),
});

export const PetSchema = z.object({
	id: z.string(),
	userId: z.string(),
	name: z.string(),
	type: PetTypeSchema,
	breed: z.string(),
	traits: z.record(z.string(), z.number()),
	narrative: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});
