import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_RETRY_COUNT = 2;
const DEFAULT_RETRY_DELAY_MS = 250;
const DEFAULT_TOKEN_TYPE = "Bearer";

@Injectable()
export class AuthentikConfigService {
	constructor(private readonly configService: ConfigService) {}

	getBaseUrl(): string {
		return (
			this.configService.get<string>("AUTHENTIK_BASE_URL") ?? ""
		).replace(/\/$/, "");
	}

	getApiToken(): string {
		return this.configService.get<string>("AUTHENTIK_API_TOKEN") ?? "";
	}

	getTokenType(): string {
		return (
			this.configService.get<string>("AUTHENTIK_API_TOKEN_TYPE") ??
			DEFAULT_TOKEN_TYPE
		);
	}

	getTimeoutMs(): number {
		return this.getNumberFromConfig("AUTHENTIK_TIMEOUT_MS", DEFAULT_TIMEOUT_MS);
	}

	getRetryCount(): number {
		return this.getNumberFromConfig(
			"AUTHENTIK_RETRY_COUNT",
			DEFAULT_RETRY_COUNT,
		);
	}

	getRetryDelayMs(): number {
		return this.getNumberFromConfig(
			"AUTHENTIK_RETRY_DELAY_MS",
			DEFAULT_RETRY_DELAY_MS,
		);
	}

	private getNumberFromConfig(key: string, fallback: number): number {
		const value = this.configService.get<string>(key);
		if (!value) {
			return fallback;
		}

		const parsed = Number(value);
		return Number.isNaN(parsed) ? fallback : parsed;
	}
}
