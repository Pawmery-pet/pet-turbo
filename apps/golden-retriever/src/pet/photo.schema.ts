import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const petPhoto = pgTable(
	"pet_photos",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		petId: text("pet_id").notNull(),
		key: text("key").notNull(),
		contentType: text("content_type").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [index("pet_photos_petId_idx").on(table.petId)],
);
