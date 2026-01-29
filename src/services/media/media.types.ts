/**
 * Media Service Types
 */

export interface MediaUploadResult {
  url: string
  publicId: string
}

export interface MediaTransformOptions {
  width?: number
  height?: number
  quality?: 'auto' | number
  format?: 'auto' | 'webp' | 'jpg' | 'png'
}

export interface MediaService {
  uploadImage(file: Buffer, folder?: string): Promise<MediaUploadResult>
  getImageUrl(publicId: string, options?: MediaTransformOptions): string
}
