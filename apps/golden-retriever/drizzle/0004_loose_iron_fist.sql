CREATE TABLE "pet_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"pet_id" text NOT NULL,
	"key" text NOT NULL,
	"content_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "pet_photos_petId_idx" ON "pet_photos" USING btree ("pet_id");