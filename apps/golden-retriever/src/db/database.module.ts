import { Global, Injectable, Module, OnModuleDestroy } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { DRIZZLE } from "./db.constants";

@Injectable()
class PgPoolProvider implements OnModuleDestroy {
	public readonly pool: Pool;

	constructor(config: ConfigService) {
		const connectionString = config.get<string>("DATABASE_URL");
		if (!connectionString) {
			throw new Error("DATABASE_URL is not set");
		}

		this.pool = new Pool({ connectionString });
	}

	async onModuleDestroy(): Promise<void> {
		await this.pool.end();
	}
}

@Global()
@Module({
	imports: [
		// Load env vars once; isGlobal keeps ConfigService available app-wide
		ConfigModule.forRoot({ isGlobal: true }),
	],
	providers: [
		{
			provide: PgPoolProvider,
			inject: [ConfigService],
			useFactory: (config: ConfigService) => new PgPoolProvider(config),
		},
		{
			provide: DRIZZLE,
			inject: [PgPoolProvider],
			useFactory: (poolProvider: PgPoolProvider) => drizzle(poolProvider.pool, { schema }),
		},
	],
	exports: [DRIZZLE],
})
export class DatabaseModule {}
