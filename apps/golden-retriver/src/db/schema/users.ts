import { pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable(
	"users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		providerId: text("provider_id").notNull(),
		issuer: text("issuer"),
		subject: text("subject").notNull(),
		email: text("email"),
		name: text("name"),
		givenName: text("given_name"),
		familyName: text("family_name"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
	},
	(table) => ({
		providerSubjectIdx: uniqueIndex("users_provider_subject_uq").on(
			table.providerId,
			table.subject,
		),
	}),
);
