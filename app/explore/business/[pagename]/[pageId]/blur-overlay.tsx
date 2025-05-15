"use client"

import { useEffect, useState } from "react"

export function BlurOverlay() {
  const [mounted, setMounted] = useState(false)

  // This ensures the blur effect is only applied after hydration
  // to prevent hydration mismatch errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 backdrop-blur-md bg-white/50 z-10">
      {/* This div creates the blur effect over the content */}
    </div>
  )
}
