import { ConsoleLogger, Injectable } from "@nestjs/common";

@Injectable()
export class LoggerService extends ConsoleLogger {
	private readonly isProduction: boolean;

	constructor() {
		super();
		this.isProduction =
			process.env.NODE_ENV === "production" ||
			process.env.NODE_ENV === "staging";
	}

	/**
	 * Log an informational message
	 */
	info(message: string, context?: string): void {
		if (this.isProduction) {
			this.logAsJson("info", message, context);
		} else {
			super.log(message, context);
		}
	}

	/**
	 * Log a debug message
	 */
	debug(message: string, context?: string): void {
		if (this.isProduction) {
			this.logAsJson("debug", message, context);
		} else {
			super.debug(message, context);
		}
	}

	/**
	 * Log a warning message
	 */
	warn(message: string, context?: string): void {
		if (this.isProduction) {
			this.logAsJson("warn", message, context);
		} else {
			super.warn(message, context);
		}
	}

	/**
	 * Log an error message
	 */
	error(message: string, trace?: string, context?: string): void {
		if (this.isProduction) {
			this.logAsJson("error", message, context, trace);
		} else {
			super.error(message, trace, context);
		}
	}

	/**
	 * Override the default log method to use info
	 */
	log(message: string, context?: string): void {
		this.info(message, context);
	}

	/**
	 * Format log output as JSON for production/staging environments
	 */
	private logAsJson(
		level: string,
		message: string,
		context?: string,
		trace?: string,
	): void {
		const logObject: {
			timestamp: string;
			level: string;
			message: string;
			context?: string;
			trace?: string;
		} = {
			timestamp: new Date().toISOString(),
			level,
			message,
		};

		if (context) {
			logObject.context = context;
		}

		if (trace) {
			logObject.trace = trace;
		}

		// Output to stdout/stderr as JSON
		const output = JSON.stringify(logObject);

		if (level === "error") {
			process.stderr.write(`${output}\n`);
		} else {
			process.stdout.write(`${output}\n`);
		}
	}
}
