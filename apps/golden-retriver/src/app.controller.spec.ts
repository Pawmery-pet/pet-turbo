import { Test, type TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService, CreateUserDto } from "./app.service";
import { LoggerService } from "./logger";

describe("AppController", () => {
	let appController: AppController;
	let appService: AppService;
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
		appService = app.get<AppService>(AppService);
		loggerService = app.get<LoggerService>(LoggerService);
	});

	describe("GET /", () => {
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

	describe("POST /users", () => {
		it("should create and return a user", () => {
			const createUserDto: CreateUserDto = {
				name: "John Doe",
				email: "john@example.com",
				age: 25,
			};

			const result = appController.createUser(createUserDto);

			expect(result).toMatchObject({
				name: "John Doe",
				email: "john@example.com",
				age: 25,
			});
			expect(result.id).toBeDefined();
			expect(result.createdAt).toBeDefined();
		});

		it("should log info and debug messages", () => {
			const createUserDto: CreateUserDto = {
				name: "John Doe",
				email: "john@example.com",
				age: 25,
			};

			appController.createUser(createUserDto);

			expect(loggerService.info).toHaveBeenCalledWith(
				"POST /users endpoint called",
				AppController.name,
			);
			expect(loggerService.debug).toHaveBeenCalled();
			expect(loggerService.info).toHaveBeenCalledWith(
				expect.stringContaining("Successfully created user with id:"),
				AppController.name,
			);
		});
	});

	describe("POST /users", () => {
		it("should create and return a user", () => {
			const createUserDto: CreateUserDto = {
				name: "John Doe",
				email: "john@example.com",
				age: 25,
			};

			const result = appController.createUser(createUserDto);

			expect(result).toMatchObject({
				name: "John Doe",
				email: "john@example.com",
				age: 25,
			});
			expect(result.id).toBeDefined();
			expect(result.createdAt).toBeDefined();
		});

		it("should log info and debug messages", () => {
			const createUserDto: CreateUserDto = {
				name: "John Doe",
				email: "john@example.com",
				age: 25,
			};

			appController.createUser(createUserDto);

			expect(loggerService.info).toHaveBeenCalledWith(
				"POST /users endpoint called",
				AppController.name,
			);
			expect(loggerService.debug).toHaveBeenCalled();
			expect(loggerService.info).toHaveBeenCalledWith(
				expect.stringContaining("Successfully created user with id:"),
				AppController.name,
			);
		});
	});
});
