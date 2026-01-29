/**
 * Cache Demo Page
 * 
 * Demonstrates caching and rate limiting using Upstash Redis.
 * Shows cache hits/misses and rate limit consumption.
 */

'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { usePing } from '@/hooks/usePing'
import { useStats } from '@/hooks/useStats'

export default function CacheDemoPage() {
  const { data: stats, loading: statsLoading, error: statsError, fetchStats } = useStats()
  const { data: ping, loading: pingLoading, error: pingError, fetchPing } = usePing()

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Cache + Rate Limit Demo</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Test the Upstash cache helpers and rate limiter from the browser.
            </p>
          </div>
          <Link
            href="/"
            className="flex h-10 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            ← Home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Cache Demo</CardTitle>
                <CardDescription>
                  Fetch stats and observe cache hits for 60 seconds.
                </CardDescription>
              </div>
              <Button
                onClick={fetchStats}
                isLoading={statsLoading}
                variant="primary"
              >
                Fetch Stats
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {statsError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Error
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {statsError}
                </p>
              </div>
            )}
            {stats && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Cache Status:</span>
                  <span 
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      stats.cache === 'hit' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                    }`}
                  >
                    {stats.cache === 'hit' ? '✓ Cache Hit' : '⊘ Cache Miss'}
                  </span>
                </div>
                <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-4 text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                  {JSON.stringify(stats, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Rate Limit Demo</CardTitle>
                <CardDescription>
                  Hit the endpoint to consume 10 requests per 10 seconds.
                </CardDescription>
              </div>
              <Button
                onClick={fetchPing}
                isLoading={pingLoading}
                variant="outline"
              >
                Ping API
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pingError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Error
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {pingError}
                </p>
              </div>
            )}
            {ping && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <span 
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      ping.ok 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                    }`}
                  >
                    {ping.ok ? '✓ OK' : '✗ Rate Limited'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Remaining:</span>
                  <span className="text-sm">{ping.remaining} requests</span>
                </div>
                <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-4 text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                  {JSON.stringify(ping, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            💡 How it works
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-700 dark:text-blue-300">
            <li><strong>Cache Demo:</strong> First fetch is a cache miss and fetches from database. Subsequent fetches within 60 seconds are cache hits.</li>
            <li><strong>Rate Limit Demo:</strong> You can make 10 requests per 10 seconds. After that, you'll be rate limited until the window resets.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
