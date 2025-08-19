"use client"

import { useState } from "react"
import { ShoppingCart, Star, Check, Plus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Pagination } from "./pagination"

interface ProductGridProps {
  products: any[]
  params: any
  pageInfo: any
  totalPages: number
}

export function ProductGrid({ products, params, pageInfo, totalPages }: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      <div className="space-y-4 p-6">
        {/* Default alert */}
        {pageInfo?.PageAlertsBeforeCart && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>{pageInfo?.PageAlertsBeforeCart}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {products.map((product) => (
          <Link key={product.id} href={`/explore/business/${params.pagename}/${params.pageId}/product/${product.id}`}>
            <ProductCard product={product} pageId={params.pageId} />
          </Link>
        ))}
      </div>

      <div className="mt-8 mb-6">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </>
  )
}

function ProductCard({ product, pageId }) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedColor, setSelectedColor] = useState(0)

  // Sample colors for demonstration
  const colors = product.colors || [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#ffffff" },
    { name: "Blue", value: "#3b82f6" },
  ]

  const handleAddToCart = () => {
    setIsAddingToCart(true)
    // Simulate API call
    setTimeout(() => {
      setIsAddingToCart(false)
    }, 1000)
  }

  const toggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  return (
    <div className="group relative rounded-xl overflow-hidden bg-background transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Product badge */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          <span
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              product.badge === "New"
                ? "bg-blue-500 text-white"
                : product.badge === "Sale"
                  ? "bg-red-500 text-white"
                  : "bg-amber-500 text-white",
            )}
          >
            {product.badge}
          </span>
        </div>
      )}

      {/* Wishlist button */}
      <button
        onClick={toggleWishlist}
        className={cn(
          "absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all duration-300",
          isWishlisted
            ? "bg-red-50 text-red-500"
            : "bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground",
        )}
      >
        {/* <Heart className={cn("h-4 w-4 transition-all", isWishlisted && "fill-red-500 scale-110")} /> */}
      </button>

      {/* Product image */}
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-105"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />

        {/* Overlay with quick actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
          <Button
            variant="secondary"
            size="sm"
            className="w-full mb-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <Check className="mr-1 h-4 w-4 animate-pulse" />
            ) : (
              <ShoppingCart className="mr-1 h-4 w-4" />
            )}
            {isAddingToCart ? "Added" : "Add to Cart"}
          </Button>
        </div>
      </div>

      {/* Product info */}
      <div className="p-4 space-y-2">
        {/* Rating */}
        <div className="flex items-center">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-3.5 w-3.5",
                  star <= (product.rating || 4) ? "text-amber-400 fill-amber-400" : "text-muted stroke-muted",
                )}
              />
            ))}
          </div>
        </div>

        {/* Product name */}
        <h3 className="font-medium text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <p className="font-semibold text-primary">₹{product?.basePrice?.toFixed(2)}</p>
          {product.BeforeDiscountPrice && (
            <p className="text-sm text-muted-foreground line-through">₹{product.BeforeDiscountPrice.toFixed(2)}</p>
          )}
        </div>
      </div>

      {/* Quick add button (mobile friendly) */}
      <button
        className="absolute bottom-3 right-3 md:hidden bg-primary text-primary-foreground p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleAddToCart}
        disabled={isAddingToCart}
      >
        {isAddingToCart ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    </div>
  )
}
