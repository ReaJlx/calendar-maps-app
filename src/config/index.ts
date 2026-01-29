/**
 * Application Configuration
 * 
 * Central configuration for the application.
 */

// Re-export environment utilities
export * from './env'
export * from './public-env'

/**
 * Site configuration
 */
export const siteConfig = {
  name: "App",
  description: "Built with App Factory",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const

/**
 * Application configuration
 */
export const appConfig = {
  // Feature flags
  features: {
    auth: true,
    analytics: false,
  },
  // Pagination defaults
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  // Upload limits
  upload: {
    maxFileSizeMB: 10,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
} as const
