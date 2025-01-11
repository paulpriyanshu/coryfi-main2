import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EvaluationModalProps {
  isOpen: boolean
  onClose: () => void
  onApprove: () => void
  onDeny: () => void
  requesterName: string
  recipientName: string
}

export function EvaluationModal({ isOpen, onClose, onApprove, onDeny, requesterName, recipientName }: EvaluationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Evaluate Connection Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve the connection between {requesterName} and {recipientName}?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="font-semibold">{requesterName}</div>
              <div className="text-sm text-muted-foreground">Requester</div>
            </div>
            <div className="text-2xl">→</div>
            <div className="text-center">
              <div className="font-semibold">You</div>
              <div className="text-sm text-muted-foreground">Intermediary</div>
            </div>
            <div className="text-2xl">→</div>
            <div className="text-center">
              <div className="font-semibold">{recipientName}</div>
              <div className="text-sm text-muted-foreground">Recipient</div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onDeny}>Deny</Button>
          <Button onClick={onApprove}>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
