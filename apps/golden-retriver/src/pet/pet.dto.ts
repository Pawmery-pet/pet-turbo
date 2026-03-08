import { createZodDto } from "nestjs-zod";
import {
	CreatePetSchema,
	ListPetsSchema,
	GetPetSchema,
	UpdatePetSchema,
	DeletePetSchema,
	PetSchema,
	CreatePetProfileSchema,
} from "@repo/pet-client";

export class CreatePetDto extends createZodDto(CreatePetSchema) {}
export class ListPetsDto extends createZodDto(ListPetsSchema) {}
export class GetPetDto extends createZodDto(GetPetSchema) {}
export class UpdatePetDto extends createZodDto(UpdatePetSchema) {}
export class DeletePetDto extends createZodDto(DeletePetSchema) {}
export class PetResponseDto extends createZodDto(PetSchema) {}
export class CreatePetProfileDto extends createZodDto(CreatePetProfileSchema) {}
