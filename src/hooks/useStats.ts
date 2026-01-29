"use client"

import { useState, useCallback } from 'react'

import type { StatsResponse } from '@/types/api'

interface UseStatsReturn {
  data: StatsResponse | null
  loading: boolean
  error: string | null
  fetchStats: () => Promise<void>
}

export function useStats(): UseStatsReturn {
  const [data, setData] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stats')
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || json.message || 'Failed to fetch stats')
      }

      setData(json)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetchStats }
}
