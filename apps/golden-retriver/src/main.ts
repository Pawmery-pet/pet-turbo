import { NestFactory } from "@nestjs/core";
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { LoggerService } from "./logger";

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
		{
			bufferLogs: true,
		},
	);

	// Use our custom logger throughout the application
	app.useLogger(app.get(LoggerService));

	await app.listen(process.env.PORT ?? 3010);
}

bootstrap();
