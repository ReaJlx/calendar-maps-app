"use client"

import { useState, useCallback } from 'react'

import type { UploadResponse } from '@/types/api'

interface UseUploadReturn {
  upload: (file: File) => Promise<string>
  uploading: boolean
  progress: number
  error: string | null
  reset: () => void
}

export function useUpload(): UseUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  const upload = useCallback(async (file: File): Promise<string> => {
    setUploading(true)
    setProgress(0)
    setError(null)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()

      formData.append('file', file)

      xhr.open('POST', '/api/upload')

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setProgress(percent)
        }
      }

      xhr.onload = () => {
        setUploading(false)
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText) as UploadResponse
            resolve(data.url)
          } catch (parseError) {
            const errorMsg = 'Failed to parse upload response'
            setError(errorMsg)
            reject(new Error(errorMsg))
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText)
            const errorMsg = errorData.error || errorData.message || `Upload failed: ${xhr.statusText || 'Unknown error'}`
            setError(errorMsg)
            reject(new Error(errorMsg))
          } catch {
            const errorMsg = `Upload failed: ${xhr.statusText || 'Unknown error'}`
            setError(errorMsg)
            reject(new Error(errorMsg))
          }
        }
      }

      xhr.onerror = () => {
        setUploading(false)
        const errorMsg = 'Upload failed. Please try again.'
        setError(errorMsg)
        reject(new Error(errorMsg))
      }

      xhr.send(formData)
    })
  }, [])

  return { upload, uploading, progress, error, reset }
}
