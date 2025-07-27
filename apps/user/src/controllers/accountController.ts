import type { Request, Response } from "express";
import { prisma } from "../lib/prisma/client.js";
import { toAccountResponse } from "../types/auth.js";
import type { CreateAccountRequest, GetAccountsQuery } from "../types/auth.js";

export class AccountController {
	// Link account (used by OAuth providers)
	static async linkAccount(
		req: Request<{}, {}, CreateAccountRequest>,
		res: Response,
	) {
		try {
			const accountData = req.body;

			// Validate required fields
			if (
				!accountData.userId ||
				!accountData.provider ||
				!accountData.providerAccountId ||
				!accountData.type
			) {
				return res.status(400).json({
					error: "Bad Request",
					message: "userId, provider, providerAccountId, and type are required",
					statusCode: 400,
				});
			}

			// Check if account already exists
			const existingAccount = await prisma.account.findUnique({
				where: {
					provider_providerAccountId: {
						provider: accountData.provider,
						providerAccountId: accountData.providerAccountId,
					},
				},
			});

			if (existingAccount) {
				return res.status(409).json({
					error: "Conflict",
					message: "Account already linked",
					statusCode: 409,
				});
			}

			// Create account
			const account = await prisma.account.create({
				data: accountData,
			});

			res.status(201).json(toAccountResponse(account));
		} catch (error) {
			console.error("Error linking account:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to link account",
				statusCode: 500,
			});
		}
	}

	// Unlink account
	static async unlinkAccount(
		req: Request<{ provider: string; providerAccountId: string }>,
		res: Response,
	) {
		try {
			const { provider, providerAccountId } = req.params;

			const account = await prisma.account.delete({
				where: {
					provider_providerAccountId: {
						provider,
						providerAccountId,
					},
				},
			});

			res.json(toAccountResponse(account));
		} catch (error: any) {
			if (error.code === "P2025") {
				return res.status(404).json({
					error: "Not Found",
					message: "Account not found",
					statusCode: 404,
				});
			}

			console.error("Error unlinking account:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to unlink account",
				statusCode: 500,
			});
		}
	}

	// Get account by provider and provider account ID
	static async getAccount(
		req: Request<{ provider: string; providerAccountId: string }>,
		res: Response,
	) {
		try {
			const { provider, providerAccountId } = req.params;

			const account = await prisma.account.findFirst({
				where: {
					provider,
					providerAccountId,
				},
			});

			if (!account) {
				return res.status(404).json({
					error: "Not Found",
					message: "Account not found",
					statusCode: 404,
				});
			}

			res.json(toAccountResponse(account));
		} catch (error) {
			console.error("Error fetching account:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to fetch account",
				statusCode: 500,
			});
		}
	}

	// Get user by account (used by AuthJS adapter)
	static async getUserByAccount(
		req: Request<{ provider: string; providerAccountId: string }>,
		res: Response,
	) {
		try {
			const { provider, providerAccountId } = req.params;

			const account = await prisma.account.findUnique({
				where: {
					provider_providerAccountId: {
						provider,
						providerAccountId,
					},
				},
				include: {
					user: true,
				},
			});

			if (!account) {
				return res.status(404).json({
					error: "Not Found",
					message: "Account not found",
					statusCode: 404,
				});
			}

			res.json(account.user);
		} catch (error) {
			console.error("Error fetching user by account:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to fetch user by account",
				statusCode: 500,
			});
		}
	}

	// Get all accounts (with optional filtering)
	static async getAllAccounts(
		req: Request<{}, {}, {}, GetAccountsQuery>,
		res: Response,
	) {
		try {
			const { userId, provider, providerAccountId } = req.query;

			const where: any = {};
			if (userId) where.userId = userId;
			if (provider) where.provider = provider;
			if (providerAccountId) where.providerAccountId = providerAccountId;

			const accounts = await prisma.account.findMany({
				where,
				orderBy: { createdAt: "desc" },
			});

			res.json(accounts.map(toAccountResponse));
		} catch (error) {
			console.error("Error fetching accounts:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to fetch accounts",
				statusCode: 500,
			});
		}
	}

	// Get accounts by user ID
	static async getAccountsByUserId(
		req: Request<{ userId: string }>,
		res: Response,
	) {
		try {
			const { userId } = req.params;

			const accounts = await prisma.account.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
			});

			res.json(accounts.map(toAccountResponse));
		} catch (error) {
			console.error("Error fetching user accounts:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to fetch user accounts",
				statusCode: 500,
			});
		}
	}
}
