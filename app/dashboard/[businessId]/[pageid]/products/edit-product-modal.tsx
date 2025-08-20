"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export function EditProductModal({ isOpen, onClose, product, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: 0,
    stock: 0,
    recieveBy: "",
  })

  const hasUserChanges = useRef(false)
  const lastProductId = useRef(null)

  useEffect(() => {
    if (product && isOpen && (!hasUserChanges.current || lastProductId.current !== product.id)) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        basePrice: product.basePrice || 0,
        stock: product.stock || 0,
        recieveBy: product.recieveBy || "",
      })
      lastProductId.current = product.id
      hasUserChanges.current = false
    }
  }, [product, isOpen]) // Updated dependency array

  const handleChange = (e) => {
    const { name, value } = e.target
    hasUserChanges.current = true
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = () => {
    onSubmit(formData)
    hasUserChanges.current = false
    onClose()
  }

  const handleOpenChange = (open) => {
    if (!open) {
      hasUserChanges.current = false
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" />
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Product Description"
          />
          <Input
            type="number"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleChange}
            placeholder="Base Price"
          />
          <Input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Stock" />
          <Input
            type="text"
            name="recieveBy"
            value={formData.recieveBy}
            onChange={handleChange}
            placeholder="recieveBy"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
