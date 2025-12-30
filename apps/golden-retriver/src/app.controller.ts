import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { LoggerService } from "./logger";

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly logger: LoggerService,
	) {}

	@Get()
	getHello(): string {
		this.logger.info("GET / endpoint called", AppController.name);
		this.logger.debug("Fetching hello message", AppController.name);

		const message = this.appService.getHello();

		this.logger.info("Successfully returned hello message", AppController.name);

		return message;
	}
}
