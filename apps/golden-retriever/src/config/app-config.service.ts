import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_PORT = 3000;
const DEFAULT_ENVIRONMENT = "development";

@Injectable()
export class AppConfigService {
	constructor(private readonly configService: ConfigService) {}

	getHost(): string {
		return (
			this.configService.get<string>("host") ??
			this.configService.get<string>("HOST") ??
			DEFAULT_HOST
		);
	}

	getPort(): number {
		const port =
			this.configService.get<number>("port") ??
			this.configService.get<number>("PORT") ??
			DEFAULT_PORT;

		const parsed = Number(port);

		return Number.isNaN(parsed) ? DEFAULT_PORT : parsed;
	}

	getEnvironment(): string {
		return (
			this.configService.get<string>("environment") ??
			this.configService.get<string>("ENVIRONMENT") ??
			this.configService.get<string>("NODE_ENV") ??
			DEFAULT_ENVIRONMENT
		);
	}

	getAwsRegion(): string | undefined {
		return this.configService.get<string>("AWS_REGION");
	}

	getAwsAccessKeyId(): string | undefined {
		return this.configService.get<string>("AWS_ACCESS_KEY_ID");
	}

	getAwsSecretAccessKey(): string | undefined {
		return this.configService.get<string>("AWS_SECRET_ACCESS_KEY");
	}

	getS3Bucket(): string {
		const val = this.configService.get<string>("S3_BUCKET");
		if (!val) throw new Error("S3_BUCKET is not set");
		return val;
	}
}
