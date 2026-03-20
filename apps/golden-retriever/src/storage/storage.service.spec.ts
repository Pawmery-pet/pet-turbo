jest.mock("@aws-sdk/client-s3");
jest.mock("@aws-sdk/s3-request-presigner");

import { Test, type TestingModule } from "@nestjs/testing";
import { StorageService } from "./storage.service";
import { AppConfigService } from "../config/app-config.service";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const mockConfig = {
	getAwsRegion: jest.fn().mockReturnValue("us-east-1"),
	getAwsAccessKeyId: jest.fn().mockReturnValue("test-key"),
	getAwsSecretAccessKey: jest.fn().mockReturnValue("test-secret"),
	getS3Bucket: jest.fn().mockReturnValue("pawmery-dev"),
};

const mockSignedUrl = "https://s3.amazonaws.com/pawmery-dev/pets/pet_1/abc.jpg?signed=1";

describe("StorageService", () => {
	let service: StorageService;

	beforeEach(async () => {
		jest.clearAllMocks();
		(getSignedUrl as jest.Mock).mockResolvedValue(mockSignedUrl);

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				StorageService,
				{ provide: AppConfigService, useValue: mockConfig },
			],
		}).compile();

		service = module.get<StorageService>(StorageService);
	});

	describe("presignUpload", () => {
		it("should return a signed URL", async () => {
			const url = await service.presignUpload("pets/pet_1/abc.jpg", "image/jpeg", 300);
			expect(url).toBe(mockSignedUrl);
			expect(getSignedUrl).toHaveBeenCalledTimes(1);
		});
	});
});
