import { Injectable } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { LoggerService } from "./logger";

// Define input schema
const CreateUserSchema = z.object({
	name: z.string().min(1).max(100),
	email: z.email(),
	age: z.number().int().min(0).max(150),
});

// Define output schema
const UserResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.email(),
	age: z.number(),
	createdAt: z.string(),
});

// Create DTOs from schemas for type inference
class CreateUserDto extends createZodDto(CreateUserSchema) {}
class UserResponseDto extends createZodDto(UserResponseSchema) {}

// Infer TypeScript types from DTOs for internal use
type CreateUserInput = z.infer<typeof CreateUserSchema>;
type UserResponse = z.infer<typeof UserResponseSchema>;

@Injectable()
export class AppService {
	getHello(): string {
		return "Hello World!";
	}

	createUser(input: CreateUserInput): UserResponse {
		this.logger.debug(
			`Creating user in service: ${input.name}`,
			AppService.name,
		);

		// Simulate user creation
		// TypeScript will enforce that this matches UserResponse type
		const user: UserResponse = {
			id: `user_${Date.now()}`,
			name: input.name,
			email: input.email,
			age: input.age,
			createdAt: new Date().toISOString(),
		};

		return user;
	}
}

// Export DTOs for use in controllers
export { CreateUserDto, UserResponseDto };
