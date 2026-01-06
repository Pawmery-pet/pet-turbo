import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { load } from "js-yaml";

export const yamlConfigLoader = () => {
	const configPath = join(process.cwd(), "config.yaml");

	if (!existsSync(configPath)) {
		return {};
	}

	const fileContents = readFileSync(configPath, "utf8");
	const parsed = load(fileContents);

	return typeof parsed === "object" && parsed !== null
		? (parsed as Record<string, unknown>)
		: {};
};
