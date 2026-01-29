/**
 * Logout endpoint - clears authentication cookies
 */

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = NextResponse.redirect(new URL('/', baseUrl));

    // Clear cookies
    response.cookies.delete('google_access_token');
    response.cookies.delete('google_refresh_token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
