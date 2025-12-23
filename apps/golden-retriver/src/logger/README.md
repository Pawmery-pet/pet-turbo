# Logger Module

A unified and flexible logging module for the NestJS backend service. This module provides consistent logging across the entire application with environment-aware formatting.

## Features

- **Unified Logging Interface**: Single logger service used throughout the application
- **Environment-Aware Formatting**:
  - Development: Human-readable console output with colors
  - Staging/Production: JSON formatted logs for log aggregation systems
- **Standard Log Levels**: `info`, `debug`, `warn`, `error`
- **Context Support**: All log methods accept an optional context parameter
- **Global Availability**: Logger is available in all modules without explicit imports

## Installation

The logger module is already installed and configured in the application. No additional setup is required.

## Usage

### Basic Usage

Inject the `LoggerService` into any service, controller, or provider:

```typescript
import { Injectable } from "@nestjs/common";
import { LoggerService } from "./logger";

@Injectable()
export class MyService {
	constructor(private readonly logger: LoggerService) {}

	doSomething() {
		this.logger.info("Doing something", MyService.name);
		this.logger.debug("Debug information", MyService.name);
		this.logger.warn("Warning message", MyService.name);
		this.logger.error("Error occurred", "stack trace", MyService.name);
	}
}
```

### Log Methods

#### `info(message: string, context?: string)`
Log informational messages about normal application flow.

```typescript
this.logger.info("User logged in successfully", "AuthService");
```

#### `debug(message: string, context?: string)`
Log detailed information for debugging purposes.

```typescript
this.logger.debug("Processing request payload", "UserController");
```

#### `warn(message: string, context?: string)`
Log warnings about potentially problematic situations.

```typescript
this.logger.warn("Rate limit approaching", "ApiService");
```

#### `error(message: string, trace?: string, context?: string)`
Log error messages with optional stack trace.

```typescript
try {
	// ... code that might throw
} catch (error) {
	this.logger.error(
		"Failed to process request",
		error.stack,
		"UserService"
	);
}
```

## Output Formats

### Development Environment

In development (`NODE_ENV` is not set to `production` or `staging`), logs are output in human-readable format with colors:

```
[Nest] 12345  - 12/23/2025, 2:30:45 PM     LOG [AppController] GET / endpoint called
[Nest] 12345  - 12/23/2025, 2:30:45 PM   DEBUG [AppController] Fetching hello message
```

### Production/Staging Environment

In production or staging (`NODE_ENV=production` or `NODE_ENV=staging`), logs are output as JSON for easy parsing by log aggregation tools:

```json
{"timestamp":"2025-12-23T14:30:45.123Z","level":"info","message":"GET / endpoint called","context":"AppController"}
{"timestamp":"2025-12-23T14:30:45.124Z","level":"debug","message":"Fetching hello message","context":"AppController"}
```

## Architecture

The logger module is marked as `@Global()`, making it available throughout the entire application without needing to import it in each module.

### Files

- **logger.service.ts**: Core logger implementation extending NestJS's `ConsoleLogger`
- **logger.module.ts**: Module definition with global scope
- **index.ts**: Barrel export for clean imports

## Extending the Logger

To add custom functionality (e.g., sending logs to an external service), extend the `LoggerService`:

```typescript
import { LoggerService } from "./logger";

@Injectable()
export class CustomLoggerService extends LoggerService {
	info(message: string, context?: string): void {
		super.info(message, context);
		// Send to external service
		this.sendToExternalService("info", message, context);
	}

	private sendToExternalService(level: string, message: string, context?: string) {
		// Implementation to send logs to event bus, logging service, etc.
	}
}
```

## Testing

The logger can be easily mocked in unit tests:

```typescript
const mockLogger = {
	info: jest.fn(),
	debug: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
};

const module: TestingModule = await Test.createTestingModule({
	providers: [
		MyService,
		{
			provide: LoggerService,
			useValue: mockLogger,
		},
	],
}).compile();
```

## Best Practices

1. **Always provide context**: Pass the class name as context for better log traceability
2. **Use appropriate log levels**: Don't log everything as `info`
3. **Sanitize sensitive data**: Never log passwords, tokens, or PII
4. **Include relevant details**: Add enough context to understand what happened
5. **Use structured data in production**: The JSON format allows for easy querying and filtering
