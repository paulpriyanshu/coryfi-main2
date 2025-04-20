"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export function CustomizationDetailModal({ customization }) {
  const [open, setOpen] = useState(false)

  if (!customization) return null

  // Parse customization string into structured data if possible
  const parseCustomization = (customizationStr) => {
    try {
      // Check if it's a comma-separated list of key-value pairs
      if (customizationStr.includes(":")) {
        const items = customizationStr.split(",").map((item) => item.trim())
        return items.map((item) => {
          const [key, value] = item.split(":").map((part) => part.trim())
          return { key, value }
        })
      } else {
        // Just return as a single item
        return [{ key: "Customization", value: customizationStr }]
      }
    } catch (e) {
      return [{ key: "Customization", value: customizationStr }]
    }
  }

  const customizationItems = parseCustomization(customization)

  return (
    <>
      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setOpen(true)}>
        View Details
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customization Details</DialogTitle>
            <DialogDescription>Customer-specific product customizations</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {customizationItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <Badge variant="outline" className="font-medium">
                  {item.key}
                </Badge>
                <span className="text-sm">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

