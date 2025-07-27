import type { Request, Response } from "express";
import { prisma } from "../lib/prisma/client.js";
import { toVerificationTokenResponse } from "../types/auth.js";
import type { CreateVerificationTokenRequest } from "../types/auth.js";

export class VerificationTokenController {
	// Create verification token
	static async createVerificationToken(
		req: Request<{}, {}, CreateVerificationTokenRequest>,
		res: Response,
	) {
		try {
			const tokenData = req.body;

			// Validate required fields
			if (!tokenData.identifier || !tokenData.token || !tokenData.expires) {
				return res.status(400).json({
					error: "Bad Request",
					message: "identifier, token, and expires are required",
					statusCode: 400,
				});
			}

			// Check if token already exists
			const existingToken = await prisma.verificationToken.findUnique({
				where: {
					identifier_token: {
						identifier: tokenData.identifier,
						token: tokenData.token,
					},
				},
			});

			if (existingToken) {
				return res.status(409).json({
					error: "Conflict",
					message: "Verification token already exists",
					statusCode: 409,
				});
			}

			// Create verification token
			const verificationToken = await prisma.verificationToken.create({
				data: {
					identifier: tokenData.identifier,
					token: tokenData.token,
					expires: new Date(tokenData.expires),
				},
			});

			// Remove id field if it exists (AuthJS requirement)
			const response = toVerificationTokenResponse(verificationToken);
			if ("id" in response) {
				const { id, ...tokenWithoutId } = response as any;
				res.status(201).json(tokenWithoutId);
			} else {
				res.status(201).json(response);
			}
		} catch (error) {
			console.error("Error creating verification token:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to create verification token",
				statusCode: 500,
			});
		}
	}

	// Use/consume verification token (AuthJS pattern)
	static async useVerificationToken(
		req: Request<{ identifier: string; token: string }>,
		res: Response,
	) {
		try {
			const { identifier, token } = req.params;

			const verificationToken = await prisma.verificationToken.delete({
				where: {
					identifier_token: {
						identifier,
						token,
					},
				},
			});

			// Remove id field if it exists (AuthJS requirement)
			const response = toVerificationTokenResponse(verificationToken);
			if ("id" in response) {
				const { id, ...tokenWithoutId } = response as any;
				res.json(tokenWithoutId);
			} else {
				res.json(response);
			}
		} catch (error: any) {
			if (error.code === "P2025") {
				// Token already used/deleted, return null as per AuthJS spec
				return res.status(404).json(null);
			}

			console.error("Error using verification token:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to use verification token",
				statusCode: 500,
			});
		}
	}

	// Get verification token
	static async getVerificationToken(
		req: Request<{ identifier: string; token: string }>,
		res: Response,
	) {
		try {
			const { identifier, token } = req.params;

			const verificationToken = await prisma.verificationToken.findUnique({
				where: {
					identifier_token: {
						identifier,
						token,
					},
				},
			});

			if (!verificationToken) {
				return res.status(404).json({
					error: "Not Found",
					message: "Verification token not found",
					statusCode: 404,
				});
			}

			res.json(toVerificationTokenResponse(verificationToken));
		} catch (error) {
			console.error("Error fetching verification token:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to fetch verification token",
				statusCode: 500,
			});
		}
	}

	// Get all verification tokens (admin/debug purposes)
	static async getAllVerificationTokens(req: Request, res: Response) {
		try {
			const tokens = await prisma.verificationToken.findMany({
				orderBy: { expires: "desc" },
			});

			res.json(tokens.map(toVerificationTokenResponse));
		} catch (error) {
			console.error("Error fetching verification tokens:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to fetch verification tokens",
				statusCode: 500,
			});
		}
	}

	// Clean up expired tokens
	static async cleanupExpiredTokens(req: Request, res: Response) {
		try {
			const result = await prisma.verificationToken.deleteMany({
				where: {
					expires: {
						lt: new Date(),
					},
				},
			});

			res.json({
				message: "Expired tokens cleaned up",
				deletedCount: result.count,
			});
		} catch (error) {
			console.error("Error cleaning up expired tokens:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to cleanup expired tokens",
				statusCode: 500,
			});
		}
	}
}
