// Session Service - Client-side implementation for session CRUD operations

// Base error class
class ServiceError extends Error {
  public statusCode: number;
  public errorResponse?: { error: string; message: string; statusCode: number };

  constructor(message: string, statusCode: number, errorResponse?: any) {
    super(message);
    this.name = 'ServiceError';
    this.statusCode = statusCode;
    this.errorResponse = errorResponse;
  }
}

// Types for Session entities
export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionWithUser extends Session {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface CreateSessionRequest {
  sessionToken: string;
  userId: string;
  expires: Date | string;
}

export interface UpdateSessionRequest {
  userId?: string;
  expires?: Date | string;
}

export interface GetSessionsQuery {
  userId?: string;
  sessionToken?: string;
}

// Configuration
const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3010';

export class SessionService {
  private baseUrl: string;

  constructor(baseUrl: string = DEFAULT_API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
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
      
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ServiceError(
          data.message || `HTTP ${response.status}`,
          response.status,
          data
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      
      throw new ServiceError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      );
    }
  }

  /**
   * Create session
   */
  async createSession(sessionData: CreateSessionRequest): Promise<Session> {
    const result = await this.request<Session>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
    
    // Convert date strings back to Date objects
    if (result) {
      result.expires = new Date(result.expires);
      result.createdAt = new Date(result.createdAt);
      result.updatedAt = new Date(result.updatedAt);
    }
    
    return result;
  }

  /**
   * Get session by token
   */
  async getSession(sessionToken: string): Promise<Session | null> {
    try {
      return await this.request<Session>(`/api/sessions/${encodeURIComponent(sessionToken)}`, {
        method: 'GET',
      });
    } catch (error) {
      if (error instanceof ServiceError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get session and user by session token (used by AuthJS adapter)
   */
  async getSessionAndUser(sessionToken: string): Promise<{ user: any; session: Session } | null> {
    try {
      const result = await this.request<{ user: any; session: Session }>(`/api/sessions/${encodeURIComponent(sessionToken)}/user`, {
        method: 'GET',
      });
      
      if (result && result.session) {
        // Convert expires string back to Date object for AuthJS
        result.session.expires = new Date(result.session.expires);
        result.session.createdAt = new Date(result.session.createdAt);
        result.session.updatedAt = new Date(result.session.updatedAt);
      }
      
      return result;
    } catch (error) {
      if (error instanceof ServiceError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update session
   */
  async updateSession(sessionToken: string, updateData: UpdateSessionRequest): Promise<Session> {
    const result = await this.request<Session>(`/api/sessions/${encodeURIComponent(sessionToken)}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    
    // Convert date strings back to Date objects
    if (result) {
      result.expires = new Date(result.expires);
      result.createdAt = new Date(result.createdAt);
      result.updatedAt = new Date(result.updatedAt);
    }
    
    return result;
  }

  /**
   * Delete session
   */
  async deleteSession(sessionToken: string): Promise<void> {
    await this.request<void>(`/api/sessions/${encodeURIComponent(sessionToken)}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get all sessions with optional filtering
   */
  async getAllSessions(query: GetSessionsQuery = {}): Promise<Session[]> {
    const searchParams = new URLSearchParams();
    
    if (query.userId) searchParams.set('userId', query.userId);
    if (query.sessionToken) searchParams.set('sessionToken', query.sessionToken);

    const queryString = searchParams.toString();
    const endpoint = `/api/sessions${queryString ? `?${queryString}` : ''}`;

    return this.request<Session[]>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get sessions by user ID
   */
  async getSessionsByUserId(userId: string): Promise<Session[]> {
    return this.request<Session[]>(`/api/sessions/user/${userId}`, {
      method: 'GET',
    });
  }
}

// Create a default instance
export const sessionService = new SessionService();

// Export individual functions for convenience
export const {
  createSession,
  getSession,
  getSessionAndUser,
  updateSession,
  deleteSession,
  getAllSessions,
  getSessionsByUserId,
} = sessionService; 