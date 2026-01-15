import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";
import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
	let app: INestApplication<App>;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	describe("GET /", () => {
		it("should return Hello World", () => {
			return request(app.getHttpServer())
				.get("/")
				.expect(200)
				.expect("Hello World!");
		});
	});

	describe("POST /users", () => {
		describe("valid input", () => {
			it("should create user with valid data", async () => {
				const response = await request(app.getHttpServer())
					.post("/users")
					.send({
						name: "John Doe",
						email: "john@example.com",
						age: 25,
					})
					.expect(201);

				expect(response.body).toMatchObject({
					name: "John Doe",
					email: "john@example.com",
					age: 25,
				});
				expect(response.body.id).toBeDefined();
				expect(response.body.createdAt).toBeDefined();
			});

			it("should accept minimum valid age (0)", async () => {
				const response = await request(app.getHttpServer())
					.post("/users")
					.send({
						name: "Baby User",
						email: "baby@example.com",
						age: 0,
					})
					.expect(201);

				expect(response.body.age).toBe(0);
			});

			it("should accept maximum valid age (150)", async () => {
				const response = await request(app.getHttpServer())
					.post("/users")
					.send({
						name: "Old User",
						email: "old@example.com",
						age: 150,
					})
					.expect(201);

				expect(response.body.age).toBe(150);
			});
		});

		describe("invalid input - validation errors", () => {
			it("should return 400 for invalid email format", async () => {
				const response = await request(app.getHttpServer())
					.post("/users")
					.send({
						name: "John",
						email: "not-an-email",
						age: 25,
					})
					.expect(400);

				expect(response.body.statusCode).toBe(400);
				expect(response.body.message).toBeDefined();
			});

			it("should return 400 for missing name", async () => {
				const response = await request(app.getHttpServer())
					.post("/users")
					.send({
						email: "john@example.com",
						age: 25,
					})
					.expect(400);

				expect(response.body.statusCode).toBe(400);
			});

			it("should return 400 for missing email", async () => {
				const response = await request(app.getHttpServer())
					.post("/users")
					.send({
						name: "John",
						age: 25,
					})
					.expect(400);

				expect(response.body.statusCode).toBe(400);
			});

			it("should return 400 for missing age", async () => {
				const response = await request(app.getHttpServer())
					.post("/users")
					.send({
						name: "John",
						email: "john@example.com",
					})
					.expect(400);

				expect(response.body.statusCode).toBe(400);
			});

			it("should return 400 for empty name", async () => {
				const response = await request(app.getHttpServer())
					.post("/users")
					.send({
						name: "",
						email: "john@example.com",
						age: 25,
					})
					.expect(400);

				expect(response.body.statusCode).toBe(400);
			});

			it("should return 400 for name too long (>100 chars)", async () => {
				const response = await request(app.getHttpServer())
					.post("/users")
					.send({
						name: "a".repeat(101),
						email: "john@example.com",
						age: 25,
					})
					.expect(400);

				expect(response.body.statusCode).toBe(400);
			});

			it("should return 400 for negative age", async () => {
				const response = await request(app.getHttpServer())
					.post("/users")
					.send({
						name: "John",
						email: "john@example.com",
						age: -5,
					})
					.expect(400);

				expect(response.body.statusCode).toBe(400);
			});

			it("should return 400 for age above maximum (>150)", async () => {
				const response = await request(app.getHttpServer())
					.post("/users")
					.send({
						name: "John",
						email: "john@example.com",
						age: 151,
					})
					.expect(400);

				expect(response.body.statusCode).toBe(400);
			});

			it("should return 400 for non-integer age", async () => {
				const response = await request(app.getHttpServer())
					.post("/users")
					.send({
						name: "John",
						email: "john@example.com",
						age: 25.5,
					})
					.expect(400);

				expect(response.body.statusCode).toBe(400);
			});

			it("should return 400 for string age instead of number", async () => {
				const response = await request(app.getHttpServer())
					.post("/users")
					.send({
						name: "John",
						email: "john@example.com",
						age: "25",
					})
					.expect(400);

				expect(response.body.statusCode).toBe(400);
			});
		});
	});
});
