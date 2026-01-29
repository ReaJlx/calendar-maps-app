/**
 * Authentication service for handling user session and tokens
 */

import { OAuth2Client } from 'google-auth-library';
import { GoogleTokens, AuthUser } from '@/types';

/**
 * Create or initialize OAuth2 client
 */
export function initializeOAuth2Client(tokens?: Partial<GoogleTokens>): OAuth2Client {
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL || 'http://localhost:3000/api/auth/callback/google'
  );

  if (tokens) {
    client.setCredentials(tokens);
  } else if (process.env.GOOGLE_REFRESH_TOKEN) {
    client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  }

  return client;
}

/**
 * Check if tokens are valid and not expired
 */
export function areTokensValid(tokens: GoogleTokens): boolean {
  if (!tokens.access_token) {
    return false;
  }

  if (tokens.expiry_date) {
    // Add 5 minute buffer
    return tokens.expiry_date > Date.now() + 5 * 60 * 1000;
  }

  return true;
}

/**
 * Validate API credentials are configured
 */
export function validateApiCredentials(): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!process.env.GOOGLE_CLIENT_ID) {
    missing.push('GOOGLE_CLIENT_ID');
  }

  if (!process.env.GOOGLE_CLIENT_SECRET) {
    missing.push('GOOGLE_CLIENT_SECRET');
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    missing.push('GOOGLE_MAPS_API_KEY');
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    missing.push('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY');
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get authorization URL for user to visit
 */
export function getAuthorizationUrl(state?: string): string {
  const client = initializeOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent screen to ensure refresh token
    state: state,
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  if (!code) {
    throw new Error('Authorization code is required');
  }

  const client = initializeOAuth2Client();

  try {
    const { tokens } = await client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || undefined,
      expiry_date: tokens.expiry_date ?? undefined,
      token_type: tokens.token_type || undefined,
      scope: tokens.scope || undefined,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to exchange code';
    throw new Error(`Token exchange failed: ${errorMsg}`);
  }
}

/**
 * Refresh tokens using refresh token
 */
export async function refreshTokens(refreshToken: string): Promise<GoogleTokens> {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  const client = initializeOAuth2Client({
    refresh_token: refreshToken,
  });

  try {
    const { credentials } = await client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error('No access token in refresh response');
    }

    return {
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token || refreshToken,
      expiry_date: credentials.expiry_date ?? undefined,
      token_type: credentials.token_type || undefined,
      scope: credentials.scope || undefined,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to refresh tokens';
    throw new Error(`Token refresh failed: ${errorMsg}`);
  }
}

/**
 * Get user info from tokens
 */
export async function getUserInfo(tokens: GoogleTokens): Promise<AuthUser> {
  const client = initializeOAuth2Client(tokens);

  try {
    const { google } = require('googleapis');
    const oauth2 = google.oauth2({ version: 'v2', auth: client });

    const userInfo = await oauth2.userinfo.get();

    return {
      id: userInfo.data.id,
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture,
      googleTokens: tokens,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to get user info';
    throw new Error(`User info retrieval failed: ${errorMsg}`);
  }
}

/**
 * Revoke tokens
 */
export async function revokeTokens(tokens: GoogleTokens): Promise<void> {
  const client = initializeOAuth2Client(tokens);

  try {
    await client.revokeCredentials();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to revoke tokens';
    console.error('Token revocation error:', errorMsg);
    // Don't throw - revocation might fail but we still want to clear local tokens
  }
}

/**
 * Validate and refresh tokens if needed
 */
export async function ensureValidTokens(tokens: GoogleTokens): Promise<GoogleTokens> {
  if (!areTokensValid(tokens)) {
    if (!tokens.refresh_token) {
      throw new Error('No refresh token available. User needs to re-authenticate.');
    }

    return refreshTokens(tokens.refresh_token);
  }

  return tokens;
}
