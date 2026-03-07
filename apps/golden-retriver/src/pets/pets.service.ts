import {
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "../db/db.constants";
import * as schema from "../db/schema";
import { pet } from "./pets.schema";
import type { CreatePetDto, UpdatePetDto } from "./pets.dto";

@Injectable()
export class PetsService {
	constructor(
		@Inject(DRIZZLE)
		private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async create(dto: CreatePetDto) {
		const [created] = await this.db
			.insert(pet)
			.values({
				userId: dto.userId,
				name: dto.name,
				type: dto.type,
				breed: dto.breed,
			})
			.returning();

		return created;
	}

	async list(userId: string) {
		return this.db.select().from(pet).where(eq(pet.userId, userId));
	}

	async get(id: string, userId: string) {
		const [found] = await this.db
			.select()
			.from(pet)
			.where(eq(pet.id, id))
			.limit(1);

		if (!found) throw new NotFoundException("Pet not found");
		if (found.userId !== userId) throw new ForbiddenException();

		return found;
	}

	async update(id: string, userId: string, dto: Omit<UpdatePetDto, "userId">) {
		await this.get(id, userId);

		const [updated] = await this.db
			.update(pet)
			.set({ ...dto, updatedAt: new Date() })
			.where(and(eq(pet.id, id), eq(pet.userId, userId)))
			.returning();

		return updated;
	}

	async remove(id: string, userId: string) {
		await this.get(id, userId);

		await this.db
			.delete(pet)
			.where(and(eq(pet.id, id), eq(pet.userId, userId)));
	}
}
