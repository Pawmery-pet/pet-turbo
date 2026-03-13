import { Inject, Injectable } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "../db/db.constants";
import * as schema from "../db/schema";
import { petProfile } from "./pet.schema";
import type { CreatePetProfileInput } from "@repo/pet-client";

@Injectable()
export class PetProfileRepository {
	constructor(
		@Inject(DRIZZLE)
		private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async create(petId: string, dto: CreatePetProfileInput) {
		const [created] = await this.db
			.insert(petProfile)
			.values({ petId, traits: dto.traits, narrative: dto.narrative })
			.returning();
		return created;
	}

	async findLatest(petId: string) {
		const [latest] = await this.db
			.select()
			.from(petProfile)
			.where(eq(petProfile.petId, petId))
			.orderBy(desc(petProfile.createdAt))
			.limit(1);
		return latest ?? null;
	}

	async findAll(petId: string) {
		return this.db
			.select()
			.from(petProfile)
			.where(eq(petProfile.petId, petId))
			.orderBy(desc(petProfile.createdAt));
	}
}
