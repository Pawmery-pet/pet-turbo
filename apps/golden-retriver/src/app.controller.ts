import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("App")
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

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
		return this.appService.getHello();
	}
}
