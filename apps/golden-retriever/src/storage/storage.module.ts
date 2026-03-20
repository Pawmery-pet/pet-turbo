import { Global, Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { AppConfigService } from "../config/app-config.service";

@Global()
@Module({
	providers: [StorageService, AppConfigService],
	exports: [StorageService],
})
export class StorageModule {}
