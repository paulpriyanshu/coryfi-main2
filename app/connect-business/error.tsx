"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto py-10">
      <div className="rounded-md border border-destructive p-6 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <h2 className="text-xl font-semibold">Something went wrong!</h2>
        </div>

        <div className="mt-4 text-muted-foreground">
          <p>An error occurred while trying to connect the business to the layout.</p>
          <p className="mt-2 text-sm text-destructive">{error.message}</p>
        </div>

        <Button onClick={reset} className="mt-6" variant="outline">
          Try again
        </Button>
      </div>
    </div>
  )
}
