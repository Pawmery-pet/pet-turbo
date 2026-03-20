jest.mock("./photo.service", () => ({ PhotoService: class {} }));

import { Test, type TestingModule } from "@nestjs/testing";
import { PhotoController } from "./photo.controller";
import { PhotoService } from "./photo.service";

const mockResult = { uploadUrl: "https://s3.example.com/key?sig=1", key: "pets/pet_1/abc.jpg" };
const mockPhoto = { id: "photo_1", petId: "pet_1", key: "pets/pet_1/abc.jpg", contentType: "image/jpeg", createdAt: new Date() };

const mockService = {
	getUploadUrl: jest.fn().mockResolvedValue(mockResult),
	addPhoto: jest.fn().mockResolvedValue(mockPhoto),
};

describe("PhotoController", () => {
	let controller: PhotoController;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PhotoController],
			providers: [{ provide: PhotoService, useValue: mockService }],
		}).compile();
		controller = module.get<PhotoController>(PhotoController);
	});

	it("POST /pet/:id/photos/upload-url", async () => {
		const result = await controller.getUploadUrl("pet_1", { userId: "user_1", contentType: "image/jpeg" });
		expect(result).toEqual(mockResult);
		expect(mockService.getUploadUrl).toHaveBeenCalledWith("pet_1", "user_1", "image/jpeg");
	});

	it("PATCH /pet/:id/photos", async () => {
		const result = await controller.addPhoto("pet_1", { userId: "user_1", key: "pets/pet_1/abc.jpg", contentType: "image/jpeg" });
		expect(result).toEqual(mockPhoto);
		expect(mockService.addPhoto).toHaveBeenCalledWith("pet_1", "user_1", "pets/pet_1/abc.jpg", "image/jpeg");
	});
});
