/**
 * Media Service
 * 
 * Lazy-initialized media upload service using Cloudinary.
 * Only initializes when first accessed, preventing startup crashes.
 */

import { v2 as cloudinary } from 'cloudinary'

import { CloudinaryRepository } from './media.repository'
import { DefaultMediaService } from './media.service'

export * from './media.types'
export { CloudinaryRepository, type MediaRepository } from './media.repository'
export { DefaultMediaService } from './media.service'

// Cache the service instance
let cachedService: DefaultMediaService | null = null

/**
 * Get media service instance (lazy-initialized)
 * @throws {Error} If Cloudinary is not configured
 */
export function getMediaService(): DefaultMediaService {
  if (cachedService) {
    return cachedService
  }

  const repository = new CloudinaryRepository(cloudinary)
  cachedService = new DefaultMediaService(repository)
  
  return cachedService
}

/**
 * Convenience export for direct access
 * 
 * Usage:
 *   import { mediaService } from '@/services/media'
 *   const result = await mediaService.uploadImage(buffer)
 */
export const mediaService = new Proxy({} as DefaultMediaService, {
  get(_, prop) {
    return getMediaService()[prop as keyof DefaultMediaService]
  }
})
