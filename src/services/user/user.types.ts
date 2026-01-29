/**
 * User Service Types
 */

import type { User } from '@/lib/db/schema/users'

export interface ClerkUserPayload {
  clerkId: string
  email: string
  name?: string | null
  imageUrl?: string | null
}

export interface UserService {
  getUserByClerkId(clerkId: string): Promise<User | null>
  getOrCreateUser(payload: ClerkUserPayload): Promise<User>
  syncFromClerk(payload: ClerkUserPayload): Promise<User>
  deleteByClerkId(clerkId: string): Promise<void>
}
