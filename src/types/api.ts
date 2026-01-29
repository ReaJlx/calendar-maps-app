/**
 * API Response Types
 * 
 * Standard types for API responses across the application.
 * These are global types used throughout the app.
 */

// =============================================================================
// Generic API Response Wrappers
// =============================================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

export interface ErrorResponse {
  error: string
  message?: string
}

// =============================================================================
// Cache Demo Types
// =============================================================================

export interface StatsData {
  userCount: number
  timestamp: string
  random: number
}

export interface StatsResponse extends StatsData {
  cache: 'hit' | 'miss'
}

export interface PingResponse {
  ok: boolean
  ip: string
  remaining: number
  reset: number
  error?: string
}

// =============================================================================
// Media Upload Types
// =============================================================================

export interface UploadResponse {
  url: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}
