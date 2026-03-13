jest.mock("./pet.repository", () => ({ PetRepository: class {} }));
import { Test, type TestingModule } from "@nestjs/testing";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PetService } from "./pet.service";
import { PetRepository } from "./pet.repository";

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

const mockRepo = {
	create: jest.fn().mockResolvedValue(mockPet),
	findAllByUser: jest.fn().mockResolvedValue([mockPet]),
	findById: jest.fn().mockResolvedValue(mockPet),
	update: jest.fn().mockResolvedValue({ ...mockPet, name: "Max" }),
	remove: jest.fn().mockResolvedValue(undefined),
};

describe("PetService", () => {
	let service: PetService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PetService,
				{ provide: PetRepository, useValue: mockRepo },
			],
		}).compile();

		service = module.get<PetService>(PetService);
	});

	describe("create", () => {
		it("should create and return a pet", async () => {
			const result = await service.create({
				userId: "user_1",
				name: "Buddy",
				type: "dog",
				breed: "Golden Retriever",
			});
			expect(result).toEqual(mockPet);
			expect(mockRepo.create).toHaveBeenCalledTimes(1);
		});
	});

	describe("list", () => {
		it("should return pets for a user", async () => {
			const result = await service.list("user_1");
			expect(result).toEqual([mockPet]);
			expect(mockRepo.findAllByUser).toHaveBeenCalledWith("user_1");
		});
	});

	describe("get", () => {
		it("should return a pet for the correct user", async () => {
			const result = await service.get("pet_1", "user_1");
			expect(result).toEqual(mockPet);
		});

		it("should throw NotFoundException if pet not found", async () => {
			mockRepo.findById.mockResolvedValueOnce(null);
			await expect(service.get("pet_999", "user_1")).rejects.toThrow(NotFoundException);
		});

		it("should throw ForbiddenException if pet belongs to another user", async () => {
			mockRepo.findById.mockResolvedValueOnce({ ...mockPet, userId: "user_2" });
			await expect(service.get("pet_1", "user_1")).rejects.toThrow(ForbiddenException);
		});
	});

	describe("update", () => {
		it("should update and return the pet", async () => {
			const result = await service.update("pet_1", "user_1", { name: "Max" });
			expect(result.name).toBe("Max");
		});
	});

	describe("remove", () => {
		it("should remove the pet", async () => {
			await expect(service.remove("pet_1", "user_1")).resolves.not.toThrow();
		});
	});
});
