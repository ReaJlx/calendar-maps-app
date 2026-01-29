/**
 * Database Connection
 * 
 * Lazy-initialized Drizzle database connection.
 * Only connects when first accessed, preventing startup crashes.
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { getDatabaseEnv } from '@/config/env'

import * as schema from './schema'

export type Database = PostgresJsDatabase<typeof schema>

let cachedDb: Database | null = null

/**
 * Get database instance (lazy-initialized)
 * @throws {Error} If DATABASE_URL is not configured
 */
export function getDatabase(): Database {
  if (cachedDb) {
    return cachedDb
  }

  const env = getDatabaseEnv()
  const client = postgres(env.DATABASE_URL, { prepare: false })
  cachedDb = drizzle(client, { schema })
  
  return cachedDb
}

/**
 * Convenience export for direct access
 * @deprecated Use getDatabase() for better error handling
 */
export const db = new Proxy({} as Database, {
  get(_, prop) {
    return getDatabase()[prop as keyof Database]
  }
})
