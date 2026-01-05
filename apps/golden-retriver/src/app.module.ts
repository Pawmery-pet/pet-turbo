import {
	type ArgumentsHost,
	Catch,
	HttpException,
	Inject,
	Module,
} from "@nestjs/common";
import {
	APP_FILTER,
	APP_INTERCEPTOR,
	APP_PIPE,
	BaseExceptionFilter,
} from "@nestjs/core";
import {
	ZodSerializationException,
	ZodSerializerInterceptor,
	ZodValidationPipe,
} from "nestjs-zod";
import { ZodError } from "zod";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { LoggerModule, LoggerService } from "./logger";

@Catch(HttpException)
class HttpExceptionFilter extends BaseExceptionFilter {
	constructor(@Inject(LoggerService) private readonly logger: LoggerService) {
		super();
	}

	catch(exception: HttpException, host: ArgumentsHost) {
		if (exception instanceof ZodSerializationException) {
			const zodError = exception.getZodError();

			if (zodError instanceof ZodError) {
				this.logger.error(
					`ZodSerializationException: ${zodError.message}`,
					HttpExceptionFilter.name,
				);
			}
		}

		super.catch(exception, host);
	}
}

@Module({
	imports: [LoggerModule],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_PIPE,
			useClass: ZodValidationPipe,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ZodSerializerInterceptor,
		},
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
	],
})
export class AppModule {}
