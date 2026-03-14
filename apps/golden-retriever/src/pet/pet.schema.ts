import { pgEnum, pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const petTypeEnum = pgEnum("pet_type", ["dog", "cat", "bird", "rabbit", "sheep"]);

export const pet = pgTable(
	"pet",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id").notNull(),
		name: text("name").notNull(),
		type: petTypeEnum("type").notNull(),
		breed: text("breed").notNull(),
		narrative: text("narrative").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull()
			.$onUpdate(() => new Date()),
	},
	(table) => [index("pet_userId_idx").on(table.userId)],
);
