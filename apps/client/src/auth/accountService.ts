// Account Service - Client-side implementation for account CRUD operations

// Base error class from user service
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

// Types for Account entities
export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccountRequest {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export interface GetAccountsQuery {
  userId?: string;
  provider?: string;
  providerAccountId?: string;
}

// Configuration
const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3010';

export class AccountService {
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
   * Link account (OAuth provider linking)
   */
  async linkAccount(accountData: CreateAccountRequest): Promise<Account> {
    return this.request<Account>('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  /**
   * Unlink account
   */
  async unlinkAccount(provider: string, providerAccountId: string): Promise<Account> {
    return this.request<Account>(`/api/accounts/${encodeURIComponent(provider)}/${encodeURIComponent(providerAccountId)}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get account by provider and provider account ID
   */
  async getAccount(provider: string, providerAccountId: string): Promise<Account | null> {
    try {
      return await this.request<Account>(`/api/accounts/${encodeURIComponent(provider)}/${encodeURIComponent(providerAccountId)}`, {
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
   * Get user by account (used by AuthJS adapter)
   */
  async getUserByAccount(provider: string, providerAccountId: string): Promise<any | null> {
    try {
      return await this.request<any>(`/api/accounts/${encodeURIComponent(provider)}/${encodeURIComponent(providerAccountId)}/user`, {
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
   * Get all accounts with optional filtering
   */
  async getAllAccounts(query: GetAccountsQuery = {}): Promise<Account[]> {
    const searchParams = new URLSearchParams();
    
    if (query.userId) searchParams.set('userId', query.userId);
    if (query.provider) searchParams.set('provider', query.provider);
    if (query.providerAccountId) searchParams.set('providerAccountId', query.providerAccountId);

    const queryString = searchParams.toString();
    const endpoint = `/api/accounts${queryString ? `?${queryString}` : ''}`;

    return this.request<Account[]>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get accounts by user ID
   */
  async getAccountsByUserId(userId: string): Promise<Account[]> {
    return this.request<Account[]>(`/api/accounts/user/${userId}`, {
      method: 'GET',
    });
  }
}

// Create a default instance
export const accountService = new AccountService();

// Export individual functions for convenience
export const {
  linkAccount,
  unlinkAccount,
  getAccount,
  getUserByAccount,
  getAllAccounts,
  getAccountsByUserId,
} = accountService; 