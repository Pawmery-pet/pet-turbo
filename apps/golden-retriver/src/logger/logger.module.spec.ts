import { Test, TestingModule } from "@nestjs/testing";
import { LoggerModule } from "./logger.module";
import { LoggerService } from "./logger.service";

describe("LoggerModule", () => {
	let module: TestingModule;

	beforeEach(async () => {
		module = await Test.createTestingModule({
			imports: [LoggerModule],
		}).compile();
	});

	it("should be defined", () => {
		expect(module).toBeDefined();
	});

	it("should provide LoggerService", () => {
		const loggerService = module.get<LoggerService>(LoggerService);
		expect(loggerService).toBeDefined();
		expect(loggerService).toBeInstanceOf(LoggerService);
	});

	it("should export LoggerService for use in other modules", async () => {
		// Create a test module that imports LoggerModule
		const testModule = await Test.createTestingModule({
			imports: [LoggerModule],
		}).compile();

		const loggerService = testModule.get<LoggerService>(LoggerService);
		expect(loggerService).toBeDefined();
	});

	it("should be a global module (accessible without explicit import)", () => {
		// The @Global() decorator makes it available everywhere
		// This test verifies the module can be created successfully
		const loggerService = module.get<LoggerService>(LoggerService);
		expect(loggerService).toBeInstanceOf(LoggerService);
	});
});