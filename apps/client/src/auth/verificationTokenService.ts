// VerificationToken Service - Client-side implementation for verification token operations

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

// Types for VerificationToken entities
export interface VerificationToken {
	identifier: string;
	token: string;
	expires: Date;
}

export interface CreateVerificationTokenRequest {
	identifier: string;
	token: string;
	expires: Date | string;
}

// Configuration
const DEFAULT_API_BASE_URL =
	process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:3010";

export class VerificationTokenService {
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

			// Handle special case for 404 with null response (AuthJS pattern)
			if (response.status === 404) {
				const text = await response.text();
				if (text === "null") {
					return null as T;
				}
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
	 * Create verification token
	 */
	async createVerificationToken(
		tokenData: CreateVerificationTokenRequest,
	): Promise<VerificationToken> {
		return this.request<VerificationToken>("/api/verification-tokens", {
			method: "POST",
			body: JSON.stringify(tokenData),
		});
	}

	/**
	 * Use/consume verification token (deletes it - AuthJS pattern)
	 */
	async useVerificationToken(
		identifier: string,
		token: string,
	): Promise<VerificationToken | null> {
		try {
			return await this.request<VerificationToken>(
				`/api/verification-tokens/${encodeURIComponent(identifier)}/${encodeURIComponent(token)}/use`,
				{
					method: "DELETE",
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
	 * Get verification token
	 */
	async getVerificationToken(
		identifier: string,
		token: string,
	): Promise<VerificationToken | null> {
		try {
			return await this.request<VerificationToken>(
				`/api/verification-tokens/${encodeURIComponent(identifier)}/${encodeURIComponent(token)}`,
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
	 * Get all verification tokens (admin/debug purposes)
	 */
	async getAllVerificationTokens(): Promise<VerificationToken[]> {
		return this.request<VerificationToken[]>("/api/verification-tokens", {
			method: "GET",
		});
	}

	/**
	 * Clean up expired tokens
	 */
	async cleanupExpiredTokens(): Promise<{
		message: string;
		deletedCount: number;
	}> {
		return this.request<{ message: string; deletedCount: number }>(
			"/api/verification-tokens/cleanup",
			{
				method: "DELETE",
			},
		);
	}
}

// Create a default instance
export const verificationTokenService = new VerificationTokenService();

// Export individual functions for convenience
export const {
	createVerificationToken,
	useVerificationToken,
	getVerificationToken,
	getAllVerificationTokens,
	cleanupExpiredTokens,
} = verificationTokenService;
