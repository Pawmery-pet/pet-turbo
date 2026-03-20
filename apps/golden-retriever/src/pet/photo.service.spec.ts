jest.mock("./photo.repository", () => ({ PhotoRepository: class {} }));
jest.mock("./pet.service", () => ({ PetService: class {} }));
jest.mock("../storage/storage.service", () => ({ StorageService: class {} }));

import { Test, type TestingModule } from "@nestjs/testing";
import { PhotoService } from "./photo.service";
import { PhotoRepository } from "./photo.repository";
import { PetService } from "./pet.service";
import { StorageService } from "../storage/storage.service";

const mockPhoto = {
	id: "photo_1",
	petId: "pet_1",
	key: "pets/pet_1/abc.jpg",
	contentType: "image/jpeg",
	createdAt: new Date(),
};
const mockSignedUrl = "https://s3.amazonaws.com/bucket/pets/pet_1/abc.jpg?signed=1";

const mockPetService = { get: jest.fn().mockResolvedValue({ id: "pet_1", userId: "user_1" }) };
const mockPhotoRepo = { create: jest.fn().mockResolvedValue(mockPhoto) };
const mockStorage = { presignUpload: jest.fn().mockResolvedValue(mockSignedUrl) };

describe("PhotoService", () => {
	let service: PhotoService;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PhotoService,
				{ provide: PhotoRepository, useValue: mockPhotoRepo },
				{ provide: PetService, useValue: mockPetService },
				{ provide: StorageService, useValue: mockStorage },
			],
		}).compile();
		service = module.get<PhotoService>(PhotoService);
	});

	it("getUploadUrl — verifies ownership and returns url + key", async () => {
		const result = await service.getUploadUrl("pet_1", "user_1", "image/jpeg");
		expect(mockPetService.get).toHaveBeenCalledWith("pet_1", "user_1");
		expect(mockStorage.presignUpload).toHaveBeenCalledTimes(1);
		expect(result).toMatchObject({
			uploadUrl: mockSignedUrl,
			key: expect.stringContaining("pets/pet_1/"),
		});
	});

	it("addPhoto — verifies ownership and persists record", async () => {
		const result = await service.addPhoto("pet_1", "user_1", "pets/pet_1/abc.jpg", "image/jpeg");
		expect(mockPetService.get).toHaveBeenCalledWith("pet_1", "user_1");
		expect(mockPhotoRepo.create).toHaveBeenCalledWith("pet_1", "pets/pet_1/abc.jpg", "image/jpeg");
		expect(result).toEqual(mockPhoto);
	});
});
