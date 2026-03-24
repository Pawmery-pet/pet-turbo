import { Module } from "@nestjs/common";
import { AuthentikConfigService } from "../config/authentik-config.service";
import { AuthentikApiService } from "./authentik-api.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
	controllers: [UserController],
	providers: [AuthentikConfigService, AuthentikApiService, UserService],
})
export class UserModule {}
