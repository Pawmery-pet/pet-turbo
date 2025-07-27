import type { Request, Response } from "express";
import { prisma } from "../lib/prisma/client.js";
import { toSessionResponse } from "../types/auth.js";
import type {
	CreateSessionRequest,
	UpdateSessionRequest,
	GetSessionsQuery,
} from "../types/auth.js";

export class SessionController {
	// Create session
	static async createSession(
		req: Request<{}, {}, CreateSessionRequest>,
		res: Response,
	) {
		try {
			const sessionData = req.body;

			// Validate required fields
			if (
				!sessionData.sessionToken ||
				!sessionData.userId ||
				!sessionData.expires
			) {
				return res.status(400).json({
					error: "Bad Request",
					message: "sessionToken, userId, and expires are required",
					statusCode: 400,
				});
			}

			// Check if session already exists
			const existingSession = await prisma.session.findUnique({
				where: { sessionToken: sessionData.sessionToken },
			});

			if (existingSession) {
				return res.status(409).json({
					error: "Conflict",
					message: "Session already exists",
					statusCode: 409,
				});
			}

			// Create session
			const session = await prisma.session.create({
				data: {
					sessionToken: sessionData.sessionToken,
					userId: sessionData.userId,
					expires: new Date(sessionData.expires),
				},
			});

			res.status(201).json(toSessionResponse(session));
		} catch (error) {
			console.error("Error creating session:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to create session",
				statusCode: 500,
			});
		}
	}

	// Get session and user by session token
	static async getSessionAndUser(
		req: Request<{ sessionToken: string }>,
		res: Response,
	) {
		try {
			const { sessionToken } = req.params;

			const sessionWithUser = await prisma.session.findUnique({
				where: { sessionToken },
				include: { user: true },
			});

			if (!sessionWithUser) {
				return res.status(404).json({
					error: "Not Found",
					message: "Session not found",
					statusCode: 404,
				});
			}

			const { user, ...session } = sessionWithUser;
			res.json({
				user,
				session: toSessionResponse(session),
			});
		} catch (error) {
			console.error("Error fetching session and user:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to fetch session and user",
				statusCode: 500,
			});
		}
	}

	// Update session
	static async updateSession(
		req: Request<{ sessionToken: string }, {}, UpdateSessionRequest>,
		res: Response,
	) {
		try {
			const { sessionToken } = req.params;
			const updateData = req.body;

			// Remove sessionToken from update data if it exists (can't update primary identifier)
			const { sessionToken: _, ...dataToUpdate } = updateData;

			// Convert expires to Date if provided
			if (dataToUpdate.expires) {
				dataToUpdate.expires = new Date(dataToUpdate.expires);
			}

			const session = await prisma.session.update({
				where: { sessionToken },
				data: dataToUpdate,
			});

			res.json(toSessionResponse(session));
		} catch (error: any) {
			if (error.code === "P2025") {
				return res.status(404).json({
					error: "Not Found",
					message: "Session not found",
					statusCode: 404,
				});
			}

			console.error("Error updating session:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to update session",
				statusCode: 500,
			});
		}
	}

	// Delete session
	static async deleteSession(
		req: Request<{ sessionToken: string }>,
		res: Response,
	) {
		try {
			const { sessionToken } = req.params;

			await prisma.session.delete({
				where: { sessionToken },
			});

			res.status(204).send();
		} catch (error: any) {
			if (error.code === "P2025") {
				return res.status(404).json({
					error: "Not Found",
					message: "Session not found",
					statusCode: 404,
				});
			}

			console.error("Error deleting session:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to delete session",
				statusCode: 500,
			});
		}
	}

	// Get session by token
	static async getSession(
		req: Request<{ sessionToken: string }>,
		res: Response,
	) {
		try {
			const { sessionToken } = req.params;

			const session = await prisma.session.findUnique({
				where: { sessionToken },
			});

			if (!session) {
				return res.status(404).json({
					error: "Not Found",
					message: "Session not found",
					statusCode: 404,
				});
			}

			res.json(toSessionResponse(session));
		} catch (error) {
			console.error("Error fetching session:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to fetch session",
				statusCode: 500,
			});
		}
	}

	// Get all sessions (with optional filtering)
	static async getAllSessions(
		req: Request<{}, {}, {}, GetSessionsQuery>,
		res: Response,
	) {
		try {
			const { userId, sessionToken } = req.query;

			const where: any = {};
			if (userId) where.userId = userId;
			if (sessionToken) where.sessionToken = sessionToken;

			const sessions = await prisma.session.findMany({
				where,
				orderBy: { createdAt: "desc" },
			});

			res.json(sessions.map(toSessionResponse));
		} catch (error) {
			console.error("Error fetching sessions:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to fetch sessions",
				statusCode: 500,
			});
		}
	}

	// Get sessions by user ID
	static async getSessionsByUserId(
		req: Request<{ userId: string }>,
		res: Response,
	) {
		try {
			const { userId } = req.params;

			const sessions = await prisma.session.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
			});

			res.json(sessions.map(toSessionResponse));
		} catch (error) {
			console.error("Error fetching user sessions:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to fetch user sessions",
				statusCode: 500,
			});
		}
	}
}
