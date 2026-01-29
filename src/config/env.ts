/**
 * Environment Configuration & Validation
 * 
 * This module validates environment variables at startup using Zod schemas.
 * Each service's env vars are validated lazily when first accessed.
 * This prevents startup crashes while still ensuring type safety.
 */

import { z } from 'zod'

// =============================================================================
// Schemas
// =============================================================================

/**
 * Database environment variables
 */
const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
})

/**
 * Clerk authentication environment variables
 */
const clerkEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
})

/**
 * Upstash Redis environment variables (for cache + rate limiting)
 */
const upstashEnvSchema = z.object({
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),
})

/**
 * Cloudinary media upload environment variables
 */
const cloudinaryEnvSchema = z.object({
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1, 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
})

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate and return database environment variables
 * @throws {Error} If validation fails with detailed error message
 */
export function getDatabaseEnv() {
  const result = databaseEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
  })

  if (!result.success) {
    throw new Error(
      `Database configuration error:\n${result.error.errors.map((e) => `  - ${e.path.join('.')}: ${e.message}`).join('\n')}\n\nPlease check your .env file and ensure DATABASE_URL is set correctly.`
    )
  }

  return result.data
}

/**
 * Validate and return Clerk authentication environment variables
 * @throws {Error} If validation fails with detailed error message
 */
export function getClerkEnv() {
  const result = clerkEnvSchema.safeParse({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
  })

  if (!result.success) {
    throw new Error(
      `Clerk configuration error:\n${result.error.errors.map((e) => `  - ${e.path.join('.')}: ${e.message}`).join('\n')}\n\nPlease check your .env file and ensure Clerk environment variables are set correctly.`
    )
  }

  return result.data
}

/**
 * Validate and return Upstash Redis environment variables
 * @throws {Error} If validation fails with detailed error message
 */
export function getUpstashEnv() {
  const result = upstashEnvSchema.safeParse({
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  if (!result.success) {
    throw new Error(
      `Upstash configuration error:\n${result.error.errors.map((e) => `  - ${e.path.join('.')}: ${e.message}`).join('\n')}\n\nPlease check your .env file and ensure Upstash Redis environment variables are set correctly.`
    )
  }

  return result.data
}

/**
 * Validate and return Cloudinary environment variables
 * @throws {Error} If validation fails with detailed error message
 */
export function getCloudinaryEnv() {
  const result = cloudinaryEnvSchema.safeParse({
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  })

  if (!result.success) {
    throw new Error(
      `Cloudinary configuration error:\n${result.error.errors.map((e) => `  - ${e.path.join('.')}: ${e.message}`).join('\n')}\n\nPlease check your .env file and ensure Cloudinary environment variables are set correctly.`
    )
  }

  return result.data
}

// =============================================================================
// Feature Checks (non-throwing)
// =============================================================================

/**
 * Check if database is configured
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

/**
 * Check if Clerk authentication is configured
 */
export function isClerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
  )
}

/**
 * Check if Upstash Redis is configured
 */
export function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  )
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}
