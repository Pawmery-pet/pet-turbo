import { Injectable } from "@nestjs/common";
import { createId } from "@paralleldrive/cuid2";
import { PhotoRepository } from "./photo.repository";
import { PetService } from "./pet.service";
import { StorageService } from "../storage/storage.service";

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/gif": "gif",
};

@Injectable()
export class PhotoService {
	constructor(
		private readonly repo: PhotoRepository,
		private readonly petService: PetService,
		private readonly storage: StorageService,
	) {}

	async getUploadUrl(petId: string, userId: string, contentType: string) {
		await this.petService.get(petId, userId);
		const ext = CONTENT_TYPE_TO_EXT[contentType] ?? "bin";
		const key = `pets/${petId}/${createId()}.${ext}`;
		const uploadUrl = await this.storage.presignUpload(key, contentType, 300);
		return { uploadUrl, key };
	}

	async addPhoto(petId: string, userId: string, key: string, contentType: string) {
		await this.petService.get(petId, userId);
		return this.repo.create(petId, key, contentType);
	}
}
