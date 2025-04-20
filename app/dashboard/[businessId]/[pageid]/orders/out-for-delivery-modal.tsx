"use client"

import { Button } from "@/components/ui/button"

interface OutForDeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  orderDetails: {
    order_id: string
    userId: string
    createdAt: string
    totalCost: number
    product: {
      name: string
      quantity: number
      customization?: string
    }
  } | null
}

export function OutForDeliveryModal({ isOpen, onClose, onConfirm, orderDetails }: OutForDeliveryModalProps) {
  if (!isOpen || !orderDetails) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Confirm Out For Delivery</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium">Order ID:</p>
              <p className="text-sm">{orderDetails.order_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Customer:</p>
              <p className="text-sm">User #{orderDetails.userId}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Date:</p>
              <p className="text-sm">{formatDate(orderDetails.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total:</p>
              <p className="text-sm">${orderDetails.totalCost.toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Product Details:</p>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm">
                <span className="font-medium">Name:</span> {orderDetails.product.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Quantity:</span> {orderDetails.product.quantity}
              </p>
              {orderDetails.product.customization && (
                <p className="text-sm">
                  <span className="font-medium">Customization:</span> {orderDetails.product.customization}
                </p>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to mark this item as out for delivery?
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  )
}
