/**
 * Media Demo Page
 * 
 * Demonstrates Cloudinary image upload with authentication.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { CldImage } from 'next-cloudinary'

import { isClerkPublishableConfigured, isCloudinaryPublicConfigured } from '@/config/public-env'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FileInput } from '@/components/ui/Input'
import { useUpload } from '@/hooks/useUpload'

function MediaDemoContent() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const { upload, uploading, progress, error, reset } = useUpload()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  async function handleUpload() {
    if (!selectedFile) return

    try {
      const url = await upload(selectedFile)
      setImageUrl(url)
    } catch {
      // Error is handled by the hook
    }
  }

  function handleFileChange(file: File | null) {
    setSelectedFile(file)
    setImageUrl(null)
    reset()
  }

  if (!isLoaded || !isSignedIn) {
    return null
  }

  const cloudinaryConfigured = isCloudinaryPublicConfigured()

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Cloudinary Media Upload</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Upload an image to Cloudinary and preview it below.
            </p>
          </div>
          <Link
            href="/"
            className="flex h-10 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            ← Home
          </Link>
        </div>

        {!cloudinaryConfigured && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              Cloudinary Not Configured
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Upload</CardTitle>
            <CardDescription>Select an image file to upload</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FileInput
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading || !cloudinaryConfigured}
            />
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading || !cloudinaryConfigured}
              isLoading={uploading}
              className="w-full"
            >
              {uploading ? `Uploading ${progress}%` : 'Upload Image'}
            </Button>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {uploading && progress > 0 && progress < 100 && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full bg-foreground transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {imageUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Your uploaded image</CardDescription>
            </CardHeader>
            <CardContent>
              <CldImage
                src={imageUrl}
                alt="Uploaded image"
                width={720}
                height={480}
                deliveryType="fetch"
                className="h-auto w-full rounded-xl object-cover"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function MediaDemoPage() {
  const clerkConfigured = isClerkPublishableConfigured()

  if (!clerkConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex max-w-md flex-col gap-4 rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-zinc-900">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Authentication Not Configured
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Clerk is not configured. Please set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in your .env file.
          </p>
          <Link
            href="/"
            className="flex h-10 items-center justify-center rounded-full border border-zinc-200 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return <MediaDemoContent />
}
