import { Injectable, NotFoundException } from "@nestjs/common";
import { PetProfileRepository } from "./pet-profile.repository";
import { PetRepository } from "./pet.repository";
import type { CreatePetProfileInput } from "@repo/pet-client";

@Injectable()
export class PetProfileService {
	constructor(
		private readonly profileRepo: PetProfileRepository,
		private readonly petRepo: PetRepository,
	) {}

	async create(petId: string, userId: string, dto: CreatePetProfileInput) {
		const pet = await this.petRepo.findById(petId);
		if (!pet) throw new NotFoundException("Pet not found");
		await this.petRepo.update(petId, userId, { status: "active" });
		return this.profileRepo.create(petId, dto);
	}

	async getLatest(petId: string) {
		const profile = await this.profileRepo.findLatest(petId);
		if (!profile) throw new NotFoundException("Profile not found");
		return profile;
	}

	async getHistory(petId: string) {
		return this.profileRepo.findAll(petId);
	}
}
