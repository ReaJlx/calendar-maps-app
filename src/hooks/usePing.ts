"use client"

import { useState, useCallback } from 'react'

import type { PingResponse } from '@/types/api'

interface UsePingReturn {
  data: PingResponse | null
  loading: boolean
  error: string | null
  fetchPing: () => Promise<void>
}

export function usePing(): UsePingReturn {
  const [data, setData] = useState<PingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPing = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ping')
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || json.message || 'Failed to ping')
      }

      setData(json)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to ping'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetchPing }
}
