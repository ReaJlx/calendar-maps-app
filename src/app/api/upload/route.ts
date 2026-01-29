/**
 * Upload API Route
 * 
 * Handles image uploads to Cloudinary.
 * Requires authentication via Clerk.
 */

import { NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth'
import { isCloudinaryConfigured, isClerkConfigured } from '@/config/env'
import { mediaService } from '@/services/media'
import type { UploadResponse } from '@/types/api'

export async function POST(request: Request) {
  try {
    // Check if Clerk is configured
    if (!isClerkConfigured()) {
      return NextResponse.json(
        { 
          error: 'Authentication not configured',
          message: 'Clerk environment variables are not set. Please configure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.'
        },
        { status: 503 }
      )
    }

    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to upload images' },
        { status: 401 }
      )
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { 
          error: 'Upload not configured',
          message: 'Cloudinary environment variables are not set. Please configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
        },
        { status: 503 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file uploaded', message: 'Please select a file to upload' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type', message: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large', message: 'Maximum file size is 10MB' },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer())
    const { url } = await mediaService.uploadImage(buffer)

    const response: UploadResponse = { url }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json(
      { 
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
