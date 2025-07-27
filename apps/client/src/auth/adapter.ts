import type {
	Adapter,
	AdapterAccount,
	AdapterSession,
	AdapterUser,
} from "@auth/core/adapters";

// Import all services
import { userService } from "./userService";
import { accountService } from "./accountService";
import { sessionService } from "./sessionService";
import { verificationTokenService } from "./verificationTokenService";
import { authenticatorService } from "./authenticatorService";

export function DatabaseAdapter(): Adapter {
	return {
		// User operations
		createUser: async ({ id, ...data }) => {
			// AuthJS passes an id but we need to let MongoDB generate it
			// Convert null values to undefined for our service
			const sanitizedData = {
				...data,
				name: data.name === null ? undefined : data.name,
				email: data.email === null ? undefined : data.email,
				image: data.image === null ? undefined : data.image,
			};
			const user = await userService.createUser(sanitizedData);
			return user as AdapterUser;
		},

		getUser: async (id) => {
			try {
				const user = await userService.getUserById(id);
				return user as AdapterUser;
			} catch {
				return null;
			}
		},

		getUserByEmail: async (email) => {
			try {
				const user = await userService.getUserByEmail(email);
				return user as AdapterUser;
			} catch {
				return null;
			}
		},

		updateUser: async ({ id, ...data }) => {
			try {
				// Convert null values to undefined for our service
				const sanitizedData = {
					...data,
					name: data.name === null ? undefined : data.name,
					email: data.email === null ? undefined : data.email,
					image: data.image === null ? undefined : data.image,
				};
				const user = await userService.updateUser(id, sanitizedData);
				return user as AdapterUser;
			} catch {
				throw new Error("Failed to update user");
			}
		},

		deleteUser: async (id) => {
			try {
				await userService.deleteUser(id);
				return {} as AdapterUser; // AuthJS expects a return value
			} catch {
				throw new Error("Failed to delete user");
			}
		},

		// Account operations
		linkAccount: async (data) => {
			try {
				const account = await accountService.linkAccount(data as any);
				return account as unknown as AdapterAccount;
			} catch {
				throw new Error("Failed to link account");
			}
		},

		unlinkAccount: async ({ provider, providerAccountId }) => {
			try {
				const account = await accountService.unlinkAccount(
					provider,
					providerAccountId,
				);
				return account as unknown as AdapterAccount;
			} catch {
				throw new Error("Failed to unlink account");
			}
		},

		getAccount: async (providerAccountId, provider) => {
			try {
				const account = await accountService.getAccount(
					provider,
					providerAccountId,
				);
				return account as AdapterAccount | null;
			} catch {
				return null;
			}
		},

		getUserByAccount: async ({ provider, providerAccountId }) => {
			try {
				const user = await accountService.getUserByAccount(
					provider,
					providerAccountId,
				);
				return user as AdapterUser | null;
			} catch {
				return null;
			}
		},

		// Session operations
		createSession: async (data) => {
			try {
				const session = await sessionService.createSession(data as any);
				return session as AdapterSession;
			} catch {
				throw new Error("Failed to create session");
			}
		},

		getSessionAndUser: async (sessionToken) => {
			try {
				const result = await sessionService.getSessionAndUser(sessionToken);
				if (!result) return null;

				return {
					user: result.user as AdapterUser,
					session: result.session as AdapterSession,
				};
			} catch {
				return null;
			}
		},

		updateSession: async (data) => {
			try {
				const session = await sessionService.updateSession(
					data.sessionToken,
					data,
				);
				return session as AdapterSession;
			} catch {
				throw new Error("Failed to update session");
			}
		},

		deleteSession: async (sessionToken) => {
			try {
				await sessionService.deleteSession(sessionToken);
				return {} as AdapterSession; // AuthJS expects a return value
			} catch {
				throw new Error("Failed to delete session");
			}
		},

		// Verification token operations
		createVerificationToken: async (data) => {
			try {
				const token = await verificationTokenService.createVerificationToken(
					data as any,
				);
				// Remove id field if it exists (AuthJS requirement)
				const { id, ...tokenWithoutId } = token as any;
				return tokenWithoutId;
			} catch {
				throw new Error("Failed to create verification token");
			}
		},

		useVerificationToken: async ({ identifier, token }) => {
			try {
				const verificationToken =
					await verificationTokenService.useVerificationToken(
						identifier,
						token,
					);
				if (!verificationToken) return null;

				// Remove id field if it exists (AuthJS requirement)
				const { id, ...tokenWithoutId } = verificationToken as any;
				return tokenWithoutId;
			} catch {
				return null; // AuthJS expects null if token doesn't exist or already used
			}
		},

		// Authenticator operations (WebAuthn)
		createAuthenticator: async (data) => {
			try {
				const authenticator = await authenticatorService.createAuthenticator(
					data as any,
				);
				return authenticator as any;
			} catch {
				throw new Error("Failed to create authenticator");
			}
		},

		getAuthenticator: async (credentialID) => {
			try {
				const authenticator =
					await authenticatorService.getAuthenticator(credentialID);
				return authenticator as any;
			} catch {
				return null;
			}
		},

		listAuthenticatorsByUserId: async (userId) => {
			try {
				const authenticators =
					await authenticatorService.getAuthenticatorsByUserId(userId);
				return authenticators as any[];
			} catch {
				return [];
			}
		},

		updateAuthenticatorCounter: async (credentialID, counter) => {
			try {
				const authenticator =
					await authenticatorService.updateAuthenticatorCounter(
						credentialID,
						counter,
					);
				return authenticator as any;
			} catch {
				throw new Error("Failed to update authenticator counter");
			}
		},
	};
}
