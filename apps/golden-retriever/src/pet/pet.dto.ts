import { createZodDto } from "nestjs-zod";
import {
	CreatePetSchema,
	ListPetsSchema,
	GetPetSchema,
	UpdatePetSchema,
	DeletePetSchema,
	PetSchema,
} from "@repo/pet-client";

export class CreatePetDto extends createZodDto(CreatePetSchema) {}
export class ListPetsDto extends createZodDto(ListPetsSchema) {}
export class GetPetDto extends createZodDto(GetPetSchema) {}
export class UpdatePetDto extends createZodDto(UpdatePetSchema) {}
export class DeletePetDto extends createZodDto(DeletePetSchema) {}
export class PetResponseDto extends createZodDto(PetSchema) {}

import {
	GetPhotoUploadUrlSchema,
	AddPhotoSchema,
	PhotoUploadUrlSchema,
	PetPhotoSchema,
} from "@repo/pet-client";

export class GetPhotoUploadUrlDto extends createZodDto(GetPhotoUploadUrlSchema) {}
export class AddPhotoDto extends createZodDto(AddPhotoSchema) {}
export class PhotoUploadUrlResponseDto extends createZodDto(PhotoUploadUrlSchema) {}
export class PetPhotoResponseDto extends createZodDto(PetPhotoSchema) {}
