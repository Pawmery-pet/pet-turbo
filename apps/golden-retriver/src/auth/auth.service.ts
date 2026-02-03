import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { and, eq, asc, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "../db/db.constants";
import * as schema from "../db/schema";
import {
	type AdapterModel,
	type AdapterRequest,
	type AdapterWhere,
} from "./auth.controller";

@Injectable()
export class AuthService {
	constructor(
		@Inject(DRIZZLE)
		private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async handleAdapter(body: AdapterRequest) {
		const table = this.getTable(body.model);
		const selectMap = this.getSelectMap(table, body.select);

		if (body.op === "create") {
			if (!body.data) {
				throw new BadRequestException("Missing data for create");
			}

			const [row] = await this.db
				.insert(table)
				.values(body.data)
				.returning(selectMap ?? undefined);

			return { ok: true, data: row ?? null };
		}

		if (body.op === "findOne") {
			const where = this.buildWhere(table, body.where);
			const rows = await this.db
				.select(selectMap ?? undefined)
				.from(table)
				.where(where)
				.limit(1);

			return { ok: true, data: rows[0] ?? null };
		}

		if (body.op === "findMany") {
			const query = this.db
				.select(selectMap ?? undefined)
				.from(table);

			if (body.where && body.where.length > 0) {
				query.where(this.buildWhere(table, body.where));
			}

			if (body.sortBy) {
				const column = this.getColumn(table, body.sortBy.field);
				query.orderBy(
					body.sortBy.direction === "desc"
						? desc(column as never)
						: asc(column as never),
				);
			}

			if (body.limit) {
				query.limit(body.limit);
			}

			if (body.offset) {
				query.offset(body.offset);
			}

			const rows = await query;
			return { ok: true, data: rows };
		}

		if (body.op === "count") {
			const query = this.db.select().from(table);

			if (body.where && body.where.length > 0) {
				query.where(this.buildWhere(table, body.where));
			}

			const rows = await query;
			return { ok: true, data: rows.length };
		}

		if (body.op === "update") {
			if (!body.update) {
				throw new BadRequestException("Missing update for update");
			}

			const where = this.buildWhere(table, body.where);
			const [row] = await this.db
				.update(table)
				.set(body.update)
				.where(where)
				.returning(selectMap ?? undefined);

			return { ok: true, data: row ?? null };
		}

		if (body.op === "delete") {
			const where = this.buildWhere(table, body.where);
			await this.db.delete(table).where(where);
			return { ok: true, data: null };
		}

		if (body.op === "updateMany") {
			if (!body.update) {
				throw new BadRequestException("Missing update for updateMany");
			}

			const where = this.buildWhere(table, body.where);
			const rows = await this.db
				.update(table)
				.set(body.update)
				.where(where)
				.returning({ count: table.id });

			return { ok: true, data: rows.length };
		}

		if (body.op === "deleteMany") {
			const where = this.buildWhere(table, body.where);
			const rows = await this.db
				.delete(table)
				.where(where)
				.returning({ count: table.id });

			return { ok: true, data: rows.length };
		}

		if (body.op === "transaction") {
			if (!body.items || body.items.length === 0) {
				throw new BadRequestException("Missing items for transaction");
			}

			const results = [];
			for (const item of body.items) {
				const result = await this.handleAdapter(item);
				results.push(result.data ?? null);
			}

			return { ok: true, data: results };
		}

		throw new BadRequestException("Unsupported op");
	}

	private getTable(model: AdapterModel) {
		const tableMap = {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		} as const;

		const table = tableMap[model];
		if (!table) {
			throw new BadRequestException("Unknown model");
		}

		return table;
	}

	private getSelectMap(table: Record<string, unknown>, select?: string[]) {
		if (!select || select.length === 0) {
			return null;
		}

		const map: Record<string, unknown> = {};
		for (const field of select) {
			const column = this.getColumn(table, field);
			map[field] = column;
		}

		return map;
	}

	private buildWhere(
		table: Record<string, unknown>,
		where?: AdapterWhere[],
	) {
		if (!where || where.length === 0) {
			throw new BadRequestException("Missing where clause");
		}

		const conditions = where.map((item) => {
			if (item.operator && item.operator !== "eq") {
				throw new BadRequestException("Unsupported operator");
			}
			if (item.connector && item.connector !== "AND") {
				throw new BadRequestException("Unsupported connector");
			}

			const column = this.getColumn(table, item.field);
			return eq(column as never, item.value as never);
		});

		return and(...conditions);
	}

	private getColumn(table: Record<string, unknown>, field: string) {
		const column = table[field];
		if (!column) {
			throw new BadRequestException("Unknown field");
		}
		return column;
	}
}
