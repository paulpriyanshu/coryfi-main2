"use client"

import { useEffect } from "react"
import { useFormStatus } from "react-dom"
import toast from "react-hot-toast"

export function SubmissionResult({ result }: { result: any }) {
  const { pending } = useFormStatus()

  useEffect(() => {
    if (result && !pending) {
      if (result.success) {
        toast.success("Merchant created successfully")
      } else {
        toast.error(result.error || "Please check the form for errors.")
      }
    }
  }, [result, pending])

  if (pending) {
    return <p>Submitting...</p>
  }

  return null
}