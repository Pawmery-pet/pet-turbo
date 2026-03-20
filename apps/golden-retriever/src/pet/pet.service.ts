import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PetRepository } from "./pet.repository";
import type { CreatePetDto, UpdatePetDto } from "./pet.dto";

@Injectable()
export class PetService {
	constructor(private readonly repo: PetRepository) {}

	async create(dto: CreatePetDto) {
		return this.repo.create(dto);
	}

	async list(userId: string) {
		return this.repo.findAllByUser(userId);
	}

	async get(id: string, userId: string) {
		const found = await this.repo.findById(id);
		if (!found) throw new NotFoundException("Pet not found");
		if (found.userId !== userId) throw new ForbiddenException();
		return found;
	}

	async update(id: string, userId: string, dto: Omit<UpdatePetDto, "userId">) {
		await this.get(id, userId);
		return this.repo.update(id, userId, dto);
	}

	async remove(id: string, userId: string) {
		await this.get(id, userId);
		return this.repo.remove(id, userId);
	}
}
