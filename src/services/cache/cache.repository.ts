/**
 * Cache Repository
 * Low-level data access for Redis/Upstash
 */

import type { Ratelimit } from '@upstash/ratelimit'
import type { Redis } from '@upstash/redis'

import type { RateLimitResult } from './cache.types'

export interface CacheRepository {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  setex<T>(key: string, ttlSeconds: number, value: T): Promise<void>
  delete(key: string): Promise<void>
  checkRateLimit(key: string): Promise<RateLimitResult>
}

export class UpstashCacheRepository implements CacheRepository {
  constructor(
    private readonly redis: Redis,
    private readonly ratelimit: Ratelimit
  ) {}

  async get<T>(key: string): Promise<T | null> {
    return this.redis.get<T>(key)
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.redis.set(key, value)
  }

  async setex<T>(key: string, ttlSeconds: number, value: T): Promise<void> {
    await this.redis.setex(key, ttlSeconds, value)
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key)
  }

  async checkRateLimit(key: string): Promise<RateLimitResult> {
    const { success, remaining, reset } = await this.ratelimit.limit(key)
    return { success, remaining, reset }
  }
}
