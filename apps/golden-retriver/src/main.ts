import { NestFactory } from "@nestjs/core";
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
	);

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

	await app.listen({
		port: Number.parseInt(process.env.PORT ?? "3030", 10),
		host: "0.0.0.0",
	});
}

bootstrap();
