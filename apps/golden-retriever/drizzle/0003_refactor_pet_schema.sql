ALTER TYPE "public"."pet_type" ADD VALUE 'rabbit';--> statement-breakpoint
ALTER TYPE "public"."pet_type" ADD VALUE 'sheep';--> statement-breakpoint
ALTER TABLE "pet" ADD COLUMN "narrative" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pet" DROP COLUMN "status";--> statement-breakpoint
DROP TYPE "public"."pet_status";