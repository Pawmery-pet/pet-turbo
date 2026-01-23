CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" text NOT NULL,
	"issuer" text,
	"subject" text NOT NULL,
	"email" text,
	"name" text,
	"given_name" text,
	"family_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "users_provider_subject_uq" ON "users" USING btree ("provider_id","subject");