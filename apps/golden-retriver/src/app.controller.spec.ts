import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { LoggerService } from "./logger";

describe("AppController", () => {
	let appController: AppController;
	let loggerService: LoggerService;

	beforeEach(async () => {
		const mockLogger = {
			info: jest.fn(),
			debug: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
			log: jest.fn(),
		};

		const app: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [
				AppService,
				{
					provide: LoggerService,
					useValue: mockLogger,
				},
			],
		}).compile();

		appController = app.get<AppController>(AppController);
		loggerService = app.get<LoggerService>(LoggerService);
	});

	describe("root", () => {
		it('should return "Hello World!"', () => {
			expect(appController.getHello()).toBe("Hello World!");
		});

		it("should log info messages when endpoint is called", () => {
			appController.getHello();

			expect(loggerService.info).toHaveBeenCalledWith(
				"GET / endpoint called",
				AppController.name,
			);
			expect(loggerService.info).toHaveBeenCalledWith(
				"Successfully returned hello message",
				AppController.name,
			);
		});

		it("should log debug message when fetching hello", () => {
			appController.getHello();

			expect(loggerService.debug).toHaveBeenCalledWith(
				"Fetching hello message",
				AppController.name,
			);
		});
	});
});
