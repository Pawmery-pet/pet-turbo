import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { User } from "@goauthentik/api";
import { AuthentikApiService } from "./authentik-api.service";

type ParsedIdentityClaims = {
	sub?: string;
	email?: string;
	preferredUsername?: string;
	username?: string;
	authentikUserId?: string;
	authentikUserUuid?: string;
};

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

	async syncUser(input: { idToken?: string; sub?: string; email?: string }) {
		const tokenPayload = input.idToken
			? this.parseIdTokenPayload(input.idToken)
			: null;
		const sub = tokenPayload?.sub ?? input.sub?.trim();
		const email = tokenPayload?.email ?? input.email?.trim();

		if (!sub && !email) {
			throw new BadRequestException("sync requires idToken, sub, or email");
		}

		if (tokenPayload) {
			const resolvedUser = await this.resolveUserFromClaims(tokenPayload);
			if (resolvedUser) {
				return resolvedUser;
			}
		}

		if (!tokenPayload && sub) {
			const userFromSubject = await this.tryGetByOpaqueSubject(sub);
			if (userFromSubject) {
				return {
					source: "sub",
					user: userFromSubject,
				};
			}
		}

		if (email) {
			const userFromEmail = await this.getUserByEmail(email);
			if (userFromEmail) {
				return {
					source: tokenPayload ? "idToken.email" : "email",
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

	private parseIdTokenPayload(idToken: string): ParsedIdentityClaims {
		const token = idToken.trim();
		const parts = token.split(".");
		if (parts.length < 2) {
			throw new BadRequestException("idToken is not a valid JWT");
		}

		try {
			const payloadJson = Buffer.from(parts[1], "base64url").toString("utf8");
			const payload = JSON.parse(payloadJson) as {
				sub?: unknown;
				email?: unknown;
				preferred_username?: unknown;
				username?: unknown;
				authentik_user_id?: unknown;
				authentik_user_uuid?: unknown;
				user_id?: unknown;
				user_uuid?: unknown;
				uuid?: unknown;
			};

			return {
				sub: this.getStringClaim(payload.sub),
				email: this.getStringClaim(payload.email),
				preferredUsername: this.getStringClaim(payload.preferred_username),
				username: this.getStringClaim(payload.username),
				authentikUserId:
					this.getStringClaim(payload.authentik_user_id) ??
					this.getStringClaim(payload.user_id),
				authentikUserUuid:
					this.getStringClaim(payload.authentik_user_uuid) ??
					this.getStringClaim(payload.user_uuid) ??
					this.getStringClaim(payload.uuid),
			};
		} catch {
			throw new BadRequestException("idToken payload could not be decoded");
		}
	}

	private async resolveUserFromClaims(claims: ParsedIdentityClaims) {
		const candidates: Array<{
			label: string;
			value?: string;
			resolve: (value: string) => Promise<ReturnType<UserService["mapUser"]> | null>;
		}> = [
			{
				label: "idToken.authentik_user_id",
				value: claims.authentikUserId,
				resolve: async (value) => this.getUserById(value),
			},
			{
				label: "idToken.authentik_user_uuid",
				value: claims.authentikUserUuid,
				resolve: async (value) => this.tryGetByUuid(value),
			},
			{
				label: "idToken.preferred_username",
				value: claims.preferredUsername,
				resolve: async (value) => this.getUserByUsername(value),
			},
			{
				label: "idToken.username",
				value: claims.username,
				resolve: async (value) => this.getUserByUsername(value),
			},
			{
				label: "idToken.sub",
				value: claims.sub,
				resolve: async (value) => this.tryGetByOpaqueSubject(value),
			},
		];

		for (const candidate of candidates) {
			if (!candidate.value) {
				continue;
			}

			try {
				const user = await candidate.resolve(candidate.value);
				if (user) {
					return {
						source: candidate.label,
						user,
					};
				}
			} catch (error) {
				if (error instanceof NotFoundException) {
					continue;
				}
				throw error;
			}
		}
		return null;
	}

	private async tryGetByOpaqueSubject(sub: string) {
		if (this.looksLikeUuid(sub)) {
			const userByUuid = await this.tryGetByUuid(sub);
			if (userByUuid) {
				return userByUuid;
			}
		}

		return this.getUserByUsername(sub);
	}

	private async getUserByUsername(username: string) {
		if (!username) {
			throw new BadRequestException("username is required");
		}
		const user = await this.authentikApi.getUserByUsername(username);
		return user ? this.mapUser(user) : null;
	}

	private async tryGetByUuid(uuid: string) {
		const user = await this.authentikApi.getUserByUuid(uuid);
		return user ? this.mapUser(user) : null;
	}

	private getStringClaim(value: unknown) {
		return typeof value === "string" && value.trim() ? value.trim() : undefined;
	}

	private looksLikeUuid(value: string) {
		return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
			value,
		);
	}
}
