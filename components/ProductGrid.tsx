"use client"

import { useState } from "react"
// import img from "next/image"
import { ShoppingCart, Heart, Star, Check, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

export function ProductGrid({ products , params }) {
  // const newParams = new URLSearchParams(searchParams.toString());
  // newParams.delete("category");

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
      {products.map((product) => (
        <Link href={`/explore/business/${params.pagename}/${params.pageId}/product/${product.id}`}>
        <ProductCard key={product.id} product={product} pageId={params.pageId} />
        </Link>
      ))}
    </div>
  )
}

function ProductCard({ product ,pageId }) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedColor, setSelectedColor] = useState(0)
  console.log("all products",product)

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
          src={`${product.images[0]}`}
          alt={product.name}
          className="object-cover transition-all duration-700 group-hover:scale-105"
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
          {/* <span className="text-xs text-muted-foreground ml-1">
            ({product.reviewCount || Math.floor(Math.random() * 100) + 5})
          </span> */}
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

        {/* Color options */}
        {/* <div className="flex items-center gap-1 pt-1">
          {colors.map((color, index) => (
            <button
              key={index}
              className={cn(
                "w-5 h-5 rounded-full border transition-all duration-200",
                selectedColor === index ? "ring-2 ring-primary ring-offset-2" : "hover:scale-110",
              )}
              style={{ backgroundColor: color.value }}
              onClick={() => setSelectedColor(index)}
              aria-label={`Select ₹{color.name} color`}
            />
          ))}
        </div> */}
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

