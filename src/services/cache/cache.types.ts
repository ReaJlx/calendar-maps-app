/**
 * Cache Service Types
 */

import type { StatsData } from '@/types/api'

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export interface CacheService {
  getStats(): Promise<StatsData | null>
  setStats(data: StatsData, ttlSeconds: number): Promise<void>
  checkRateLimit(key: string): Promise<RateLimitResult>
  fetchAndCacheStats(ttlSeconds?: number): Promise<StatsData>
}
