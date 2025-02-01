"use client"

import Image from "next/image"
import { Plus, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditableText } from "@/components/editable-text"

interface Product {
  id: number
  name: string
  price: number
}

interface EditableProductGridProps {
  products: Product[]
  isEditing: boolean
  onUpdate: (products: Product[]) => void
}

export function EditableProductGrid({ products, isEditing, onUpdate }: EditableProductGridProps) {
  const updateProduct = (index: number, key: string, value: string | number) => {
    const updatedProducts = [...products]
    updatedProducts[index] = { ...updatedProducts[index], [key]: value }
    onUpdate(updatedProducts)
  }

  const addProduct = () => {
    const newProduct = {
      id: products.length + 1,
      name: `New Product ${products.length + 1}`,
      price: 0,
    }
    onUpdate([...products, newProduct])
  }

  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index)
    onUpdate(updatedProducts)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {products.map((product, index) => (
        <div key={product.id} className="group relative aspect-square rounded-lg overflow-hidden bg-muted">
          <Image
            src={`/placeholder.svg?height=300&width=300&text=Product ${product.id}`}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
            <div className="p-4 w-full text-white">
              <EditableText
                value={product.name}
                isEditing={isEditing}
                onUpdate={(value) => updateProduct(index, "name", value)}
                className="font-semibold"
              />
              <EditableText
                value={`$${product.price.toFixed(2)}`}
                isEditing={isEditing}
                onUpdate={(value) => updateProduct(index, "price", Number.parseFloat(value.replace("$", "")))}
                className="text-sm text-white/80"
              />
            </div>
          </div>
          {isEditing && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => removeProduct(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      {isEditing && (
        <Button
          variant="outline"
          className="aspect-square flex flex-col items-center justify-center"
          onClick={addProduct}
        >
          <Plus className="h-6 w-6 mb-2" />
          Add Product
        </Button>
      )}
    </div>
  )
}

