/**
 * Authentication Utilities
 * 
 * Helper functions for Clerk authentication with proper fallbacks.
 */

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { isClerkConfigured } from '@/config/env'

/**
 * Get the currently authenticated user
 * @returns User object if authenticated, null otherwise
 */
export async function getAuthUser() {
  // Return null if Clerk is not configured
  if (!isClerkConfigured()) {
    console.warn('Clerk is not configured. Authentication features will not work.')
    return null
  }

  try {
    const { userId } = await auth()
    if (!userId) return null
    return currentUser()
  } catch (error) {
    console.error('Failed to get authenticated user:', error)
    return null
  }
}

/**
 * Require authentication, redirect to sign-in if not authenticated
 * @returns User object
 * @throws Redirects to /sign-in if not authenticated
 */
export async function requireAuth() {
  if (!isClerkConfigured()) {
    throw new Error('Clerk is not configured. Please set up Clerk environment variables.')
  }

  const user = await getAuthUser()
  if (!user) {
    redirect('/sign-in')
  }
  return user
}
