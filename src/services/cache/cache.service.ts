/**
 * Cache Service
 * Business logic for caching and rate limiting
 */

import { count } from 'drizzle-orm'

import type { Database } from '@/lib/db'
import { users } from '@/lib/db/schema'
import type { StatsData } from '@/types/api'

import type { CacheRepository } from './cache.repository'
import type { CacheService, RateLimitResult } from './cache.types'

const STATS_CACHE_KEY = 'stats:global'
const RATE_LIMIT_PREFIX = 'ping:'

export class DefaultCacheService implements CacheService {
  constructor(
    private readonly repository: CacheRepository,
    private readonly getDatabase: () => Database
  ) {}

  async getStats(): Promise<StatsData | null> {
    return this.repository.get<StatsData>(STATS_CACHE_KEY)
  }

  async setStats(data: StatsData, ttlSeconds: number): Promise<void> {
    await this.repository.setex(STATS_CACHE_KEY, ttlSeconds, data)
  }

  async checkRateLimit(ip: string): Promise<RateLimitResult> {
    return this.repository.checkRateLimit(`${RATE_LIMIT_PREFIX}${ip}`)
  }

  async fetchAndCacheStats(ttlSeconds: number = 60): Promise<StatsData> {
    let db: Database
    try {
      db = this.getDatabase()
    } catch (error) {
      throw new Error(
        'Database is not configured. Please set DATABASE_URL to use the stats demo.'
      )
    }

    const [row] = await db.select({ userCount: count() }).from(users)

    const data: StatsData = {
      userCount: row?.userCount ?? 0,
      timestamp: new Date().toISOString(),
      random: Math.floor(Math.random() * 1000),
    }

    await this.setStats(data, ttlSeconds)
    return data
  }
}
