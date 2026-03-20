import { NestFactory } from "@nestjs/core";
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AppConfigService } from "./config/app-config.service";

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
	);

	const appConfig = app.get(AppConfigService);

	const swaggerConfig = new DocumentBuilder()
		.setTitle("Golden Retriever API")
		.setDescription("Auto-generated API documentation")
		.setVersion("1.0.0")
		.build();

	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

	SwaggerModule.setup("swagger", app, swaggerDocument);

	app
		.getHttpAdapter()
		.getInstance()
		.get("/swagger/json", (_req, reply) => reply.send(swaggerDocument));

	const host = appConfig.getHost();
	const port = appConfig.getPort();
	const environment = appConfig.getEnvironment();

	await app.listen(port, host);
	// Basic startup log for visibility into configuration source.
	// eslint-disable-next-line no-console
	console.log(
		`Server running in ${environment} mode at http://${host}:${port}`,
	);
}

bootstrap();
