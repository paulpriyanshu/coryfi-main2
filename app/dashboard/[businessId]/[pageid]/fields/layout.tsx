import type React from "react"
import { Toaster } from "react-hot-toast"

export default function ProductFieldsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/40">
      {children}
      <Toaster position="top-right" />
    </div>
  )
}

