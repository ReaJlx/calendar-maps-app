import { type InputHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm',
            'placeholder:text-zinc-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-600',
            error && 'border-red-500 focus-visible:ring-red-400',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  onChange?: (file: File | null) => void
  accept?: string
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, onChange, accept, ...props }, ref) => {
    return (
      <Input
        type="file"
        accept={accept}
        className={cn(
          'file:mr-4 file:rounded-full file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-700',
          'hover:file:bg-zinc-200',
          'dark:file:bg-zinc-800 dark:file:text-zinc-300 dark:hover:file:bg-zinc-700',
          className
        )}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null
          onChange?.(file)
        }}
        ref={ref}
        {...props}
      />
    )
  }
)

FileInput.displayName = 'FileInput'

export { Input, FileInput }
