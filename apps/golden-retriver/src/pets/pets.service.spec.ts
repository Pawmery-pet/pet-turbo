import { Test, type TestingModule } from "@nestjs/testing";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { PetsService } from "./pets.service";
import { DRIZZLE } from "../db/db.constants";

const mockPet = {
	id: "pet_1",
	userId: "user_1",
	name: "Buddy",
	type: "dog" as const,
	breed: "Golden Retriever",
	status: "registered" as const,
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockDb = {
	insert: jest.fn(),
	select: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
};

describe("PetsService", () => {
	let service: PetsService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PetsService,
				{ provide: DRIZZLE, useValue: mockDb },
			],
		}).compile();

		service = module.get<PetsService>(PetsService);
	});

	describe("create", () => {
		it("should create and return a pet", async () => {
			const returning = jest.fn().mockResolvedValue([mockPet]);
			const values = jest.fn().mockReturnValue({ returning });
			mockDb.insert.mockReturnValue({ values });

			const result = await service.create({
				userId: "user_1",
				name: "Buddy",
				type: "dog",
				breed: "Golden Retriever",
			});

			expect(result).toEqual(mockPet);
		});
	});

	describe("list", () => {
		it("should return pets for a user", async () => {
			const where = jest.fn().mockResolvedValue([mockPet]);
			const from = jest.fn().mockReturnValue({ where });
			mockDb.select.mockReturnValue({ from });

			const result = await service.list("user_1");

			expect(result).toEqual([mockPet]);
		});
	});

	describe("get", () => {
		it("should return a pet by id for the correct user", async () => {
			const limit = jest.fn().mockResolvedValue([mockPet]);
			const where = jest.fn().mockReturnValue({ limit });
			const from = jest.fn().mockReturnValue({ where });
			mockDb.select.mockReturnValue({ from });

			const result = await service.get("pet_1", "user_1");

			expect(result).toEqual(mockPet);
		});

		it("should throw NotFoundException if pet not found", async () => {
			const limit = jest.fn().mockResolvedValue([]);
			const where = jest.fn().mockReturnValue({ limit });
			const from = jest.fn().mockReturnValue({ where });
			mockDb.select.mockReturnValue({ from });

			await expect(service.get("pet_999", "user_1")).rejects.toThrow(
				NotFoundException,
			);
		});

		it("should throw ForbiddenException if pet belongs to another user", async () => {
			const limit = jest.fn().mockResolvedValue([{ ...mockPet, userId: "user_2" }]);
			const where = jest.fn().mockReturnValue({ limit });
			const from = jest.fn().mockReturnValue({ where });
			mockDb.select.mockReturnValue({ from });

			await expect(service.get("pet_1", "user_1")).rejects.toThrow(
				ForbiddenException,
			);
		});
	});

	describe("update", () => {
		it("should update and return the pet", async () => {
			const limit = jest.fn().mockResolvedValue([mockPet]);
			const where = jest.fn().mockReturnValue({ limit });
			const from = jest.fn().mockReturnValue({ where });
			mockDb.select.mockReturnValue({ from });

			const returning = jest.fn().mockResolvedValue([{ ...mockPet, name: "Max" }]);
			const whereUpdate = jest.fn().mockReturnValue({ returning });
			const set = jest.fn().mockReturnValue({ where: whereUpdate });
			mockDb.update.mockReturnValue({ set });

			const result = await service.update("pet_1", "user_1", { name: "Max" });

			expect(result.name).toBe("Max");
		});
	});

	describe("remove", () => {
		it("should delete the pet", async () => {
			const limit = jest.fn().mockResolvedValue([mockPet]);
			const where = jest.fn().mockReturnValue({ limit });
			const from = jest.fn().mockReturnValue({ where });
			mockDb.select.mockReturnValue({ from });

			const whereDelete = jest.fn().mockResolvedValue(undefined);
			mockDb.delete.mockReturnValue({ where: whereDelete });

			await expect(service.remove("pet_1", "user_1")).resolves.not.toThrow();
		});
	});
});
