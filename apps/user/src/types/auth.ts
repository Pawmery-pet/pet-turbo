import type { Account, Session, VerificationToken, Authenticator } from '@prisma/client';

// Account types
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

export interface AccountResponse {
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

export interface AccountWithUser extends AccountResponse {
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

// Session types
export interface CreateSessionRequest {
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface UpdateSessionRequest {
  sessionToken?: string;
  userId?: string;
  expires?: Date;
}

export interface SessionResponse {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionWithUser extends SessionResponse {
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

// VerificationToken types
export interface CreateVerificationTokenRequest {
  identifier: string;
  token: string;
  expires: Date;
}

export interface VerificationTokenResponse {
  id: string;
  identifier: string;
  token: string;
  expires: Date;
}

// Authenticator types (WebAuthn)
export interface CreateAuthenticatorRequest {
  credentialID: string;
  userId: string;
  providerAccountId: string;
  credentialPublicKey: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports?: string;
}

export interface UpdateAuthenticatorRequest {
  counter: number;
}

export interface AuthenticatorResponse {
  credentialID: string;
  userId: string;
  providerAccountId: string;
  credentialPublicKey: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports: string | null;
}

// Query parameters
export interface GetAccountsQuery {
  userId?: string;
  provider?: string;
  providerAccountId?: string;
}

export interface GetSessionsQuery {
  userId?: string;
  sessionToken?: string;
}

export interface GetAuthenticatorsQuery {
  userId?: string;
  credentialID?: string;
}

// Converter functions
export function toAccountResponse(account: Account): AccountResponse {
  return {
    id: account.id,
    userId: account.userId,
    type: account.type,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    refresh_token: account.refresh_token,
    access_token: account.access_token,
    expires_at: account.expires_at,
    token_type: account.token_type,
    scope: account.scope,
    id_token: account.id_token,
    session_state: account.session_state,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

export function toSessionResponse(session: Session): SessionResponse {
  return {
    id: session.id,
    sessionToken: session.sessionToken,
    userId: session.userId,
    expires: session.expires,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export function toVerificationTokenResponse(token: VerificationToken): VerificationTokenResponse {
  return {
    id: token.id,
    identifier: token.identifier,
    token: token.token,
    expires: token.expires,
  };
}

export function toAuthenticatorResponse(authenticator: Authenticator): AuthenticatorResponse {
  return {
    credentialID: authenticator.credentialID,
    userId: authenticator.userId,
    providerAccountId: authenticator.providerAccountId,
    credentialPublicKey: authenticator.credentialPublicKey,
    counter: authenticator.counter,
    credentialDeviceType: authenticator.credentialDeviceType,
    credentialBackedUp: authenticator.credentialBackedUp,
    transports: authenticator.transports,
  };
} 