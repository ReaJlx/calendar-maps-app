/**
 * Utility to get authentication tokens from cookies
 */

import { cookies } from 'next/headers';
import { refreshAccessToken } from './google-oauth';

export async function getAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('google_access_token')?.value || null;
    const refreshToken = cookieStore.get('google_refresh_token')?.value;

    if (!accessToken && refreshToken) {
      // Try to refresh the token
      try {
        const newTokens = await refreshAccessToken(refreshToken);
        accessToken = newTokens.access_token ?? null;
        // In production, should update the cookie here
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
      }
    }

    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('google_refresh_token')?.value || null;
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
}
