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
import { cn } from "@/lib/utils"

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
      <DialogContent
        className={cn(
          "sm:max-w-md w-full sm:rounded-lg rounded-none",
          "sm:my-auto my-0 h-full sm:h-auto flex flex-col justify-center",
          "bg-white text-gray-900",
          "dark:bg-neutral-900 dark:text-gray-100" // dark mode colors
        )}
      >
        <DialogHeader className="px-2 sm:px-0 text-center sm:text-left">
          <DialogTitle className="text-lg sm:text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-6 px-2 sm:px-0">
          <CustomOtpInput 
            value={otp} 
            onChange={setOtp} 
            disabled={isVerifying}
            error={hasError}
            className="text-lg sm:text-xl dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
          />

          {error && (
            <p className="text-sm font-medium text-red-500 text-center px-2">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 px-2 sm:px-0 pb-4 sm:pb-0">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isVerifying}
            className="w-full sm:w-auto py-3 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={otp.length !== 6 || isVerifying}
            className="w-full sm:w-auto py-3 min-w-[120px]"
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