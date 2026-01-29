/**
 * Google OAuth callback endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/auth/google-oauth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/auth/error?error=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/auth/error?error=no_code', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    // Store tokens in secure cookie (in production, use secure session)
    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    // Set secure cookie with tokens
    response.cookies.set({
      name: 'google_access_token',
      value: tokens.access_token || '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: Math.max(0, (tokens.expiry_date ?? 0) - Date.now()),
    });

    if (tokens.refresh_token) {
      response.cookies.set({
        name: 'google_refresh_token',
        value: tokens.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/auth/error?error=${error instanceof Error ? error.message : 'unknown'}`,
        request.url
      )
    );
  }
}
