/**
 * Ping API Route
 * 
 * Demonstrates rate limiting - limits requests to 10 per 10 seconds per IP.
 */

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { isUpstashConfigured } from '@/config/env'
import { cacheService } from '@/services/cache'
import type { PingResponse } from '@/types/api'

async function getClientIp(): Promise<string> {
  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for')
  const realIp = headerList.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown'
  }

  return realIp ?? 'unknown'
}

export async function GET() {
  try {
    // Check if Upstash is configured
    if (!isUpstashConfigured()) {
      return NextResponse.json(
        { 
          error: 'Rate limiting not configured',
          message: 'Upstash Redis environment variables are not set. Please configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
        },
        { status: 503 }
      )
    }

    const ip = await getClientIp()
    const { success, remaining, reset } = await cacheService.checkRateLimit(ip)

    const response: PingResponse = {
      ok: success,
      ip,
      remaining,
      reset,
    }

    if (!success) {
      return NextResponse.json(
        { ...response, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Ping API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check rate limit',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
