/**
 * Media Service
 * Business logic for media uploads and transformations
 */

import type { MediaRepository } from './media.repository'
import type { MediaService, MediaTransformOptions, MediaUploadResult } from './media.types'

const DEFAULT_UPLOAD_FOLDER = 'uploads'

export class DefaultMediaService implements MediaService {
  constructor(private readonly repository: MediaRepository) {}

  async uploadImage(file: Buffer, folder: string = DEFAULT_UPLOAD_FOLDER): Promise<MediaUploadResult> {
    return this.repository.upload(file, folder)
  }

  getImageUrl(publicId: string, options?: MediaTransformOptions): string {
    return this.repository.getUrl(publicId, options)
  }
}
