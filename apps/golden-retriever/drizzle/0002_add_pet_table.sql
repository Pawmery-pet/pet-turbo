CREATE TYPE "public"."pet_status" AS ENUM('registered', 'survey_started', 'activated');--> statement-breakpoint
CREATE TYPE "public"."pet_type" AS ENUM('dog', 'cat', 'bird');--> statement-breakpoint
CREATE TABLE "pet" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "pet_type" NOT NULL,
	"breed" text NOT NULL,
	"status" "pet_status" DEFAULT 'registered' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "pet_userId_idx" ON "pet" USING btree ("user_id");