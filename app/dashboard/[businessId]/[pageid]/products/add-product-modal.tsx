"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/Label"
import { Checkbox } from "@/components/ui/checkbox"
import axios from "axios"

export function AddProductModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    beforeDiscountPrice: "",
    sales: "",
    stock: null,
    SKU: "",
    images: [],
    receiveBy: [],
    takeawayCharge: "",
    deliveryCharge: "",
    dineinCharge: "",
  })

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const receiveByOptions = [
    { id: "DELIVERY", label: "Delivery" },
    { id: "DINEIN", label: "Dine In" },
    { id: "TAKEAWAY", label: "Takeaway" },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "stock" && (!/^[0-9]+$/.test(value) || Number.parseInt(value, 10) < 0)) return

    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleReceiveByChange = (id) => {
    setFormData((prevData) => {
      const currentValues = [...prevData.receiveBy]
      if (currentValues.includes(id)) {
        return {
          ...prevData,
          receiveBy: currentValues.filter((value) => value !== id),
        }
      } else {
        return {
          ...prevData,
          receiveBy: [...currentValues, id],
        }
      }
    })
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (formData.images.length + files.length > 5) {
      alert("You can only upload up to 5 images per post")
      return
    }

    for (const file of files) {
      setIsUploading(true)
      setUploadProgress(0)

      try {
        const timestamp = Date.now()
        const uniqueFilename = `${timestamp}_${file.name}`
        const uploadUrlResponse = await axios.get(
          `https://media.coryfi.com/api/imageUpload/${uniqueFilename}`
        )
        const { url, filename } = uploadUrlResponse.data

        await axios.put(url, file, {
          headers: { "Content-Type": file.type },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setUploadProgress(percentCompleted)
          },
        })

        const previewResponse = await axios.get(
          `https://media.coryfi.com/api/image/${filename}`
        )
        console.log("preview Response",previewResponse)
        setFormData((prevData) => ({
          ...prevData,
          images: [...prevData.images, previewResponse.data.url],
        }))
      } catch (error) {
        console.error("Error uploading image:", error)
        alert("Failed to upload image")
      }
    }

    setIsUploading(false)
    setUploadProgress(0)
    e.target.value = ""
  }

  const handleRemoveImage = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} />

            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />

            <Label htmlFor="basePrice">Base Price</Label>
            <Input
              id="basePrice"
              name="basePrice"
              type="number"
              value={formData.basePrice}
              onChange={handleChange}
            />

            <Label htmlFor="beforeDiscountPrice">Before Discount Price</Label>
            <Input
              id="beforeDiscountPrice"
              name="beforeDiscountPrice"
              type="number"
              value={formData.beforeDiscountPrice}
              onChange={handleChange}
            />

            <Label htmlFor="sales">Sales</Label>
            <Input
              id="sales"
              name="sales"
              type="number"
              value={formData.sales}
              onChange={handleChange}
            />

            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              min="0"
            />

            <Label htmlFor="SKU">SKU</Label>
            <Input id="SKU" name="SKU" value={formData.SKU} onChange={handleChange} />

            <div className="space-y-2">
              <Label>Receive By</Label>
              <div className="space-y-2">
                {receiveByOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`receive-by-${option.id}`}
                      checked={formData.receiveBy.includes(option.id)}
                      onCheckedChange={() => handleReceiveByChange(option.id)}
                    />
                    <Label htmlFor={`receive-by-${option.id}`} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Label htmlFor="takeawayCharge">Takeaway Charge</Label>
              <Input
                id="takeawayCharge"
                name="takeawayCharge"
                type="number"
                value={formData.takeawayCharge}
                onChange={handleChange}
                disabled={!formData.receiveBy.includes("TAKEAWAY")}
              />

              <Label htmlFor="deliveryCharge">Delivery Charge</Label>
              <Input
                id="deliveryCharge"
                name="deliveryCharge"
                type="number"
                value={formData.deliveryCharge}
                onChange={handleChange}
                disabled={!formData.receiveBy.includes("DELIVERY")}
              />

              <Label htmlFor="dineinCharge">Dine-in Charge</Label>
              <Input
                id="dineinCharge"
                name="dineinCharge"
                type="number"
                value={formData.dineinCharge}
                onChange={handleChange}
                disabled={!formData.receiveBy.includes("DINEIN")}
              />
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              {formData.images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img || "/placeholder.svg"}
                    alt="Uploaded"
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    onClick={() => handleRemoveImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}