"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import { AddProductModal } from "./add-product-modal"
import { addProduct } from "@/app/api/business/products"

export default function ProductsList({ initialProducts,businessId }) {
  const [filter, setFilter] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [products, setProducts] = useState(initialProducts || [])


  const sortedProducts = [...products].sort((a, b) => {
    const valueA = a[sortBy]
    const valueB = b[sortBy]
    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const filteredProducts = sortedProducts.filter((product) =>
    product.name.toLowerCase().includes(filter.toLowerCase())
  )

  const handleAddProduct = async (formData) => {
    const updatedFormData = {
      ...formData,
      stock: parseInt(formData.stock, 10),
      basePrice: parseFloat(formData.basePrice),
      businessId:parseInt(businessId, 10),
    }

    const result = await addProduct(updatedFormData)
    if (result.success) {
      setProducts((prevProducts) => [...prevProducts, result.data])
    } else {
      console.error("Error adding product:", result.error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search products..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:max-w-[300px]"
          />
          <Search className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
        </div>
        <Button
          className="rounded-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <motion.div key={product.id} className="bg-white rounded-lg shadow-md p-4" whileHover={{ scale: 1.02 }}>
            <img
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
            <h3 className="text-lg font-medium mb-1">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{product.description}</p>
            <div className="flex justify-between items-center">
              <p className="text-gray-900 font-medium">
                {product.discount > 0 ? (
                  <>
                    <span className="text-gray-500 line-through">${product.basePrice.toFixed(2)}</span>{" "}
                    <span>${(product.basePrice * (1 - product.BeforeDiscountPrice / 100)).toFixed(2)}</span>
                  </>
                ) : (
                  `$${product?.basePrice?.toFixed(2)}`
                )}
              </p>
              {product.stock > 0 ? (
                <Badge className="bg-green-500 text-white">In Stock</Badge>
              ) : (
                <Badge className="bg-red-500 text-white">Out of Stock</Badge>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      <AddProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddProduct} />
    </div>
  )
}