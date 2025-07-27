import { PrismaClient } from "./.prisma";

declare global {
	// eslint-disable-next-line no-var
	var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
	prisma = new PrismaClient();
} else {
	if (!global.__prisma) {
		global.__prisma = new PrismaClient({
			log: ["query", "error", "warn"],
		});
	}
	prisma = global.__prisma;
}

export { prisma };

// Graceful shutdown
process.on("beforeExit", async () => {
	await prisma.$disconnect();
});

process.on("SIGINT", async () => {
	await prisma.$disconnect();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	await prisma.$disconnect();
	process.exit(0);
});
