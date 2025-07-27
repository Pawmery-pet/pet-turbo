// Authenticator Service - Client-side implementation for WebAuthn authenticator operations

// Base error class
class ServiceError extends Error {
	public statusCode: number;
	public errorResponse?: { error: string; message: string; statusCode: number };

	constructor(message: string, statusCode: number, errorResponse?: any) {
		super(message);
		this.name = "ServiceError";
		this.statusCode = statusCode;
		this.errorResponse = errorResponse;
	}
}

// Types for Authenticator entities
export interface Authenticator {
	credentialID: string;
	userId: string;
	providerAccountId: string;
	credentialPublicKey: string;
	counter: number;
	credentialDeviceType: string;
	credentialBackedUp: boolean;
	transports: string | null;
}

export interface CreateAuthenticatorRequest {
	credentialID: string;
	userId: string;
	providerAccountId: string;
	credentialPublicKey: string;
	counter: number;
	credentialDeviceType: string;
	credentialBackedUp: boolean;
	transports?: string;
}

export interface UpdateAuthenticatorRequest {
	counter: number;
}

export interface GetAuthenticatorsQuery {
	userId?: string;
	credentialID?: string;
}

// Configuration
const DEFAULT_API_BASE_URL =
	process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:3010";

export class AuthenticatorService {
	private baseUrl: string;

	constructor(baseUrl: string = DEFAULT_API_BASE_URL) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;

		const defaultHeaders = {
			"Content-Type": "application/json",
		};

		const config: RequestInit = {
			...options,
			headers: {
				...defaultHeaders,
				...options.headers,
			},
		};

		try {
			const response = await fetch(url, config);

			if (response.status === 204) {
				return {} as T;
			}

			const data = await response.json();

			if (!response.ok) {
				throw new ServiceError(
					data.message || `HTTP ${response.status}`,
					response.status,
					data,
				);
			}

			return data as T;
		} catch (error) {
			if (error instanceof ServiceError) {
				throw error;
			}

			throw new ServiceError(
				`Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
				0,
			);
		}
	}

	/**
	 * Create authenticator (WebAuthn)
	 */
	async createAuthenticator(
		authenticatorData: CreateAuthenticatorRequest,
	): Promise<Authenticator> {
		return this.request<Authenticator>("/api/authenticators", {
			method: "POST",
			body: JSON.stringify(authenticatorData),
		});
	}

	/**
	 * Get authenticator by credential ID
	 */
	async getAuthenticator(credentialID: string): Promise<Authenticator | null> {
		try {
			return await this.request<Authenticator>(
				`/api/authenticators/${encodeURIComponent(credentialID)}`,
				{
					method: "GET",
				},
			);
		} catch (error) {
			if (error instanceof ServiceError && error.statusCode === 404) {
				return null;
			}
			throw error;
		}
	}

	/**
	 * Update authenticator counter (used by WebAuthn)
	 */
	async updateAuthenticatorCounter(
		credentialID: string,
		counter: number,
	): Promise<Authenticator> {
		return this.request<Authenticator>(
			`/api/authenticators/${encodeURIComponent(credentialID)}/counter`,
			{
				method: "PUT",
				body: JSON.stringify({ counter }),
			},
		);
	}

	/**
	 * Delete authenticator
	 */
	async deleteAuthenticator(credentialID: string): Promise<void> {
		await this.request<void>(
			`/api/authenticators/${encodeURIComponent(credentialID)}`,
			{
				method: "DELETE",
			},
		);
	}

	/**
	 * Get authenticators by user ID
	 */
	async getAuthenticatorsByUserId(userId: string): Promise<Authenticator[]> {
		return this.request<Authenticator[]>(`/api/authenticators/user/${userId}`, {
			method: "GET",
		});
	}

	/**
	 * Get all authenticators with optional filtering
	 */
	async getAllAuthenticators(
		query: GetAuthenticatorsQuery = {},
	): Promise<Authenticator[]> {
		const searchParams = new URLSearchParams();

		if (query.userId) searchParams.set("userId", query.userId);
		if (query.credentialID)
			searchParams.set("credentialID", query.credentialID);

		const queryString = searchParams.toString();
		const endpoint = `/api/authenticators${queryString ? `?${queryString}` : ""}`;

		return this.request<Authenticator[]>(endpoint, {
			method: "GET",
		});
	}
}

// Create a default instance
export const authenticatorService = new AuthenticatorService();

// Export individual functions for convenience
export const {
	createAuthenticator,
	getAuthenticator,
	updateAuthenticatorCounter,
	deleteAuthenticator,
	getAuthenticatorsByUserId,
	getAllAuthenticators,
} = authenticatorService;
