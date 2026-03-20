import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "../db/db.constants";
import * as schema from "../db/schema";
import { petPhoto } from "./photo.schema";

@Injectable()
export class PhotoRepository {
	constructor(
		@Inject(DRIZZLE)
		private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async create(petId: string, key: string, contentType: string) {
		const [created] = await this.db
			.insert(petPhoto)
			.values({ petId, key, contentType })
			.returning();
		return created;
	}

	async findAllByPet(petId: string) {
		return this.db.select().from(petPhoto).where(eq(petPhoto.petId, petId));
	}
}
