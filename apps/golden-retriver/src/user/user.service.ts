import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	ServiceUnavailableException,
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

	constructor(private readonly configService: ConfigService) {
		this.baseUrl = (
			this.configService.get<string>("AUTHENTIK_BASE_URL") ?? ""
		).replace(/\/$/, "");
		this.apiToken = this.configService.get<string>("AUTHENTIK_API_TOKEN") ?? "";
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

		const response = await fetch(`${this.baseUrl}${path}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${this.apiToken}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const body = await response.text();
			throw new InternalServerErrorException(
				`Authentik API request failed: ${response.status} ${body}`,
			);
		}

		return (await response.json()) as T;
	}
}
