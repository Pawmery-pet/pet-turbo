import { Injectable } from "@nestjs/common";
import { LoggerService } from "./logger";

@Injectable()
export class AppService {
	constructor(private readonly logger: LoggerService) {}

	getHello(): string {
		this.logger.debug("Generating hello message", AppService.name);
		return "Hello World!";
	}
}
