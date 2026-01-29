/**
 * Media Repository
 * Low-level data access for Cloudinary
 */

import { getCloudinaryEnv } from '@/config/env'

import type { MediaTransformOptions, MediaUploadResult } from './media.types'

export interface MediaRepository {
  upload(file: Buffer, folder: string): Promise<MediaUploadResult>
  getUrl(publicId: string, options?: MediaTransformOptions): string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CloudinaryV2 = any

/**
 * Cloudinary repository with lazy configuration
 */
export class CloudinaryRepository implements MediaRepository {
  private configured = false

  constructor(private readonly cloudinary: CloudinaryV2) {}

  /**
   * Ensure Cloudinary is configured (lazy initialization)
   */
  private ensureConfigured(): void {
    if (this.configured) {
      return
    }

    const env = getCloudinaryEnv()
    
    this.cloudinary.config({
      cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    })

    this.configured = true
  }

  async upload(file: Buffer, folder: string): Promise<MediaUploadResult> {
    this.ensureConfigured()

    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error: Error | null, result?: { secure_url: string; public_id: string }) => {
          if (error || !result) {
            reject(error ?? new Error('Upload failed'))
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            })
          }
        }
      ).end(file)
    })
  }

  getUrl(publicId: string, options?: MediaTransformOptions): string {
    this.ensureConfigured()

    return this.cloudinary.url(publicId, {
      secure: true,
      transformation: [
        { 
          width: options?.width, 
          height: options?.height, 
          crop: 'fill' 
        },
        { 
          quality: options?.quality ?? 'auto', 
          fetch_format: options?.format ?? 'auto' 
        },
      ],
    })
  }
}
