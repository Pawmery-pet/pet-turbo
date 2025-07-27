// User Service - Client-side implementation for user CRUD operations

// Types matching the backend API
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  email?: string;
  name?: string;
}

// Configuration
const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3010';

export class UserServiceError extends Error {
  public statusCode: number;
  public errorResponse?: ApiErrorResponse;

  constructor(message: string, statusCode: number, errorResponse?: ApiErrorResponse) {
    super(message);
    this.name = 'UserServiceError';
    this.statusCode = statusCode;
    this.errorResponse = errorResponse;
  }
}

export class UserService {
  private baseUrl: string;

  constructor(baseUrl: string = DEFAULT_API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 204 No Content (for delete operations)
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new UserServiceError(
          data.message || `HTTP ${response.status}`,
          response.status,
          data as ApiErrorResponse
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof UserServiceError) {
        throw error;
      }
      
      // Network or other fetch errors
      throw new UserServiceError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      );
    }
  }

  /**
   * Get all users with optional filtering and pagination
   */
  async getAllUsers(query: GetUsersQuery = {}): Promise<UsersListResponse> {
    const searchParams = new URLSearchParams();
    
    if (query.page !== undefined) searchParams.set('page', query.page.toString());
    if (query.limit !== undefined) searchParams.set('limit', query.limit.toString());
    if (query.email) searchParams.set('email', query.email);
    if (query.name) searchParams.set('name', query.name);

    const queryString = searchParams.toString();
    const endpoint = `/api/users${queryString ? `?${queryString}` : ''}`;

    const result = await this.request<UsersListResponse>(endpoint, {
      method: 'GET',
    });

    // Convert date strings back to Date objects for all users
    if (result && result.users) {
      result.users = result.users.map(user => ({
        ...user,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      }));
    }

    return result;
  }

  /**
   * Get a user by their ID
   */
  async getUserById(id: string): Promise<User> {
    const result = await this.request<User>(`/api/users/${id}`, {
      method: 'GET',
    });
    
    // Convert date strings back to Date objects
    if (result) {
      if (result.emailVerified) result.emailVerified = new Date(result.emailVerified);
      result.createdAt = new Date(result.createdAt);
      result.updatedAt = new Date(result.updatedAt);
    }
    
    return result;
  }

  /**
   * Get a user by their email address
   */
  async getUserByEmail(email: string): Promise<User> {
    const result = await this.request<User>(`/api/users/email/${encodeURIComponent(email)}`, {
      method: 'GET',
    });
    
    // Convert date strings back to Date objects
    if (result) {
      if (result.emailVerified) result.emailVerified = new Date(result.emailVerified);
      result.createdAt = new Date(result.createdAt);
      result.updatedAt = new Date(result.updatedAt);
    }
    
    return result;
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    const result = await this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Convert date strings back to Date objects
    if (result) {
      if (result.emailVerified) result.emailVerified = new Date(result.emailVerified);
      result.createdAt = new Date(result.createdAt);
      result.updatedAt = new Date(result.updatedAt);
    }
    
    return result;
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const result = await this.request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    // Convert date strings back to Date objects
    if (result) {
      if (result.emailVerified) result.emailVerified = new Date(result.emailVerified);
      result.createdAt = new Date(result.createdAt);
      result.updatedAt = new Date(result.updatedAt);
    }
    
    return result;
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    await this.request<void>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Check if a user exists by email
   */
  async userExists(email: string): Promise<boolean> {
    try {
      await this.getUserByEmail(email);
      return true;
    } catch (error) {
      if (error instanceof UserServiceError && error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Search users by name or email
   */
  async searchUsers(searchTerm: string, options: { page?: number; limit?: number } = {}): Promise<UsersListResponse> {
    return this.getAllUsers({
      name: searchTerm,
      email: searchTerm,
      ...options,
    });
  }
}

// Create a default instance
export const userService = new UserService();

// Export individual functions for convenience
export const {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  userExists,
  searchUsers,
} = userService;
