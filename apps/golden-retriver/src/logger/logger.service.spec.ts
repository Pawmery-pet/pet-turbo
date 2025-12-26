import { LoggerService } from "./logger.service";

describe("LoggerService", () => {
	let logger: LoggerService;
	let stdoutSpy: jest.SpyInstance;
	let stderrSpy: jest.SpyInstance;
	let originalEnv: string | undefined;

	beforeEach(() => {
		// Save original NODE_ENV
		originalEnv = process.env.NODE_ENV;

		// Spy on stdout and stderr
		stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation();
		stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation();
	});

	afterEach(() => {
		// Restore original NODE_ENV
		if (originalEnv === undefined) {
			delete process.env.NODE_ENV;
		} else {
			process.env.NODE_ENV = originalEnv;
		}

		// Restore spies
		stdoutSpy.mockRestore();
		stderrSpy.mockRestore();
	});

	describe("Production Environment", () => {
		beforeEach(() => {
			process.env.NODE_ENV = "production";
			logger = new LoggerService();
		});

		it("should log info messages as JSON", () => {
			logger.info("Test info message", "TestContext");

			expect(stdoutSpy).toHaveBeenCalledTimes(1);
			const output = stdoutSpy.mock.calls[0][0];
			const logObject = JSON.parse(output);

			expect(logObject).toMatchObject({
				level: "info",
				message: "Test info message",
				context: "TestContext",
			});
			expect(logObject.timestamp).toBeDefined();
		});

		it("should log debug messages as JSON", () => {
			logger.debug("Test debug message", "DebugContext");

			expect(stdoutSpy).toHaveBeenCalledTimes(1);
			const output = stdoutSpy.mock.calls[0][0];
			const logObject = JSON.parse(output);

			expect(logObject).toMatchObject({
				level: "debug",
				message: "Test debug message",
				context: "DebugContext",
			});
		});

		it("should log warn messages as JSON", () => {
			logger.warn("Test warning message", "WarnContext");

			expect(stdoutSpy).toHaveBeenCalledTimes(1);
			const output = stdoutSpy.mock.calls[0][0];
			const logObject = JSON.parse(output);

			expect(logObject).toMatchObject({
				level: "warn",
				message: "Test warning message",
				context: "WarnContext",
			});
		});

		it("should log error messages to stderr as JSON", () => {
			logger.error("Test error message", "Error stack trace", "ErrorContext");

			expect(stderrSpy).toHaveBeenCalledTimes(1);
			expect(stdoutSpy).not.toHaveBeenCalled();

			const output = stderrSpy.mock.calls[0][0];
			const logObject = JSON.parse(output);

			expect(logObject).toMatchObject({
				level: "error",
				message: "Test error message",
				context: "ErrorContext",
				trace: "Error stack trace",
			});
		});

		it("should log without context if not provided", () => {
			logger.info("Message without context");

			const output = stdoutSpy.mock.calls[0][0];
			const logObject = JSON.parse(output);

			expect(logObject).toMatchObject({
				level: "info",
				message: "Message without context",
			});
			expect(logObject.context).toBeUndefined();
		});

		it("should include timestamp in ISO format", () => {
			logger.info("Test timestamp", "Context");

			const output = stdoutSpy.mock.calls[0][0];
			const logObject = JSON.parse(output);

			expect(logObject.timestamp).toMatch(
				/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
			);
		});

		it("should handle log method as alias for info", () => {
			logger.log("Test log message", "LogContext");

			const output = stdoutSpy.mock.calls[0][0];
			const logObject = JSON.parse(output);

			expect(logObject).toMatchObject({
				level: "info",
				message: "Test log message",
				context: "LogContext",
			});
		});
	});

	describe("Staging Environment", () => {
		beforeEach(() => {
			process.env.NODE_ENV = "staging";
			logger = new LoggerService();
		});

		it("should use JSON format in staging environment", () => {
			logger.info("Staging test", "StagingContext");

			expect(stdoutSpy).toHaveBeenCalledTimes(1);
			const output = stdoutSpy.mock.calls[0][0];
			const logObject = JSON.parse(output);

			expect(logObject).toMatchObject({
				level: "info",
				message: "Staging test",
				context: "StagingContext",
			});
		});
	});

	describe("Development Environment", () => {
		beforeEach(() => {
			delete process.env.NODE_ENV;
			logger = new LoggerService();
		});

		it("should not output JSON in development mode", () => {
			logger.info("Dev info message", "DevContext");

			// In development, it should NOT write JSON to stdout
			if (stdoutSpy.mock.calls.length > 0) {
				const output = stdoutSpy.mock.calls[0][0];
				// If there's output, it should not be JSON format
				expect(() => JSON.parse(output)).toThrow();
			}
		});

		it("should use human-readable format for debug", () => {
			logger.debug("Dev debug message", "DevContext");

			// Verify it's not JSON (human-readable instead)
			if (stdoutSpy.mock.calls.length > 0) {
				const output = stdoutSpy.mock.calls[0][0];
				expect(() => JSON.parse(output)).toThrow();
			}
		});

		it("should use human-readable format for warn", () => {
			logger.warn("Dev warn message", "DevContext");

			// Verify it's not JSON
			if (stdoutSpy.mock.calls.length > 0) {
				const output = stdoutSpy.mock.calls[0][0];
				expect(() => JSON.parse(output)).toThrow();
			}
		});

		it("should use human-readable format for error", () => {
			logger.error("Dev error message", "stack trace", "DevContext");

			// Verify it's not JSON
			if (stderrSpy.mock.calls.length > 0) {
				const output = stderrSpy.mock.calls[0][0];
				expect(() => JSON.parse(output)).toThrow();
			}
		});

		it("should be in development mode when NODE_ENV is not set", () => {
			const isProduction = (logger as any).isProduction;
			expect(isProduction).toBe(false);
		});

		it("should be in development mode when NODE_ENV is development", () => {
			process.env.NODE_ENV = "development";
			const devLogger = new LoggerService();
			const isProduction = (devLogger as any).isProduction;
			expect(isProduction).toBe(false);
		});
	});

	describe("JSON Output Format Validation", () => {
		beforeEach(() => {
			process.env.NODE_ENV = "production";
			logger = new LoggerService();
		});

		it("should output valid JSON that can be parsed", () => {
			logger.info("JSON validation test", "ValidationContext");

			const output = stdoutSpy.mock.calls[0][0];
			expect(() => JSON.parse(output)).not.toThrow();
		});

		it("should end JSON output with newline", () => {
			logger.info("Newline test", "Context");

			const output = stdoutSpy.mock.calls[0][0];
			expect(output).toMatch(/\n$/);
		});

		it("should handle special characters in messages", () => {
			const specialMessage = 'Message with "quotes" and \nnewlines\t and tabs';
			logger.info(specialMessage, "SpecialContext");

			const output = stdoutSpy.mock.calls[0][0];
			const logObject = JSON.parse(output);

			expect(logObject.message).toBe(specialMessage);
		});

		it("should handle error trace with newlines", () => {
			const errorTrace =
				"Error: Something went wrong\n    at line 1\n    at line 2";
			logger.error("Error occurred", errorTrace, "ErrorContext");

			const output = stderrSpy.mock.calls[0][0];
			const logObject = JSON.parse(output);

			expect(logObject.trace).toBe(errorTrace);
		});
	});

	describe("Edge Cases", () => {
		beforeEach(() => {
			process.env.NODE_ENV = "production";
			logger = new LoggerService();
		});

		it("should handle empty string messages", () => {
			logger.info("", "Context");

			const output = stdoutSpy.mock.calls[0][0];
			const logObject = JSON.parse(output);

			expect(logObject.message).toBe("");
		});

		it("should handle undefined trace in error logs", () => {
			logger.error("Error without trace", undefined, "ErrorContext");

			const output = stderrSpy.mock.calls[0][0];
			const logObject = JSON.parse(output);

			expect(logObject).toMatchObject({
				level: "error",
				message: "Error without trace",
				context: "ErrorContext",
			});
			expect(logObject.trace).toBeUndefined();
		});

		it("should handle multiple consecutive log calls", () => {
			logger.info("First message", "Context1");
			logger.debug("Second message", "Context2");
			logger.warn("Third message", "Context3");

			expect(stdoutSpy).toHaveBeenCalledTimes(3);

			const log1 = JSON.parse(stdoutSpy.mock.calls[0][0]);
			const log2 = JSON.parse(stdoutSpy.mock.calls[1][0]);
			const log3 = JSON.parse(stdoutSpy.mock.calls[2][0]);

			expect(log1.message).toBe("First message");
			expect(log2.message).toBe("Second message");
			expect(log3.message).toBe("Third message");
		});
	});
});
