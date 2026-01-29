/**
 * Logout endpoint - clears authentication cookies
 */

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.redirect(new URL('/', { href: 'http://localhost:3000' }));

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
