'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <div className="mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600">
            We encountered an unexpected error. Please try again.
          </p>
        </div>
        
        {error.digest && (
          <p className="text-sm text-gray-500 mb-4">
            Error ID: {error.digest}
          </p>
        )}

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full"
          >
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full"
          >
            Go to home
          </Button>
        </div>
      </div>
    </div>
  )
}
