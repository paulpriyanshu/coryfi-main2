"use client"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Search, Plus, Package, Edit, Trash2, ChevronRight, GripVertical } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AddProductModal } from "./add-product-modal"
import { VariantModal } from "./add-variant-modal"
import {
  addProduct,
  editProduct,
  addVariant,
  deleteProduct,
  editProductVariant,
  deleteProductVariant,
  autoRevalidateProducts,
} from "@/app/api/business/products"
import "slick-carousel/slick/slick.css"
import axios from "axios"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { useTransition } from "react"

type RecieveBy = ("DELIVER" | "DINEIN" | "TAKEAWAY")[]

export default function ProductsList({ initialProducts, pageId, businessId }) {
  const [filter, setFilter] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false)
  const [variantEditMode, setVariantEditMode] = useState("add")
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [products, setProducts] = useState(initialProducts || [])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  const sortedProducts = [...products].sort((a, b) => {
    const valueA = a[sortBy]
    const valueB = b[sortBy]
    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const filteredProducts = sortedProducts.filter((product) => product.name.toLowerCase().includes(filter.toLowerCase()))

  const handleAddProduct = async (formData) => {
    const updatedFormData = {
      ...formData,
      stock: Number.parseInt(formData.stock, 10),
      basePrice: Number.parseFloat(formData.basePrice),
      businessPageId: pageId,
      deliveryCharge: formData.deliveryCharge ? Number.parseFloat(formData.deliveryCharge) : null,
      takeawayCharge: formData.takeawayCharge ? Number.parseFloat(formData.takeawayCharge) : null,
      dineinCharge: formData.dineinCharge ? Number.parseFloat(formData.dineinCharge) : null,
    }
    console.log("adding prod", updatedFormData)
    const result = await addProduct(updatedFormData)
    if (result.success) {
      setProducts((prevProducts) => [...prevProducts, result.data])
    } else {
      console.error("Error adding product:", result.error)
    }
  }

  const handleEditProduct = async (productId, productData) => {
    const result = await editProduct(productId, productData)
    if (result.success) {
      setProducts((prevProducts) => prevProducts.map((product) => (product.id === productId ? result.data : product)))
      setIsEditing(false)
      return result.data
    } else {
      console.error("Error editing product:", result.error)
      return null
    }
  }

  const handleVariantSubmit = async (variantData) => {
    const { productAId, productBId, relationType, description, oldRelationType, relationId } = variantData

    if (variantEditMode === "add") {
      const result = await addVariant(productAId, productBId, relationType, description)
      if (result.success) {
        setProducts((prevProducts) => {
          return prevProducts.map((product) => {
            if (product.id === productAId) {
              const updatedVariantsByType = { ...product.variantsByType }

              if (!updatedVariantsByType[relationType]) {
                updatedVariantsByType[relationType] = []
              }

              const relatedProduct = products.find((p) => p.id === productBId)
              updatedVariantsByType[relationType].push({
                product: relatedProduct,
                description: description || null,
              })

              return {
                ...product,
                variantsByType: updatedVariantsByType,
              }
            }
            return product
          })
        })
      } else {
        console.error("Error adding variant:", result?.error)
      }
    } else if (variantEditMode === "edit" && selectedVariant) {
      console.log("relationID", relationId)
      const result = await editProductVariant(
        relationId,
        productAId,
        productBId,
        relationType,
        description,
        businessId,
        pageId,
      )
      await autoRevalidateProducts(businessId, pageId)

      if (result) {
        setProducts((prevProducts) => {
          return prevProducts.map((product) => {
            if (product.id === productAId) {
              const updatedVariantsByType = { ...product.variantsByType }

              if (oldRelationType !== relationType && updatedVariantsByType[oldRelationType]) {
                updatedVariantsByType[oldRelationType] = updatedVariantsByType[oldRelationType].filter(
                  (v) => v.product.id !== productBId,
                )

                if (updatedVariantsByType[oldRelationType].length === 0) {
                  delete updatedVariantsByType[oldRelationType]
                }
              }

              if (!updatedVariantsByType[relationType]) {
                updatedVariantsByType[relationType] = []
              }

              const relatedProduct = products.find((p) => p.id === productBId)

              if (oldRelationType === relationType) {
                updatedVariantsByType[relationType] = updatedVariantsByType[relationType].map((v) =>
                  v.product.id === productBId ? { product: relatedProduct, description: description || null } : v,
                )
              } else {
                updatedVariantsByType[relationType].push({
                  product: relatedProduct,
                  description: description || null,
                })
              }

              return {
                ...product,
                variantsByType: updatedVariantsByType,
              }
            }
            return product
          })
        })
      } else {
        console.error("Error editing variant")
      }
    }
  }

  const handleDeleteVariant = (productId, relationType, variantProductId) => {
    startTransition(async () => {
      try {
        const result = await deleteProductVariant(productId, variantProductId, relationType, businessId, pageId)

        if (result) {
          setProducts((prevProducts) => {
            return prevProducts.map((product) => {
              if (product.id === productId && product.variantsByType[relationType]) {
                const updatedVariantsByType = { ...product.variantsByType }

                updatedVariantsByType[relationType] = updatedVariantsByType[relationType].filter(
                  (v) => v.product.id !== variantProductId,
                )

                if (updatedVariantsByType[relationType].length === 0) {
                  delete updatedVariantsByType[relationType]
                }

                return {
                  ...product,
                  variantsByType: updatedVariantsByType,
                }
              }
              return product
            })
          })
        }
      } catch (error) {
        console.error("Error deleting variant:", error)
      }
    })
  }

  const handleSmallScreenClick = (productId) => {
    setSelectedProduct(productId)
    setIsDetailsOpen(true)
  }

  const handleLargeScreenClick = (productId) => {
    setSelectedProduct(productId)
  }

  const selectedProductData = products.find((p) => p?.id === selectedProduct)

  const ProductDetails = () => {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [localEditedProduct, setLocalEditedProduct] = useState(null)
    const [isUploadingImages, setIsUploadingImages] = useState(false)
    const isInitialized = useRef(false)

    useEffect(() => {
      if (selectedProductData && (!isInitialized.current || !isEditing)) {
        setLocalEditedProduct({
          ...selectedProductData,
          images: [...(selectedProductData.images || [])].slice(0, 5),
          recieveBy: selectedProductData.recieveBy || ["DELIVERY"],
          deliveryCharge: selectedProductData.deliveryCharge,
          takeawayCharge: selectedProductData.takeawayCharge,
          dineinCharge: selectedProductData.dineinCharge,
        })
        isInitialized.current = true
      }
    }, [selectedProductData?.id, isEditing])

    useEffect(() => {
      isInitialized.current = false
    }, [selectedProductData?.id])

    const handleInputChange = (field, value) => {
      setLocalEditedProduct((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

    const handleImageUpload = async (e) => {
      const files = Array.from(e.target.files)
      if (files.length === 0) return

      setIsUploadingImages(true)
      setIsUploading(true)
      setUploadProgress(0)

      const newImages = [...localEditedProduct.images]

      for (let i = 0; i < files.length && newImages.length < 5; i++) {
        const file = files[i]
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
          newImages.push(previewResponse.data.url)
        } catch (error) {
          console.error("Error uploading image:", error)
          alert(`Failed to upload image: ${file.name}`)
        }
      }

      setLocalEditedProduct((prev) => ({
        ...prev,
        images: newImages,
      }))

      setIsUploading(false)
      setUploadProgress(0)
      setIsUploadingImages(false)
      e.target.value = ""
    }

    const handleRemoveImage = (index) => {
      setLocalEditedProduct((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }))
    }

    const handleSave = async () => {
      const productData = {
        name: localEditedProduct.name,
        basePrice: Number.parseFloat(localEditedProduct.basePrice),
        stock: Number.parseInt(localEditedProduct.stock, 10),
        description: localEditedProduct.description,
        images: localEditedProduct.images,
        recieveBy: localEditedProduct.recieveBy,
        deliveryCharge: localEditedProduct.deliveryCharge,
        takeawayCharge: localEditedProduct.takeawayCharge,
        dineinCharge: localEditedProduct.dineinCharge,
      }

      const updatedProduct = await handleEditProduct(selectedProduct, productData)
      if (updatedProduct) {
        setLocalEditedProduct({
          ...updatedProduct,
          images: [...(updatedProduct.images || [])].slice(0, 5),
          recieveBy: updatedProduct.recieveBy || ["DELIVERY"],
          deliveryCharge: updatedProduct.deliveryCharge,
          takeawayCharge: updatedProduct.takeawayCharge,
          dineinCharge: updatedProduct.dineinCharge,
        })
      }
    }

    const onDragEnd = (result) => {
      if (!result.destination) {
        return
      }

      const newImages = Array.from(localEditedProduct.images)
      const [reorderedItem] = newImages.splice(result.source.index, 1)
      newImages.splice(result.destination.index, 0, reorderedItem)

      setLocalEditedProduct((prev) => ({
        ...prev,
        images: newImages,
      }))
    }

    const handleDeleteProduct = async (productId) => {
      try {
        await deleteProduct(productId)
        setProducts((prev) => prev.filter((product) => product.id !== productId))
        if (window.matchMedia("(max-width: 768px)").matches) {
          setIsDetailsOpen(false)
        }
      } catch (error) {
        console.error("error deleting product", error)
      }
    }

    const variantTypes = selectedProductData.variantsByType || {}

    if (!localEditedProduct) {
      return <div>Loading...</div>
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            {isEditing ? (
              <Input
                type="text"
                value={localEditedProduct?.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            ) : (
              <h3 className="text-lg font-medium text-gray-900">{selectedProductData.name}</h3>
            )}
            <p className="text-sm text-gray-500">Product details and variants</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false)
                    setLocalEditedProduct({
                      ...selectedProductData,
                      images: [...(selectedProductData.images || [])].slice(0, 5),
                      recieveBy: selectedProductData.recieveBy || ["DELIVERY"],
                      deliveryCharge: selectedProductData.deliveryCharge,
                      takeawayCharge: selectedProductData.takeawayCharge,
                      dineinCharge: selectedProductData.dineinCharge,
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave}>
                  Save
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(true)
                  setLocalEditedProduct({
                    ...selectedProductData,
                    images: [...(selectedProductData.images || [])].slice(0, 5),
                    recieveBy: selectedProductData.recieveBy || ["DELIVERY"],
                    deliveryCharge: selectedProductData.deliveryCharge,
                    takeawayCharge: selectedProductData.takeawayCharge,
                    dineinCharge: selectedProductData.dineinCharge,
                  })
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
                  handleDeleteProduct(selectedProductData.id)
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6 flex justify-center">
          {isEditing ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="images" direction="horizontal">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-3 gap-4">
                    {localEditedProduct.images.map((image, index) => (
                      <Draggable key={`image-${index}`} draggableId={`image-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`relative ${snapshot.isDragging ? "z-10" : ""}`}
                          >
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Product ${index}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <div
                              {...provided.dragHandleProps}
                              className="absolute top-2 left-2 bg-white p-1 rounded-full cursor-move"
                            >
                              <GripVertical className="h-4 w-4 text-gray-500" />
                            </div>
                            <button
                              type="button"
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {(selectedProductData.images || []).map((image, index) => (
                <img
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`Product ${index}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
          {isEditing && (
            <div className="flex justify-center">
              <label className="bg-blue-500 text-white p-2 rounded-full cursor-pointer flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Images
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                  disabled={localEditedProduct.images.length >= 5}
                />
              </label>
            </div>
          )}
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Base Price</p>
            {isEditing ? (
              <Input
                type="number"
                value={localEditedProduct?.basePrice || ""}
                onChange={(e) => handleInputChange("basePrice", e.target.value)}
              />
            ) : (
              <p className="text-lg font-medium">₹{selectedProductData.basePrice?.toFixed(2)}</p>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Stock</p>
            {isEditing ? (
              <Input
                type="number"
                value={localEditedProduct?.stock || ""}
                onChange={(e) => handleInputChange("stock", Number.parseInt(e.target.value, 10))}
              />
            ) : (
              <p className="text-lg font-medium">{selectedProductData.stock} units</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {localEditedProduct.recieveBy?.includes("DELIVERY") && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Delivery Price</p>
              {isEditing ? (
                <Input
                  type="number"
                  value={localEditedProduct.deliveryCharge || ""}
                  onChange={(e) =>
                    handleInputChange("deliveryCharge", e.target.value ? Number.parseFloat(e.target.value) : null)
                  }
                  placeholder="Same as bases price"
                />
              ) : (
                <p className="text-lg font-medium">
                  {selectedProductData.deliveryCharge !== null && selectedProductData.deliveryCharge !== undefined
                    ? `₹${selectedProductData.deliveryCharge.toFixed(2)}`
                    : "Same as base price"}
                </p>
              )}
            </div>
          )}

          {localEditedProduct.recieveBy?.includes("TAKEAWAY") && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Takeaway Price</p>
              {isEditing ? (
                <Input
                  type="number"
                  value={localEditedProduct.takeawayCharge || ""}
                  onChange={(e) =>
                    handleInputChange("takeawayCharge", e.target.value ? Number.parseFloat(e.target.value) : null)
                  }
                  placeholder="Same as base price"
                />
              ) : (
                <p className="text-lg font-medium">
                  {selectedProductData.takeawayCharge !== null && selectedProductData.takeawayCharge !== undefined
                    ? `₹${selectedProductData.takeawayCharge.toFixed(2)}`
                    : "Same as base price"}
                </p>
              )}
            </div>
          )}

          {localEditedProduct.recieveBy?.includes("DINEIN") && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Dine-in Price</p>
              {isEditing ? (
                <Input
                  type="number"
                  value={localEditedProduct.dineinCharge || ""}
                  onChange={(e) =>
                    handleInputChange("dineinCharge", e.target.value ? Number.parseFloat(e.target.value) : null)
                  }
                  placeholder="Same as base price"
                />
              ) : (
                <p className="text-lg font-medium">
                  {selectedProductData.dineinCharge !== null && selectedProductData.dineinCharge !== undefined
                    ? `₹${selectedProductData.dineinCharge.toFixed(2)}`
                    : "Same as base price"}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-500">Description</p>
          {isEditing ? (
            <textarea
              className="w-full p-2 border rounded"
              value={localEditedProduct.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          ) : (
            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedProductData.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-500">Receive By</p>
          {isEditing ? (
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="recieveBy"
                  value="DELIVERY"
                  checked={localEditedProduct.recieveBy?.includes("DELIVERY")}
                  onChange={(e) => {
                    const currentValues = localEditedProduct.recieveBy || []
                    const newValues = e.target.checked
                      ? [...currentValues, "DELIVERY"]
                      : currentValues.filter((v) => v !== "DELIVERY")
                    handleInputChange("recieveBy", newValues)
                  }}
                  className="h-4 w-4"
                />
                <span>Delivery</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="recieveBy"
                  value="DINEIN"
                  checked={localEditedProduct.recieveBy?.includes("DINEIN")}
                  onChange={(e) => {
                    const currentValues = localEditedProduct.recieveBy || []
                    const newValues = e.target.checked
                      ? [...currentValues, "DINEIN"]
                      : currentValues.filter((v) => v !== "DINEIN")
                    handleInputChange("recieveBy", newValues)
                  }}
                  className="h-4 w-4"
                />
                <span>Dine In</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="recieveBy"
                  value="TAKEAWAY"
                  checked={localEditedProduct.recieveBy?.includes("TAKEAWAY")}
                  onChange={(e) => {
                    const currentValues = localEditedProduct.recieveBy || []
                    const newValues = e.target.checked
                      ? [...currentValues, "TAKEAWAY"]
                      : currentValues.filter((v) => v !== "TAKEAWAY")
                    handleInputChange("recieveBy", newValues)
                  }}
                  className="h-4 w-4"
                />
                <span>Takeaway</span>
              </label>
            </div>
          ) : (
            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              {selectedProductData.recieveBy?.length > 0 ? selectedProductData.recieveBy.join(", ") : "Not specified"}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">Variants</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setVariantEditMode("add")
                setSelectedVariant(null)
                setIsVariantModalOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>

          {Object.keys(variantTypes).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(variantTypes).map(([relationType, variants]) => (
                <div key={relationType} className="space-y-2">
                  <h5 className="text-md font-medium text-gray-700 capitalize">{relationType}</h5>
                  <div className="grid gap-3">
                    {variants.map((variantItem) => {
                      const variantProduct = variantItem.product
                      return (
                        <Card key={variantProduct.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-1 h-12 rounded-full bg-indigo-500 opacity-75" />
                              <div>
                                <Badge variant="outline" className="mb-2">
                                  {variantProduct.SKU || `VAR-${variantProduct.id}`}
                                </Badge>
                                <h4 className="text-md font-medium text-gray-900">{variantProduct.name}</h4>
                                <Badge variant={variantProduct.stock > 20 ? "success" : "destructive"}>
                                  Stock: {variantProduct.stock || 0}
                                </Badge>
                                {variantItem.description && (
                                  <p className="text-xs text-gray-500 mt-1">{variantItem.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedVariant({
                                    relationId: variantItem.relationId,
                                    oldRelationType: relationType,
                                    relationType: relationType,
                                    description: variantItem.description,
                                    productA: { id: selectedProductData.id },
                                    productB: { id: variantProduct.id },
                                    oldProductId: variantProduct.id,
                                  })
                                  setVariantEditMode("edit")
                                  setIsVariantModalOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this variant relationship? This action cannot be undone.",
                                    )
                                  ) {
                                    startTransition(() => {
                                      handleDeleteVariant(selectedProductData.id, relationType, variantProduct.id)
                                    })
                                  }
                                }}
                                disabled={isPending}
                              >
                                {isPending ? <span className="animate-spin">⏳</span> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No variants added yet</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-3xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-600">
            Product Management
          </h1>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add New
          </Button>
        </div>
        <div className="relative">
          <Input
            type="search"
            placeholder="Search products..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full"
          />
          <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-5 bg-white">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="divide-y">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedProduct === product.id ? "bg-gray-50 border-l-4 border-indigo-500" : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    if (window.matchMedia("(min-width: 768px)").matches) {
                      handleLargeScreenClick(product.id)
                    } else {
                      handleSmallScreenClick(product.id)
                    }
                  }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={(product.images && product.images[0]) || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-sm text-gray-500">₹{product.basePrice?.toFixed(2)}</span>
                        <Badge variant={product.stock > 0 ? "success" : "destructive"}>
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                      {product.variantsByType && Object.keys(product.variantsByType).length > 0 && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {Object.keys(product.variantsByType).length} variant type(s)
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="hidden lg:block lg:col-span-7 bg-white">
          <ScrollArea className="h-[calc(100%-80px)] p-6">
            {selectedProductData ? (
              <ProductDetails />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a product to view details</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="bottom" className="h-[85vh] p-6">
          <SheetHeader className="mb-6">
            <SheetTitle>Product Details</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100%-80px)]">{selectedProductData && <ProductDetails />}</ScrollArea>
        </SheetContent>
      </Sheet>

      <AddProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddProduct} />

      <VariantModal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        products={products}
        selectedProductId={selectedProductData?.id}
        onSubmit={handleVariantSubmit}
        mode={variantEditMode}
        variant={selectedVariant}
        onDelete={handleDeleteVariant}
      />
    </div>
  )
}
