/**
 * Login endpoint - redirects user to Google OAuth
 */

import { NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/auth/google-oauth';

export async function GET() {
  try {
    const authUrl = getAuthorizationUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate login' },
      { status: 500 }
    );
  }
}
