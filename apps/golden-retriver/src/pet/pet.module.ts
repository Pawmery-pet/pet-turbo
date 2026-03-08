import { Module } from "@nestjs/common";
import { PetController } from "./pet.controller";
import { PetRepository } from "./pet.repository";
import { PetService } from "./pet.service";
import { PetProfileRepository } from "./pet-profile.repository";
import { PetProfileService } from "./pet-profile.service";

@Module({
	controllers: [PetController],
	providers: [PetRepository, PetService, PetProfileRepository, PetProfileService],
})
export class PetModule {}
