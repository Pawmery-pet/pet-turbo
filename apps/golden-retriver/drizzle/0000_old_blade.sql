-- Enable pgcrypto for gen_random_uuid used by defaultRandom()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "test" (
	"test_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
