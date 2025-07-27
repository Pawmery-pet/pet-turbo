import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3020;

async function startServer() {
	try {
		const server = app.listen(PORT, () => {
			console.log(`🐾 Pet Service is running on port ${PORT}`);
			console.log(`📱 Health check: http://localhost:${PORT}/health`);
			console.log(`🐕 Pets API: http://localhost:${PORT}/api/pets`);
			console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
		});

		// Graceful shutdown
		process.on("SIGTERM", () => {
			console.log("SIGTERM received, shutting down gracefully...");
			server.close(() => {
				console.log("Process terminated");
				process.exit(0);
			});
		});

		process.on("SIGINT", () => {
			console.log("SIGINT received, shutting down gracefully...");
			server.close(() => {
				console.log("Process terminated");
				process.exit(0);
			});
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
}

startServer();
