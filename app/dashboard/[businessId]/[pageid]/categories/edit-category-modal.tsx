"use client"

import { useState, useEffect } from "react"
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
import { toast } from "react-hot-toast"

export function EditCategoryModal({ isOpen, onClose, onSubmit, category, categories, products }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    images: [],
    parentCategory: null,
    subcategories: [],
    products: [],
    productCategories: [],
  })

  const [imagePreview, setImagePreview] = useState("")
  const [openParent, setOpenParent] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  console.log("new categories", categories)

  useEffect(() => {
    if (category) {
      // Get all parent categories and subcategories of selected products
      const productCategories = new Set()
      const productSubcategories = new Set()

      category.products?.forEach((productId) => {
        const product = products.find((p) => p.id === productId)
        if (product?.categoryId) {
          const category = categories.find((c) => c.id === product.categoryId)
          if (category) {
            if (category.parentCategory) {
              productCategories.add(category.parentCategory)
            }
            productSubcategories.add(category.id)
          }
        }
      })

      setFormData({
        id: category.id,
        name: category.name,
        description: category.description,
        images: category.images,
        parentCategory: category.parentCategoryId ? categories.find((c) => c.id === category.parentCategoryId) : "",
        subcategories: [...productSubcategories, ...(category.subcategories || [])],
        products: category.products || [],
        productCategories: [...productCategories], // Add this new field
      })
      setImagePreview(category.images[0] || "")
    }
  }, [category, categories, products])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = async (e) => {
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
          images: [previewResponse.data.url, ...prev.images],
        }))
        toast.success("Image uploaded successfully")
      } catch (error) {
        console.error("Error uploading image:", error)
        toast.error("Failed to upload image")
      }

      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
      toast.success("Category updated successfully")
      onClose()
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error("Failed to update category")
    }
  }

  const toggleProduct = (product) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.some((p) => (typeof p === "number" ? p : p.id) === product.id)
        ? prev.products.filter((p) => (typeof p === "number" ? p : p.id) !== product.id)
        : [...prev.products, { id: product.id, name: product.name }],
    }))
  }

  const toggleSubcategory = (subcategory) => {
    console.log("updation", subcategory)
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.some((s) => (typeof s === "number" ? s : s.id) === subcategory.id)
        ? prev.subcategories.filter((s) => (typeof s === "number" ? s : s.id) !== subcategory.id)
        : [...prev.subcategories, { id: subcategory.id, name: subcategory.name }],
    }))
  }

  const removeProduct = (productId) => {
    try {
      setFormData((prev) => ({
        ...prev,
        products: prev.products.filter((p) => (typeof p === "number" ? p : p.id) !== productId),
      }))
      toast.success("Product removed successfully")
    } catch (error) {
      console.error("Error removing product:", error)
      toast.error("Failed to remove product")
    }
  }

  const removeSubcategory = (subcategory) => {
    try {
      setFormData((prev) => ({
        ...prev,
        subcategories: prev.subcategories.filter((s) => {
          const sId = typeof s === "object" ? s.id : s;
          const targetId = typeof subcategory === "object" ? subcategory.id : subcategory;
          return sId !== targetId;
        }),
      }));
      toast.success("Subcategory removed successfully");
    } catch (error) {
      console.error("Error removing subcategory:", error);
      toast.error("Failed to remove subcategory");
    }
  };
  console.log("category Id parent ",formData.parentCategory)
  console.log("category Id parent 2",formData)
  const isSubcategory = (categoryId) => {
    return formData.subcategories.some((s) => {
      const subId = typeof s === "object" ? s.id : s;
      return subId === categoryId;
    });
  };
  console.log("formdata", formData)

  const toggleParentCategory = (category) => {
    setFormData((prev) => ({
      ...prev,
      parentCategory: prev.parentCategory?.id === category.id ? null : category,
    }))
  }
  const removeParentCategory = () => {
    setFormData((prev) => ({
      ...prev,
      parentCategory: null,
    }))
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Edit Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Category Image</Label>
            <div className="relative min-h-[100px] bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
              {imagePreview ? (
                <div className="relative h-full">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="max-h-[300px] w-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview("")
                      setFormData((prev) => ({ ...prev, images: [] }))
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Click to upload image</p>
                  <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>
              )}
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}

          <div>
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
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
                      .filter(
                        (cat) =>
                          cat.id !== formData.id &&
                          cat.id !== formData?.parentCategory?.id &&
                          !formData.subcategories.some((s) => (typeof s === "number" ? s : s.id) === cat.id),
                      )
                      .map((category) => (
                        <CommandItem key={category.id} onSelect={() => toggleSubcategory(category)}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.subcategories.some((s) => (typeof s === "number" ? s : s.id) === category.id)
                                ? "opacity-100"
                                : "opacity-0",
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
                    {categories.find((c) => c.id === categoryId.id)?.name}
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
                  <ScrollArea className="max-h-20 overflow-y-auto">
                    {products.map((product) => (
                      <CommandItem key={product.id} onSelect={() => toggleProduct(product)}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.products.some((p) => (typeof p === "number" ? p : p.id) === product.id)
                              ? "opacity-100"
                              : "opacity-0",
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
                {formData.products.map((product) => {
                  const productId = typeof product === "number" ? product : product.id
                  const productData = products.find((p) => p.id === productId)
                  return (
                    <Badge key={productId} variant="secondary" className="flex items-center gap-1">
                      {productData?.name}
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
                  )
                })}
              </div>
            )}
          </div>

          {/* Product Categories */}
          {formData.productCategories?.length > 0 && (
            <div className="space-y-2">
              <Label>Product Categories</Label>
              <div className="flex flex-wrap gap-2">
                {formData.productCategories.map((categoryId) => (
                  <Badge key={categoryId} variant="secondary">
                    {categories.find((c) => c.id === categoryId)?.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Update Category
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

