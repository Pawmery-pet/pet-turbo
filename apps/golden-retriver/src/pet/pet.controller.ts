import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { PetService } from "./pet.service";
import {
	CreatePetDto,
	DeletePetDto,
	GetPetDto,
	ListPetsDto,
	UpdatePetDto,
} from "./pet.dto";

@Controller("pet")
export class PetController {
	constructor(private readonly service: PetService) {}

	@Post()
	create(@Body() dto: CreatePetDto) {
		return this.service.create(dto);
	}

	@Post("list")
	list(@Body() dto: ListPetsDto) {
		return this.service.list(dto.userId);
	}

	@Post(":id")
	get(@Param("id") id: string, @Body() dto: GetPetDto) {
		return this.service.get(id, dto.userId);
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() dto: UpdatePetDto) {
		const { userId, ...fields } = dto;
		return this.service.update(id, userId, fields);
	}

	@Delete(":id")
	remove(@Param("id") id: string, @Body() dto: DeletePetDto) {
		return this.service.remove(id, dto.userId);
	}
}
