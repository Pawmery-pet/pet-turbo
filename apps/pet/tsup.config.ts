import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	splitting: false,
	clean: true,
	outDir: "dist",
	format: "cjs",
	target: "node22",
	minify: true,
	bundle: true,
});
