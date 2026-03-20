import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load app-specific env so drizzle-kit can read DATABASE_URL
config({ path: ".env" });

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema/index.ts",
	out: "./drizzle",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},
});
