import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const PetTypeSchema = z.enum(["dog", "cat", "bird"]);
const PetStatusSchema = z.enum(["registered", "survey_started", "activated"]);

// --- Request DTOs ---

export class CreatePetDto extends createZodDto(
	z.object({
		userId: z.string().min(1),
		name: z.string().min(1),
		type: PetTypeSchema,
		breed: z.string().min(1),
	}),
) {}

export class ListPetsDto extends createZodDto(
	z.object({
		userId: z.string().min(1),
	}),
) {}

export class GetPetDto extends createZodDto(
	z.object({
		userId: z.string().min(1),
	}),
) {}

export class UpdatePetDto extends createZodDto(
	z.object({
		userId: z.string().min(1),
		name: z.string().min(1).optional(),
		breed: z.string().min(1).optional(),
		status: PetStatusSchema.optional(),
	}),
) {}

export class DeletePetDto extends createZodDto(
	z.object({
		userId: z.string().min(1),
	}),
) {}

// --- Response DTO ---

export class PetResponseDto extends createZodDto(
	z.object({
		id: z.string(),
		userId: z.string(),
		name: z.string(),
		type: PetTypeSchema,
		breed: z.string(),
		status: PetStatusSchema,
		createdAt: z.date(),
		updatedAt: z.date(),
	}),
) {}
