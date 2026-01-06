import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "../db/db.constants";
import * as schema from "../db/schema";
import { test } from "../db/schema/test";

@Injectable()
export class TestService {
	constructor(
		@Inject(DRIZZLE)
		private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async create() {
		const [row] = await this.db
			.insert(test)
			.values({})
			.returning({ id: test.testId });

		return { id: row.id };
	}

	async findOne(id: string) {
		const [row] = await this.db
			.select()
			.from(test)
			.where(eq(test.testId, id))
			.limit(1);

		if (!row) {
			throw new NotFoundException();
		}

		return row;
	}
}
