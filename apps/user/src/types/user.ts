import type { User } from "../lib/prisma/.prisma";

// API Request types
export interface CreateUserRequest {
	name?: string;
	email?: string;
	image?: string;
}

export interface UpdateUserRequest {
	name?: string;
	email?: string;
	image?: string;
}

// API Response types
export interface UserResponse {
	id: string;
	name: string | null;
	email: string | null;
	emailVerified: Date | null;
	image: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface UsersListResponse {
	users: UserResponse[];
	total: number;
	page: number;
	limit: number;
}

export interface ApiErrorResponse {
	error: string;
	message: string;
	statusCode: number;
}

// Query parameters
export interface GetUsersQuery {
	page?: string;
	limit?: string;
	email?: string;
	name?: string;
}

// Convert Prisma User to API response format
export function toUserResponse(user: User): UserResponse {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		emailVerified: user.emailVerified,
		image: user.image,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}
