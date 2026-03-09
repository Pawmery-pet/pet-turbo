jest.mock("./pet.service", () => ({ PetService: class {} }));

import { Test, type TestingModule } from "@nestjs/testing";
import { PetController } from "./pet.controller";
import { PetService } from "./pet.service";

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

const mockService = {
	create: jest.fn().mockResolvedValue(mockPet),
	list: jest.fn().mockResolvedValue([mockPet]),
	get: jest.fn().mockResolvedValue(mockPet),
	update: jest.fn().mockResolvedValue({ ...mockPet, name: "Max" }),
	remove: jest.fn().mockResolvedValue(undefined),
};

describe("PetController", () => {
	let controller: PetController;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [PetController],
			providers: [{ provide: PetService, useValue: mockService }],
		}).compile();

		controller = module.get<PetController>(PetController);
	});

	it("POST /pet - create", async () => {
		const result = await controller.create({
			userId: "user_1",
			name: "Buddy",
			type: "dog",
			breed: "Golden Retriever",
		});
		expect(result).toEqual(mockPet);
		expect(mockService.create).toHaveBeenCalledTimes(1);
	});

	it("POST /pet/list - list", async () => {
		const result = await controller.list({ userId: "user_1" });
		expect(result).toEqual([mockPet]);
		expect(mockService.list).toHaveBeenCalledWith("user_1");
	});

	it("POST /pet/:id - get", async () => {
		const result = await controller.get("pet_1", { userId: "user_1" });
		expect(result).toEqual(mockPet);
		expect(mockService.get).toHaveBeenCalledWith("pet_1", "user_1");
	});

	it("PATCH /pet/:id - update", async () => {
		const result = await controller.update("pet_1", { userId: "user_1", name: "Max" });
		expect(result.name).toBe("Max");
	});

	it("DELETE /pet/:id - remove", async () => {
		await expect(
			controller.remove("pet_1", { userId: "user_1" }),
		).resolves.not.toThrow();
	});
});
