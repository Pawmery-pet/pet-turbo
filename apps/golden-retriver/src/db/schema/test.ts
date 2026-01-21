import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const test = pgTable("test", {
	testId: uuid("test_id").defaultRandom().primaryKey(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
