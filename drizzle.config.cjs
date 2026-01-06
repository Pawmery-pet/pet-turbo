const { config } = require("dotenv");
const { defineConfig } = require("drizzle-kit");
const { resolve } = require("path");

// Load app-specific env so drizzle-kit can read DATABASE_URL
config({ path: "./apps/golden-retriver/.env" });

module.exports = defineConfig({
	dialect: "postgresql",
	schema: resolve(__dirname, "./apps/golden-retriver/src/db/schema/index.ts"),
	out: resolve(__dirname, "./apps/golden-retriver/drizzle"),
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},
});
