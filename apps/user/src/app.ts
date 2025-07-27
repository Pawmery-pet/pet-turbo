import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { prisma } from "./lib/prisma/client.js";
import userRoutes from "./routes/users.js";
import accountRoutes from "./routes/accounts.js";
import sessionRoutes from "./routes/sessions.js";
import verificationTokenRoutes from "./routes/verificationTokens.js";
import authenticatorRoutes from "./routes/authenticators.js";
import { swaggerSpec } from "./config/swagger.js";

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS configuration - adjust origins as needed
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || "http://localhost:3000",
		credentials: true,
	}),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
	next();
});

// Swagger documentation
app.use(
	"/api-docs",
	swaggerUi.serve,
	swaggerUi.setup(swaggerSpec, {
		customCss: ".swagger-ui .topbar { display: none }",
		customSiteTitle: "User Service API Documentation",
	}),
);

// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
	res.setHeader("Content-Type", "application/json");
	res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check the health status of the API and database connection
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HealthResponse'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: Database connection failed
 */
// Health check endpoint
app.get("/health", async (req, res) => {
	try {
		// Check database connection by counting users
		await prisma.user.count();
		res.json({
			status: "ok",
			timestamp: new Date().toISOString(),
			database: "connected",
		});
	} catch (error) {
		console.error("Health check failed:", error);
		res.status(503).json({
			status: "error",
			timestamp: new Date().toISOString(),
			database: "disconnected",
			error: "Database connection failed",
		});
	}
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/verification-tokens", verificationTokenRoutes);
app.use("/api/authenticators", authenticatorRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: API information
 *     description: Get basic information about the User Service API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: User Service API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 description:
 *                   type: string
 *                   example: User CRUD service with Prisma and MongoDB
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     health:
 *                       type: string
 *                       example: /health
 *                     users:
 *                       type: string
 *                       example: /api/users
 *                     documentation:
 *                       type: string
 *                       example: /api-docs
 */
// Default route
app.get("/", (req, res) => {
	res.json({
		name: "User Service API",
		version: "1.0.0",
		description: "User CRUD service with Prisma and MongoDB",
		endpoints: {
			health: "/health",
			users: "/api/users",
			accounts: "/api/accounts",
			sessions: "/api/sessions",
			verificationTokens: "/api/verification-tokens",
			authenticators: "/api/authenticators",
			documentation: "/api-docs",
		},
	});
});

// 404 handler
app.use("*", (req, res) => {
	res.status(404).json({
		error: "Not Found",
		message: `Route ${req.method} ${req.originalUrl} not found`,
		statusCode: 404,
	});
});

// Global error handler
app.use(
	(
		error: any,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction,
	) => {
		console.error("Unhandled error:", error);
		res.status(500).json({
			error: "Internal Server Error",
			message: "An unexpected error occurred",
			statusCode: 500,
		});
	},
);

export default app;
