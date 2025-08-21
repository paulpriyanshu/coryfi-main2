"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Check, ChevronsUpDown, ImagePlus, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/Label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import axios from "axios"

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
}

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  categories: Category[]
  products: Product[]
}

export function AddCategoryModal({ isOpen, onClose, onSubmit, categories, products }: AddCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    images: [],
    parentCategory: null,
    subcategories: [] as string[],
    products: [] as string[],
  })
  const [imagePreview, setImagePreview] = useState("")
  const [openParent, setOpenParent] = useState(false)
  const [openProducts, setOpenProducts] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const formRef = useRef<HTMLFormElement>(null)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setUploadProgress(0)

      try {
        const timestamp = Date.now()
        const uniqueFilename = `${timestamp}_${file.name}`
        const uploadUrlResponse = await axios.get(`https://media.coryfi.com/api/imageUpload/${uniqueFilename}`)
        const { url, filename } = uploadUrlResponse.data

        await axios.put(url, file, {
          headers: { "Content-Type": file.type },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          },
        })

        const previewResponse = await axios.get(`https://media.coryfi.com/api/image/${filename}`)
        setImagePreview(previewResponse.data.url)
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, previewResponse.data.url], // Append new URL
        }))
      } catch (error) {
        console.error("Error uploading image:", error)
        alert("Failed to upload image")
      }

      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [])

  const handleClose = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      images: [],
      parentCategory: null,
      subcategories: [],
      products: [],
    })
    setImagePreview("")
    setUploadProgress(0)
    setIsUploading(false)
    onClose()
  }, [onClose])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (isUploading) {
        return
      }

      onSubmit(formData)
      handleClose()
    },
    [formData, onSubmit, handleClose, isUploading],
  )

  const toggleProduct = useCallback((productId: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter((id) => id !== productId)
        : [...prev.products, productId],
    }))
  }, [])

  const toggleSubcategory = useCallback((categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.includes(categoryId)
        ? prev.subcategories.filter((id) => id !== categoryId)
        : [...prev.subcategories, categoryId],
    }))
  }, [])

  const removeProduct = useCallback((productId: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((id) => id !== productId),
    }))
  }, [])

  const removeSubcategory = useCallback((categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((id) => id !== categoryId),
    }))
  }, [])

  const clearImage = useCallback(() => {
    setImagePreview("")
    setFormData((prev) => ({ ...prev, images: [] }))
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Add New Category</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Category Image</Label>
            <div className="relative min-h-[100px]  bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
              {imagePreview ? (
                <div className="relative h-full">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="h-full w-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={clearImage}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {isUploading ? "Uploading..." : "Click to upload image"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>
              )}
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
            </div>
          </div>
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            {/* Parent Category */}
            <div className="space-y-2">
              <Label>Parent Category</Label>
              <Popover open={openParent} onOpenChange={setOpenParent}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openParent}
                    className="w-full justify-between bg-transparent"
                  >
                    {formData.parentCategory
                      ? categories.find((category) => category.id === formData.parentCategory)?.name
                      : "Select parent category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setFormData((prev) => ({ ...prev, parentCategory: "" }))
                            setOpenParent(false)
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", !formData.parentCategory ? "opacity-100" : "opacity-0")}
                          />
                          None
                        </CommandItem>
                        {categories
                          .filter((cat) => !formData.subcategories.includes(cat.id))
                          .map((category) => (
                            <CommandItem
                              key={category.id}
                              onSelect={() => {
                                setFormData((prev) => ({ ...prev, parentCategory: category.id }))
                                setOpenParent(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.parentCategory === category.id ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {category.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Subcategories */}
          <div className="space-y-2">
            <Label>Subcategories</Label>
            <Command className="border rounded-lg">
              <CommandInput placeholder="Search subcategories..." />
              <CommandList>
                <CommandEmpty>No subcategories found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="max-h-[100px]">
                    {categories
                      .filter((cat) => cat.id !== formData.parentCategory)
                      .map((category) => (
                        <CommandItem key={category.id} onSelect={() => toggleSubcategory(category.id)}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.subcategories.includes(category.id) ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {category.name}
                        </CommandItem>
                      ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
            {formData.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.subcategories.map((categoryId) => (
                  <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                    {categories.find((c) => c.id === categoryId)?.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeSubcategory(categoryId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Products */}
          <div className="space-y-2">
            <Label>Products</Label>
            <Command className="border rounded-lg">
              <CommandInput placeholder="Search products..." />
              <CommandList>
                <CommandEmpty>No products found.</CommandEmpty>
                <CommandGroup>
                  {/* Make this area scrollable */}
                  <ScrollArea className="max-h-20 overflow-y-auto">
                    {products.map((product) => (
                      <CommandItem key={product.id} onSelect={() => toggleProduct(product.id)}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.products.includes(product.id) ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {product.name}
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
            {formData.products.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.products.map((productId) => (
                  <Badge key={productId} variant="secondary" className="flex items-center gap-1">
                    {products.find((p) => p.id === productId)?.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeProduct(productId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Add Category"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
