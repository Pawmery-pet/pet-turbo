import { Module } from "@nestjs/common";
import { PetController } from "./pet.controller";
import { PetRepository } from "./pet.repository";
import { PetService } from "./pet.service";
import { PhotoController } from "./photo.controller";
import { PhotoRepository } from "./photo.repository";
import { PhotoService } from "./photo.service";

@Module({
	controllers: [PetController, PhotoController],
	providers: [PetRepository, PetService, PhotoRepository, PhotoService],
	exports: [PetService],
})
export class PetModule {}
