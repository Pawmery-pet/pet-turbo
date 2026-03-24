import {
	BadRequestException,
	GatewayTimeoutException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	ServiceUnavailableException,
	UnauthorizedException,
} from "@nestjs/common";
import {
	Configuration,
	CoreApi,
	type PaginatedUserList,
	type User,
} from "@goauthentik/api";
import { ResponseError } from "@goauthentik/api/src/runtime";
import { AuthentikConfigService } from "../config/authentik-config.service";

@Injectable()
export class AuthentikApiService {
	private readonly coreApi: CoreApi;
	private readonly baseUrl: string;
	private readonly apiToken: string;
	private readonly tokenType: string;
	private readonly timeoutMs: number;
	private readonly retryCount: number;
	private readonly retryDelayMs: number;

	constructor(private readonly authentikConfig: AuthentikConfigService) {
		this.baseUrl = this.authentikConfig.getBaseUrl();
		this.apiToken = this.authentikConfig.getApiToken();
		this.tokenType = this.authentikConfig.getTokenType();
		this.timeoutMs = this.authentikConfig.getTimeoutMs();
		this.retryCount = this.authentikConfig.getRetryCount();
		this.retryDelayMs = this.authentikConfig.getRetryDelayMs();

		this.coreApi = new CoreApi(
			new Configuration({
				basePath: `${this.baseUrl}/api/v3`,
				headers: this.apiToken
					? {
							Authorization: `${this.tokenType} ${this.apiToken}`,
						}
					: undefined,
			}),
		);
	}

	async getUserById(userId: string): Promise<User> {
		const parsedId = this.parseUserId(userId);
		return this.withRetry(() =>
			this.coreApi.coreUsersRetrieve(
				{ id: parsedId },
				this.withTimeout(),
			),
		);
	}

	async getUserByEmail(email: string): Promise<User | null> {
		const response = await this.withRetry(() =>
			this.coreApi.coreUsersList(
				{ email },
				this.withTimeout(),
			),
		);
		return this.getFirstUser(response);
	}

	private withTimeout(): RequestInit {
		return {
			signal: AbortSignal.timeout(this.timeoutMs),
		};
	}

	private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
		this.ensureConfigured();

		let lastError: unknown = null;
		for (let attempt = 0; attempt <= this.retryCount; attempt += 1) {
			try {
				return await operation();
			} catch (error) {
				const mappedError = await this.mapSdkError(error);
				if (
					mappedError instanceof NotFoundException ||
					mappedError instanceof UnauthorizedException ||
					mappedError instanceof BadRequestException
				) {
					throw mappedError;
				}

				lastError = mappedError;
				if (attempt >= this.retryCount) {
					break;
				}

				await new Promise((resolve) => {
					setTimeout(resolve, this.retryDelayMs * (attempt + 1));
				});
			}
		}

		if (lastError instanceof GatewayTimeoutException) {
			throw lastError;
		}

		if (lastError instanceof ServiceUnavailableException) {
			throw lastError;
		}

		throw new ServiceUnavailableException(
			`Authentik API unavailable: ${
				lastError instanceof Error ? lastError.message : "unknown error"
			}`,
		);
	}

	private ensureConfigured(): void {
		if (!this.baseUrl || !this.apiToken) {
			throw new ServiceUnavailableException("Authentik API config is missing");
		}
	}

	private parseUserId(userId: string): number {
		const parsedId = Number(userId);
		if (Number.isNaN(parsedId)) {
			throw new BadRequestException("userId must be a numeric Authentik user id");
		}
		return parsedId;
	}

	private getFirstUser(response: PaginatedUserList): User | null {
		return response.results[0] ?? null;
	}

	private async mapSdkError(error: unknown) {
		if (error instanceof ResponseError) {
			const body = await error.response.text();

			if (error.response.status === 404) {
				return new NotFoundException(
					`Authentik resource not found: ${body || error.response.url}`,
				);
			}

			if (error.response.status === 401 || error.response.status === 403) {
				return new UnauthorizedException(
					`Authentik API auth failed: ${error.response.status} ${body}`,
				);
			}

			if (error.response.status >= 400 && error.response.status < 500) {
				return new BadRequestException(
					`Authentik API request rejected: ${error.response.status} ${body}`,
				);
			}

			return new InternalServerErrorException(
				`Authentik API request failed: ${error.response.status} ${body}`,
			);
		}

		if (error instanceof Error && error.name === "TimeoutError") {
			return new GatewayTimeoutException(
				`Authentik API timeout after ${this.timeoutMs}ms`,
			);
		}

		return error;
	}
}
