"use client"

import { useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Tag, Pencil, Trash2 } from 'lucide-react'
import { AddCategoryModal } from "./add-category-modal"
import { EditCategoryModal } from "./edit-category-modal"
import { addCategory, updateCategory, deleteCategory } from "@/app/api/business/products"

export default function CategoriesList({ initialCategories, pageId, businessId, initialProducts }) {
  console.log("categories", initialCategories)
  const [filter, setFilter] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [categories, setCategories] = useState(initialCategories || [])
  const [editingCategory, setEditingCategory] = useState(null)

  // <CHANGE> Memoize filtered categories to prevent unnecessary re-renders
  const filteredCategories = useMemo(() => 
    categories?.filter((category) =>
      category?.name?.toLowerCase().includes(filter.toLowerCase())
    ) || [], [categories, filter]
  )

  // <CHANGE> Memoize callback functions to prevent re-renders of child components
  const handleAddCategory = useCallback(async (formData) => {
    const updatedFormData = {
      ...formData,
      businessPageId: pageId,
    }
    console.log("adding category", updatedFormData)
    const newCategory = await addCategory(updatedFormData)
    if (newCategory) {
      setCategories((prevCategories) => [...prevCategories, newCategory])
    } else {
      console.error("Error adding category")
    }
  }, [pageId])

  const handleEditCategory = useCallback(async (formData) => {
    console.log("update", formData)
    const updatedCategory = await updateCategory(
      formData.id,
      formData.name,
      formData.parentCategoryId,
      formData.images,
      formData.subcategories,
      formData.categoryCarouselId,
      formData.products
    );
    if (updatedCategory) {
      setCategories((prevCategories) =>
        prevCategories.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)),
      )
      setIsEditModalOpen(false)
      setEditingCategory(null)
    } else {
      console.error("Error updating category")
    }
  }, [])

  const handleDeleteCategory = useCallback(async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      const success = await deleteCategory(categoryId)
      if (success) {
        setCategories((prevCategories) => prevCategories.filter((cat) => cat.id !== categoryId))
      } else {
        console.error("Error deleting category")
      }
    }
  }, [])

  // <CHANGE> Memoize modal close handlers to prevent unnecessary re-renders
  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false)
  }, [])

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false)
    setEditingCategory(null)
  }, [])

  const handleOpenEditModal = useCallback((category) => {
    setEditingCategory(category)
    setIsEditModalOpen(true)
  }, [])

  console.log("filtered", filteredCategories)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full sm:w-auto">
          <Input
            type="search"
            placeholder="Search categories..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-[300px] pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button
          className="w-full sm:w-auto rounded-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white border-0"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.length === 0 ? (
          <div> no categories found</div>
        ) : (
          filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative h-40 w-full">
                <img
                  src={category.images[0] || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-cover rounded-t-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => handleOpenEditModal(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <Tag className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-medium">{category.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{category.description}</p>
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                  {category.products?.length || 0} products
                </Badge>
              </div>
            </motion.div>
          ))
        )}
      </div>
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleAddCategory}
        categories={categories}
        products={initialProducts}
      />
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleEditCategory}
        category={editingCategory}
        categories={categories}
        products={initialProducts}
      />
    </div>
  )
}
