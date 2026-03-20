import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service";
import { LoggerService } from "./logger";

@ApiTags("App")
@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly logger: LoggerService,
	) {}

	@ApiOperation({ summary: "Return a hello message" })
	@ApiOkResponse({
		description: "Hello message",
		schema: {
			type: "string",
			example: "Hello World!",
		},
	})
	@Get()
	getHello(): string {
		this.logger.info("GET / endpoint called", AppController.name);
		this.logger.debug("Fetching hello message", AppController.name);

		const message = this.appService.getHello();

		this.logger.info("Successfully returned hello message", AppController.name);

		return message;
	}
}
