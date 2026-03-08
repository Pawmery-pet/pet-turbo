import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { PetService } from "./pet.service";
import { PetProfileService } from "./pet-profile.service";
import {
	CreatePetDto,
	CreatePetProfileDto,
	DeletePetDto,
	GetPetDto,
	ListPetsDto,
	UpdatePetDto,
} from "./pet.dto";

@Controller("pet")
export class PetController {
	constructor(
		private readonly service: PetService,
		private readonly profileService: PetProfileService,
	) {}

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

	@Post(":id/profile")
	createProfile(@Param("id") id: string, @Body() dto: CreatePetProfileDto) {
		return this.profileService.create(id, dto.userId, dto);
	}

	@Get(":id/profile")
	getProfile(@Param("id") id: string) {
		return this.profileService.getLatest(id);
	}

	@Get(":id/profile/history")
	getProfileHistory(@Param("id") id: string) {
		return this.profileService.getHistory(id);
	}
}
