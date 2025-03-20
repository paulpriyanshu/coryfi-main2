"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"

export function VariantModal({
  isOpen,
  onClose,
  products,
  selectedProductId,
  onSubmit,
  mode = "add",
  variant = null,
  onDelete = null,
}) {
  const [relationType, setRelationType] = useState("")
  const [description, setDescription] = useState("")
  const [selectedProdId, setSelectedProdId] = useState(null)
  console.log("selected product",variant)

  // Initialize form when modal opens or variant changes
  useEffect(() => {
    if (variant) {
      setRelationType(variant.relationType || "")
      setDescription(variant.description || "")

      // For edit mode, set the selected product ID based on the variant
      if (mode === "edit") {
        setSelectedProdId(variant.productB?.id?.toString() || variant.oldProductId?.toString())
      }
    } else {
      // Reset form for add mode
      setRelationType("")
      setDescription("")
      setSelectedProdId(null)
    }
  }, [variant, mode, isOpen])

  // Filter products to exclude the selected product (parent product)
  const filteredProducts = products.filter((product) => product.id.toString() !== selectedProductId?.toString())

  const resetForm = () => {
    setRelationType("")
    setDescription("")
    setSelectedProdId(null)
  }

  // Update the form submission handler to include the oldRelationType
  const handleSubmit = () => {
    if (!selectedProdId || isNaN(Number.parseInt(selectedProdId))) {
      alert("Please select a valid product")
      return
    }

    if (!relationType.trim()) {
      alert("Please enter a relation type (e.g., color, size, storage)")
      return
    }
    

    const variantData = {
      productAId: Number(selectedProductId), // Current product
      productBId: Number(selectedProdId), // Selected variant product
      relationType: relationType.trim(),
      description: description.trim() || null,
    }

    if (mode === "edit" && variant) {
      variantData.relationId = variant.relationId
      variantData.oldRelationType = variant.oldRelationType || variant.relationType
    }

    onSubmit(variantData)
    resetForm()
    onClose()
  }

  // Update the delete handler to match the new API
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this variant relationship? This action cannot be undone.")) {
      if (onDelete) {
        onDelete(Number(selectedProductId), variant.oldRelationType || variant.relationType, Number(selectedProdId))
      }
      onClose()
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        resetForm()
        onClose()
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Variant" : "Edit Variant"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new variant relationship between products."
              : "Edit existing variant relationship."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="relationType" className="text-right">
              Relation Type
            </Label>
            <Input
              id="relationType"
              value={relationType}
              onChange={(e) => setRelationType(e.target.value)}
              placeholder="color, size, storage, etc."
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="variantProductId" className="text-right">
              Variant Product
            </Label>
            <Select value={selectedProdId || ""} onValueChange={(value) => setSelectedProdId(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-products" disabled>
                    No available products
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of the relationship"
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm()
              onClose()
            }}
          >
            Cancel
          </Button>
          {mode === "edit" && onDelete && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!selectedProdId || !relationType.trim() || filteredProducts.length === 0}
          >
            {mode === "add" ? "Add Variant" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

