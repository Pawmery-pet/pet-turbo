import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { User } from "@goauthentik/api";
import { AuthentikApiService } from "./authentik-api.service";

@Injectable()
export class UserService {
	constructor(private readonly authentikApi: AuthentikApiService) {}

	async getUserById(userId: string) {
		if (!userId) {
			throw new BadRequestException("userId is required");
		}
		const user = await this.authentikApi.getUserById(userId);
		return this.mapUser(user);
	}

	async getUserByEmail(email: string) {
		if (!email) {
			throw new BadRequestException("email is required");
		}
		const user = await this.authentikApi.getUserByEmail(email);
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

	private mapUser(user: User) {
		return {
			id: String(user.pk),
			username: user.username,
			name: user.name,
			email: user.email,
			isActive: user.isActive ?? false,
			lastLogin: user.lastLogin ?? null,
		};
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
