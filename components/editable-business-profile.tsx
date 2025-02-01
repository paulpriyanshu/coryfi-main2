"use client"

import { useState } from "react"
import { EditableCarousel } from "@/components/editable-carousel"
import { EditableCategoryCarousel } from "@/components/editable-category-carousel"
import { EditableProductGrid } from "@/components/editable-product-grid"
import { SearchInput } from "@/components/search-input"
import { EditableText } from "@/components/editable-text"
import { EditableImage } from "@/components/editable-image"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/Label"

function getInitialBusinessData() {
  return {
    name: "Business Name",
    description: "Professional business description and tagline",
    featuredProducts: [1, 2, 3, 4, 5],
    categories: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    products: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Product ${i + 1}`,
      price: 99.99,
    })),
    profileImage: "/placeholder.svg?height=96&width=96",
  }
}

export function EditableBusinessProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [businessData, setBusinessData] = useState(getInitialBusinessData())

  const updateBusinessData = (key: string, value: any) => {
    setBusinessData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-end p-4 border-b">
        <div className="flex items-center space-x-2">
          <Switch id="edit-mode" checked={isEditing} onCheckedChange={setIsEditing} />
          <Label htmlFor="edit-mode">Edit Mode</Label>
        </div>
      </div>

      <EditableCarousel
        images={businessData.featuredProducts}
        height={300}
        isEditing={isEditing}
        onUpdate={(value) => updateBusinessData("featuredProducts", value)}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <EditableImage
            src={businessData.profileImage}
            alt="Business Profile"
            isEditing={isEditing}
            onUpdate={(value) => updateBusinessData("profileImage", value)}
            className="w-40 h-40 rounded-full overflow-hidden border-4 border-background bg-slate-100 shadow-lg"
          />
          <div>
            <EditableText
              value={businessData.name}
              isEditing={isEditing}
              onUpdate={(value) => updateBusinessData("name", value)}
              className="text-3xl font-bold"
            />
            <EditableText
              value={businessData.description}
              isEditing={isEditing}
              onUpdate={(value) => updateBusinessData("description", value)}
              className="text-muted-foreground"
              multiline
            />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Featured Categories</h2>
          <EditableCategoryCarousel
            categories={businessData.categories}
            isEditing={isEditing}
            onUpdate={(value) => updateBusinessData("categories", value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">All Products</h2>
            <SearchInput />
          </div>

          <EditableProductGrid
            products={businessData.products}
            isEditing={isEditing}
            onUpdate={(value) => updateBusinessData("products", value)}
          />
        </div>
      </div>
    </div>
  )
}

