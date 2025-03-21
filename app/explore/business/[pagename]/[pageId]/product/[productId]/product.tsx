"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Heart, Minus, Plus, Share2, ShoppingCart, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname, useRouter } from "next/navigation"
import React from "react"

function Product({ product ,productId}) {
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [selectedFields, setSelectedFields] = useState({})
  const router = useRouter()
  const pathname=usePathname()
  const handleProductClick = (newProductId: string) => {
    const newURL = pathname.replace(/[^/]+$/, newProductId); // Replace last segment
    router.replace(newURL); // Update URL without reloading
  };


  // Default values for rating and reviews since they're not in the data structure
  const rating = 4.5
  const reviewCount = 12

  // Group variants by relationType
  const variantsByType = React.useMemo(() => {
    if (!product?.variants || !Array.isArray(product.variants)) return {}

    return product.variants.reduce((acc, variant) => {
      const type = variant.relationType || "other"
      if (!acc[type]) acc[type] = []
      acc[type].push(variant)
      return acc
    }, {})
  }, [product?.variants])

  const incrementQuantity = () => {
    setQuantity(quantity + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const nextImage = () => {
    if (!product?.images?.length) return
    setCurrentImage((currentImage + 1) % product.images.length)
  }

  const prevImage = () => {
    if (!product?.images?.length) return
    setCurrentImage((currentImage - 1 + product.images.length) % product.images.length)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>{" "}
        /
        <Link href="/products" className="mx-2 hover:text-primary">
          Products
        </Link>{" "}
        /<span className="font-medium text-foreground">{product?.name}</span>
      </div>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
        {/* Product Images */}
        <div className="relative lg:col-span-3">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={product?.images?.[currentImage] || "/placeholder.svg"}
              alt={product?.name || "Product image"}
              fill
              className="object-cover transition-all"
            />
            {product?.images?.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                  <span className="sr-only">Previous image</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                  <span className="sr-only">Next image</span>
                </Button>
              </>
            )}
          </div>
          {product?.images?.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`aspect-square cursor-pointer overflow-hidden rounded-md ${
                    index === currentImage ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setCurrentImage(index)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product?.name || "Product"} thumbnail ${index + 1}`}
                    width={100}
                    height={100}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold sm:text-3xl">{product?.name}</h1>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
          </div>

          <div className="mt-4">
            <span className="text-2xl font-bold">₹{product?.basePrice?.toFixed(2) || "0.00"}</span>
            <span className="ml-2 text-sm text-muted-foreground">Tax included</span>
          </div>

          <Separator className="my-6" />

          <div className="space-y-6">
            {product?.description && (
              <div>
                <h3 className="mb-2 font-medium">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {product?.category && (
              <div>
                <h3 className="mb-2 font-medium">Category</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="h-auto px-4 py-2">
                    {product.category.name}
                  </Button>
                </div>
              </div>
            )}

            {/* Variants grouped by relationType */}
            {Object.entries(variantsByType).map(([relationType, variants]) => (
              <div key={relationType}>
                <h3 className="mb-2 font-medium capitalize">{relationType}</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedVariant(index)}
                      className={`cursor-pointer rounded-md border p-2 transition-all hover:border-primary ${
                        index === selectedVariant ? "border-primary ring-1 ring-primary" : "border-muted"
                      } ${variant.product.stock <= 0 ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-center gap-2" onClick={() => handleProductClick(variant.product.id)}>
                        <div className="relative h-16 w-16 overflow-hidden rounded-md">
                          <Image
                            src={variant.product.images?.[0] || "/placeholder.svg"}
                            alt={variant.product.name || "Product variant"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{variant.product.name}</p>
                          <p className="text-xs text-muted-foreground">{variant.description}</p>
                          {variant.product.stock <= 0 && (
                            <p className="text-xs font-medium text-destructive">Out of stock</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Product Fields Selection */}
            {product?.fields && product.fields.length > 0 && (
              <div>
                {product.fields.map(
                  (field) =>
                    field.value &&
                    field.value.length > 0 && (
                      <div key={field.id} className="mb-4">
                        <h3 className="mb-2 font-medium capitalize">{field.key}</h3>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {field.value.map((value, index) => (
                            <div
                              key={index}
                              onClick={() =>
                                setSelectedFields({
                                  ...selectedFields,
                                  [field.key]: value,
                                })
                              }
                              className={`cursor-pointer rounded-md border p-2 text-center transition-all hover:border-primary ${
                                selectedFields[field.key] === value
                                  ? "border-primary ring-1 ring-primary"
                                  : "border-muted"
                              }`}
                            >
                              <p className="text-sm">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                )}
              </div>
            )}

            <div>
              <h3 className="mb-2 font-medium">Quantity</h3>
              <div className="flex items-center">
                <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={incrementQuantity}>
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase quantity</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                className="flex-1 gap-2"
                disabled={product?.stock <= 0}
                onClick={() => {
                  // Here you would typically dispatch to a cart context or store
                  console.log("Adding to cart:", {
                    product,
                    quantity,
                    selectedVariant: product?.variants?.[selectedVariant],
                    selectedFields,
                  })
                }}
              >
                <ShoppingCart className="h-5 w-5" />
                {product?.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Add to wishlist</span>
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share product</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="features">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="features" className="mt-6">
            {product?.features ? (
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground whitespace-pre-line">
                {product?.description || "No features available."}
              </p>
            )}
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {product?.specs &&
                Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b pb-2">
                    <span className="font-medium">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              {!product?.specs && (
                <div className="col-span-full">
                  <p className="text-muted-foreground">Product Specifications:</p>
                  {product?.SKU && (
                    <div className="mt-4 flex justify-between border-b pb-2">
                      <span className="font-medium">SKU</span>
                      <span className="text-muted-foreground">{product.SKU}</span>
                    </div>
                  )}
                  {product?.category && (
                    <div className="mt-2 flex justify-between border-b pb-2">
                      <span className="font-medium">Category</span>
                      <span className="text-muted-foreground">{product.category.name}</span>
                    </div>
                  )}
                  {product?.stock !== undefined && (
                    <div className="mt-2 flex justify-between border-b pb-2">
                      <span className="font-medium">Stock</span>
                      <span className="text-muted-foreground">{product.stock} available</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {selectedFields && Object.keys(selectedFields).length > 0 && (
              <>
                <h3 className="mt-4 mb-2 font-medium">Selected Options</h3>
                {Object.entries(selectedFields).map(([key, value]) => (
                  <div key={key} className="mt-2 flex justify-between border-b pb-2">
                    <span className="font-medium capitalize">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </>
            )}
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">{rating}</div>
                <div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(rating) ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Based on {reviewCount} reviews</p>
                </div>
              </div>
              <Button>Write a Review</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {product?.variants && product.variants.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">You May Also Like</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {product.variants.map((variant, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={variant.product.images?.[0] || "/placeholder.svg"}
                    alt={variant.product.name || "Related product"}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium">{variant.product.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{variant.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold">₹{variant.product.basePrice?.toFixed(2) || "0.00"}</span>
                    <Button variant="ghost" size="sm">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="sr-only">Add to cart</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Product

