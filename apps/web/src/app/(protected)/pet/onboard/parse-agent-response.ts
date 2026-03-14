export interface AgentResponse {
	message: string;
	progress: number;
}

export function parseAgentResponse(text: string): AgentResponse | null {
	if (!text) return null;

	try {
		const parsed = JSON.parse(text);
		if (
			typeof parsed === "object" &&
			parsed !== null &&
			typeof parsed.message === "string" &&
			typeof parsed.progress === "number"
		) {
			return { message: parsed.message, progress: parsed.progress };
		}
		return null;
	} catch {
		return null;
	}
}
