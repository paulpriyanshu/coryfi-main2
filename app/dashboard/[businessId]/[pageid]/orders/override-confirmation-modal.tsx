"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface OverrideConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  orderDetails: {
    order_id: string
    totalItems: number
  } | null
}

export function OverrideConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  orderDetails,
}: OverrideConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error("Error overriding fulfillment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Override Fulfillment
          </DialogTitle>
          <DialogDescription>
            This action will mark all items in this order as fulfilled and complete all associated tasks. This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {orderDetails && (
          <div className="py-4">
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Order ID:</span> {orderDetails.order_id}
              </p>
              <p className="text-sm">
                <span className="font-medium">Items to fulfill:</span> {orderDetails.totalItems}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Processing..." : "Override Fulfillment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
