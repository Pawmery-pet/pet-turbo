import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AppService, CreateUserDto, UserResponseDto } from "./app.service";
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

	@Post("users")
	createUser(@Body() createUserDto: CreateUserDto): UserResponseDto {
		this.logger.info("POST /users endpoint called", AppController.name);
		this.logger.debug(
			`Creating user: ${JSON.stringify(createUserDto)}`,
			AppController.name,
		);

		const user = this.appService.createUser(createUserDto);

		this.logger.info(
			`Successfully created user with id: ${user.id}`,
			AppController.name,
		);

		return user;
	}
}
