"use client"

import type React from "react"

import { useState } from "react"
import { connectBusinessToExistingLayout } from "../api/business/business"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ConnectBusinessForm() {
  const [businessId, setBusinessId] = useState("")
  const [layoutPageId, setLayoutPageId] = useState("")
  const [result, setResult] = useState<{
    success: boolean
    message?: string
    error?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await connectBusinessToExistingLayout(businessId, layoutPageId)
      setResult(response)
    } catch (error) {
      setResult({
        success: false,
        error: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="businessId">Business ID</Label>
          <Input
            id="businessId"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            placeholder="Enter business ID"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="layoutPageId">Layout Page ID</Label>
          <Input
            id="layoutPageId"
            value={layoutPageId}
            onChange={(e) => setLayoutPageId(e.target.value)}
            placeholder="Enter layout page ID"
            required
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Connecting..." : "Connect Business to Layout"}
        </Button>
      </form>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
