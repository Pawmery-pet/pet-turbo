import {
	BadRequestException,
	GatewayTimeoutException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	ServiceUnavailableException,
	UnauthorizedException,
} from "@nestjs/common";
import { AuthentikConfigService } from "../config/authentik-config.service";

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

	constructor(private readonly authentikConfig: AuthentikConfigService) {
		this.baseUrl = this.authentikConfig.getBaseUrl();
		this.apiToken = this.authentikConfig.getApiToken();
		this.tokenType = this.authentikConfig.getTokenType();
		this.timeoutMs = this.authentikConfig.getTimeoutMs();
		this.retryCount = this.authentikConfig.getRetryCount();
		this.retryDelayMs = this.authentikConfig.getRetryDelayMs();
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

	async syncUser(input: { sub?: string; email?: string }) {
		const sub = input.sub?.trim();
		const email = input.email?.trim();

		if (!sub && !email) {
			throw new BadRequestException("sync requires sub or email");
		}

		if (sub) {
			const userFromSub = await this.tryGetBySub(sub);
			if (userFromSub) {
				return {
					source: "sub",
					user: userFromSub,
				};
			}
		}

		if (email) {
			const userFromEmail = await this.getUserByEmail(email);
			if (userFromEmail) {
				return {
					source: "email",
					user: userFromEmail,
				};
			}
		}

		return {
			source: "none",
			user: null,
		};
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
				const timeoutHandle = setTimeout(() => controller.abort(), this.timeoutMs);
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
					if (response.status === 404) {
						throw new NotFoundException(
							`Authentik resource not found: ${body || path}`,
						);
					}
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
					error instanceof NotFoundException ||
					error instanceof UnauthorizedException ||
					error instanceof BadRequestException
				) {
					throw error;
				}

				lastError = error as Error;
				if (attempt >= this.retryCount) {
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
	private async tryGetBySub(sub: string) {
		const candidates = this.resolveSubjectCandidates(sub);
		for (const candidate of candidates) {
			try {
				return await this.getUserById(candidate);
			} catch (error) {
				if (error instanceof NotFoundException) {
					continue;
				}
				throw error;
			}
		}
		return null;
	}

	private resolveSubjectCandidates(sub: string) {
		const values = new Set<string>();
		values.add(sub);

		const parts = sub.split(/[|:/]/).filter(Boolean);
		const last = parts[parts.length - 1];
		if (last) {
			values.add(last);
		}

		return Array.from(values);
	}
}
