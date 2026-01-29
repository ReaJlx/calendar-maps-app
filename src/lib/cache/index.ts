/**
 * Cache Library
 * 
 * Re-exports from services/cache for convenience.
 * @see @/services/cache for the actual implementation
 */

export { 
  cacheService,
  getCacheService,
  type CacheService,
  type RateLimitResult 
} from '@/services/cache'
