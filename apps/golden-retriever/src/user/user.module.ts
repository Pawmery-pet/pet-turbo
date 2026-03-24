import { Module } from "@nestjs/common";
import { AuthentikConfigService } from "../config/authentik-config.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
	controllers: [UserController],
	providers: [AuthentikConfigService, UserService],
})
export class UserModule {}
