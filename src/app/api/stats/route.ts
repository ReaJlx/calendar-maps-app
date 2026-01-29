/**
 * Stats API Route
 * 
 * Demonstrates cache usage - returns cached stats if available,
 * otherwise fetches from database and caches the result.
 */

import { NextResponse } from 'next/server'

import { isUpstashConfigured, isDatabaseConfigured } from '@/config/env'
import { cacheService } from '@/services/cache'
import type { StatsResponse } from '@/types/api'

export async function GET() {
  try {
    // Check if Upstash is configured
    if (!isUpstashConfigured()) {
      return NextResponse.json(
        { 
          error: 'Cache not configured',
          message: 'Upstash Redis environment variables are not set. Please configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
        },
        { status: 503 }
      )
    }

    // Check if database is configured
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { 
          error: 'Database not configured',
          message: 'DATABASE_URL is not set. Please configure your database connection string.'
        },
        { status: 503 }
      )
    }

    // Try to get cached stats
    const cached = await cacheService.getStats()

    if (cached) {
      const response: StatsResponse = { ...cached, cache: 'hit' }
      return NextResponse.json(response)
    }

    // Cache miss - fetch and cache
    const data = await cacheService.fetchAndCacheStats(60)
    const response: StatsResponse = { ...data, cache: 'miss' }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
