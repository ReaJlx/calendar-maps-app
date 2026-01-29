/**
 * User Service
 * 
 * Lazy-initialized user service for database operations.
 */

import { getDatabase } from '@/lib/db'

import { DrizzleUserRepository } from './user.repository'
import { DefaultUserService } from './user.service'

export * from './user.types'
export { DrizzleUserRepository, type UserRepository } from './user.repository'
export { DefaultUserService } from './user.service'

// Cache the service instance
let cachedService: DefaultUserService | null = null

/**
 * Get user service instance (lazy-initialized)
 * @throws {Error} If database is not configured
 */
export function getUserService(): DefaultUserService {
  if (cachedService) {
    return cachedService
  }

  const repository = new DrizzleUserRepository(getDatabase())
  cachedService = new DefaultUserService(repository)
  
  return cachedService
}

/**
 * Convenience export for direct access
 * 
 * Usage:
 *   import { userService } from '@/services/user'
 *   const user = await userService.getUserByClerkId(clerkId)
 */
export const userService = new Proxy({} as DefaultUserService, {
  get(_, prop) {
    return getUserService()[prop as keyof DefaultUserService]
  }
})
