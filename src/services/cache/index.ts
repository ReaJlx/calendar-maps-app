/**
 * Cache Service
 * 
 * Lazy-initialized cache and rate limiting service using Upstash Redis.
 * Only initializes when first accessed, preventing startup crashes.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

import { getUpstashEnv } from '@/config/env'
import { getDatabase } from '@/lib/db'

import { UpstashCacheRepository } from './cache.repository'
import { DefaultCacheService } from './cache.service'

export * from './cache.types'
export { UpstashCacheRepository, type CacheRepository } from './cache.repository'
export { DefaultCacheService } from './cache.service'

// Cache the service instance
let cachedService: DefaultCacheService | null = null

/**
 * Get cache service instance (lazy-initialized)
 * @throws {Error} If Upstash Redis is not configured
 */
export function getCacheService(): DefaultCacheService {
  if (cachedService) {
    return cachedService
  }

  const env = getUpstashEnv()
  
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  })

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
  })

  const repository = new UpstashCacheRepository(redis, ratelimit)
  cachedService = new DefaultCacheService(repository, getDatabase)
  
  return cachedService
}

/**
 * Convenience export for direct access
 * 
 * Usage:
 *   import { cacheService } from '@/services/cache'
 *   const stats = await cacheService.getStats()
 */
export const cacheService = new Proxy({} as DefaultCacheService, {
  get(_, prop) {
    return getCacheService()[prop as keyof DefaultCacheService]
  }
})
