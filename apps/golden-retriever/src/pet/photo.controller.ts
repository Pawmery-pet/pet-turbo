import { Body, Controller, Param, Patch, Post } from "@nestjs/common";
import { PhotoService } from "./photo.service";
import { GetPhotoUploadUrlDto, AddPhotoDto } from "./pet.dto";

@Controller("pet")
export class PhotoController {
	constructor(private readonly service: PhotoService) {}

	@Post(":id/photos/upload-url")
	getUploadUrl(@Param("id") id: string, @Body() dto: GetPhotoUploadUrlDto) {
		return this.service.getUploadUrl(id, dto.userId, dto.contentType);
	}

	@Patch(":id/photos")
	addPhoto(@Param("id") id: string, @Body() dto: AddPhotoDto) {
		return this.service.addPhoto(id, dto.userId, dto.key, dto.contentType);
	}
}
