"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from 'lucide-react'
import toast from "react-hot-toast"
import { CustomOtpInput } from "./custom-otp-input"

interface OtpVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (otp: string) => Promise<boolean>
  title?: string
  description?: string
}

export function OtpVerificationModal({
  isOpen,
  onClose,
  onVerify,
  title = "Verification Required",
  description = "Please ask the customer to enter the 6-digit OTP sent to their registered mobile number.",
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setOtp("")
      setError(null)
      setHasError(false)
    }
  }, [isOpen])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a complete 6-digit OTP")
      setHasError(true)
      return
    }

    setIsVerifying(true)
    setError(null)
    setHasError(false)

    try {
      const isValid = await onVerify(otp)

      if (isValid) {
        toast.success("Order has been marked as fulfilled")
        onClose()
      } else {
        setError("Invalid OTP. Please try again.")
        setHasError(true)
        toast.error("Invalid OTP. Please try again.")
      }
    } catch (err) {
      setError("An error occurred during verification. Please try again.")
      setHasError(true)
      toast.error("Verification failed. Please try again.")
      console.error(err)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleClose = () => {
    setOtp("")
    setError(null)
    setHasError(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-6">
          <CustomOtpInput 
            value={otp} 
            onChange={setOtp} 
            disabled={isVerifying}
            error={hasError}
          />

          {error && (
            <p className="text-sm font-medium text-red-500 text-center">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isVerifying}>
            Cancel
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={otp.length !== 6 || isVerifying}
            className="min-w-[120px]"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Fulfill"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
