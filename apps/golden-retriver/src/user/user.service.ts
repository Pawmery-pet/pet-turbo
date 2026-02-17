import {
	BadRequestException,
	GatewayTimeoutException,
	Injectable,
	InternalServerErrorException,
	ServiceUnavailableException,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type AuthentikUser = {
	pk: number;
	username: string;
	name: string;
	email: string;
	is_active: boolean;
	last_login: string | null;
};

@Injectable()
export class UserService {
	private readonly baseUrl: string;
	private readonly apiToken: string;
	private readonly tokenType: string;
	private readonly timeoutMs: number;
	private readonly retryCount: number;
	private readonly retryDelayMs: number;

	constructor(private readonly configService: ConfigService) {
		this.baseUrl = (
			this.configService.get<string>("AUTHENTIK_BASE_URL") ?? ""
		).replace(/\/$/, "");
		this.apiToken = this.configService.get<string>("AUTHENTIK_API_TOKEN") ?? "";
		this.tokenType =
			this.configService.get<string>("AUTHENTIK_API_TOKEN_TYPE") || "Bearer";
		this.timeoutMs = this.getNumberFromConfig("AUTHENTIK_TIMEOUT_MS", 5000);
		this.retryCount = this.getNumberFromConfig("AUTHENTIK_RETRY_COUNT", 2);
		this.retryDelayMs = this.getNumberFromConfig("AUTHENTIK_RETRY_DELAY_MS", 250);
	}

	async getUserById(userId: string) {
		if (!userId) {
			throw new BadRequestException("userId is required");
		}
		const user = await this.request<AuthentikUser>(`/api/v3/core/users/${userId}/`);
		return this.mapUser(user);
	}

	async getUserByEmail(email: string) {
		if (!email) {
			throw new BadRequestException("email is required");
		}
		const response = await this.request<{ results: AuthentikUser[] }>(
			`/api/v3/core/users/?email=${encodeURIComponent(email)}`,
		);
		const user = response.results[0] ?? null;
		return user ? this.mapUser(user) : null;
	}

	private mapUser(user: AuthentikUser) {
		return {
			id: String(user.pk),
			username: user.username,
			name: user.name,
			email: user.email,
			isActive: user.is_active,
			lastLogin: user.last_login,
		};
	}

	private async request<T>(path: string): Promise<T> {
		if (!this.baseUrl || !this.apiToken) {
			throw new ServiceUnavailableException(
				"Authentik API config is missing",
			);
		}

		let lastError: Error | null = null;
		for (let attempt = 0; attempt <= this.retryCount; attempt += 1) {
			try {
				const controller = new AbortController();
				const timeoutHandle = setTimeout(
					() => controller.abort(),
					this.timeoutMs,
				);
				const response = await fetch(`${this.baseUrl}${path}`, {
					method: "GET",
					headers: {
						Authorization: `${this.tokenType} ${this.apiToken}`,
						"Content-Type": "application/json",
					},
					signal: controller.signal,
				});
				clearTimeout(timeoutHandle);

				if (!response.ok) {
					const body = await response.text();
					if (response.status === 401 || response.status === 403) {
						throw new UnauthorizedException(
							`Authentik API auth failed: ${response.status} ${body}`,
						);
					}
					if (response.status >= 400 && response.status < 500) {
						throw new BadRequestException(
							`Authentik API request rejected: ${response.status} ${body}`,
						);
					}
					throw new InternalServerErrorException(
						`Authentik API request failed: ${response.status} ${body}`,
					);
				}

				return (await response.json()) as T;
			} catch (error) {
				if (
					error instanceof UnauthorizedException ||
					error instanceof BadRequestException
				) {
					throw error;
				}

				lastError = error as Error;
				const hasMoreAttempt = attempt < this.retryCount;
				if (!hasMoreAttempt) {
					break;
				}

				await new Promise((resolve) => {
					setTimeout(resolve, this.retryDelayMs * (attempt + 1));
				});
			}
		}

		if (lastError?.name === "AbortError") {
			throw new GatewayTimeoutException(
				`Authentik API timeout after ${this.timeoutMs}ms`,
			);
		}

		throw new ServiceUnavailableException(
			`Authentik API unavailable: ${lastError?.message ?? "unknown error"}`,
		);
	}

	private getNumberFromConfig(key: string, fallback: number) {
		const value = this.configService.get<string>(key);
		if (!value) {
			return fallback;
		}
		const parsed = Number(value);
		return Number.isNaN(parsed) ? fallback : parsed;
	}
}
