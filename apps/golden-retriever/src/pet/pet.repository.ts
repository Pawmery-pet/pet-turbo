import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "../db/db.constants";
import * as schema from "../db/schema";
import { pet } from "./pet.schema";
import type { CreatePetDto, UpdatePetDto } from "./pet.dto";

@Injectable()
export class PetRepository {
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
				narrative: dto.narrative,
			})
			.returning();
		return created;
	}

	async findAllByUser(userId: string) {
		return this.db.select().from(pet).where(eq(pet.userId, userId));
	}

	async findById(id: string) {
		const [found] = await this.db
			.select()
			.from(pet)
			.where(eq(pet.id, id))
			.limit(1);
		return found ?? null;
	}

	async update(id: string, userId: string, dto: Omit<UpdatePetDto, "userId">) {
		const [updated] = await this.db
			.update(pet)
			.set({ ...dto, updatedAt: new Date() })
			.where(and(eq(pet.id, id), eq(pet.userId, userId)))
			.returning();
		return updated;
	}

	async remove(id: string, userId: string) {
		await this.db
			.delete(pet)
			.where(and(eq(pet.id, id), eq(pet.userId, userId)));
	}
}
