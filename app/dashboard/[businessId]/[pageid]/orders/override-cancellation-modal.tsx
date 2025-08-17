"use client"

import { useState } from "react"
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/Label"

interface OverrideCancellationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (cancellationReason: string) => Promise<void>
  orderDetails: {
    order_id: string
    orderId: string
    totalItems: number
  } | null
}

export function OverrideCancellationModal({
  isOpen,
  onClose,
  onConfirm,
  orderDetails,
}: OverrideCancellationModalProps) {
  const [cancellationReason, setCancellationReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (!cancellationReason.trim()) {
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(cancellationReason)
      setCancellationReason("")
      onClose()
    } catch (error) {
      console.error("Error confirming override cancellation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setCancellationReason("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Override Order Cancellation
          </DialogTitle>
          <DialogDescription>
            This action will cancel all items in this order and mark associated tasks as cancelled.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {orderDetails && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Order ID:</span>
                <span className="font-mono text-sm">{orderDetails.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Items:</span>
                <span>{orderDetails.totalItems}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancellation-reason" className="text-sm font-medium">
                Cancellation Reason *
              </Label>
              <Textarea
                id="cancellation-reason"
                placeholder="Please provide a detailed reason for cancelling this order..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="min-h-[100px] resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                This reason will be recorded for audit purposes.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !cancellationReason.trim()}
          >
            {isLoading ? "Cancelling Order..." : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
