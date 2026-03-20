import { ConsoleLogger, Injectable } from "@nestjs/common";

@Injectable()
export class LoggerService extends ConsoleLogger {
	constructor() {
		const isProduction =
			process.env.NODE_ENV === "production" ||
			process.env.NODE_ENV === "staging";

		super("LoggerService", {
			json: isProduction,
		});
	}

	info(message: string, context?: string): void {
		super.log(message, context);
	}
}
