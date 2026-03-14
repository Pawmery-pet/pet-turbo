import { Module } from "@nestjs/common";
import { PetController } from "./pet.controller";
import { PetRepository } from "./pet.repository";
import { PetService } from "./pet.service";

@Module({
	controllers: [PetController],
	providers: [PetRepository, PetService],
})
export class PetModule {}
