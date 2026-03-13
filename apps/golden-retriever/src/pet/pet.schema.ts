import { pgEnum, pgTable, text, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const petTypeEnum = pgEnum("pet_type", ["dog", "cat", "bird", "rabbit", "sheep"]);
export const petStatusEnum = pgEnum("pet_status", ["registered", "active"]);

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
		status: petStatusEnum("status").notNull().default("registered"),
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

export const petProfile = pgTable(
	"pet_profile",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		petId: text("pet_id")
			.notNull()
			.references(() => pet.id),
		traits: jsonb("traits").notNull().$type<Record<string, number>>(),
		narrative: text("narrative").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [index("pet_profile_petId_idx").on(table.petId)],
);
