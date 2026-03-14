import { describe, expect, it } from "vitest";
import { parseAgentResponse } from "./parse-agent-response";

describe("parseAgentResponse", () => {
	it("returns parsed object for valid JSON with message and progress", () => {
		const result = parseAgentResponse('{"message":"What is your pet\'s name?","progress":25}');
		expect(result).toEqual({ message: "What is your pet's name?", progress: 25 });
	});

	it("returns null for valid JSON missing message", () => {
		const result = parseAgentResponse('{"progress":25}');
		expect(result).toBeNull();
	});

	it("returns null for valid JSON missing progress", () => {
		const result = parseAgentResponse('{"message":"What is your pet\'s name?"}');
		expect(result).toBeNull();
	});

	it("returns null for non-JSON string", () => {
		const result = parseAgentResponse("hello world");
		expect(result).toBeNull();
	});

	it("returns null for empty string", () => {
		const result = parseAgentResponse("");
		expect(result).toBeNull();
	});

	it("returns null for progress out of range", () => {
		const result = parseAgentResponse('{"message":"hello","progress":-1}');
		expect(result).toBeNull();
	});

	it("returns null for progress above 100", () => {
		const result = parseAgentResponse('{"message":"hello","progress":101}');
		expect(result).toBeNull();
	});

	it("returns null for progress NaN", () => {
		const result = parseAgentResponse('{"message":"hello","progress":null}');
		expect(result).toBeNull();
	});

	it('returns null for JSON string "null"', () => {
		const result = parseAgentResponse("null");
		expect(result).toBeNull();
	});
});
