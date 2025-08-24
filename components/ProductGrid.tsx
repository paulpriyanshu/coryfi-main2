"use client"

import { Star, AlertCircle, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Input } from "./ui/Input"
import { useState, useMemo } from "react"

export function ProductGrid({ products, params, pageInfo }) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products.filter((product) => !product.hideProduct)
    }

    return products
      .filter((product) => !product.hideProduct)
      .filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [products, searchQuery])

  const clearSearch = () => {
    setSearchQuery("")
  }

  console.log("page info", pageInfo.PageAlertsBeforeCart)

  return (
    <>
      <div className="mb-8 p-6 pb-0">
        <div className="relative max-w-2xl mx-auto">
          {/* Gradient border wrapper */}
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 shadow-lg">
            <div className="relative bg-background/80 backdrop-blur-xl rounded-2xl">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-primary/70 h-5 w-5 transition-colors duration-200" />
              <Input
                type="text"
                placeholder="Search for amazing products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-14 py-5 w-full bg-transparent border-0 rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/30 focus:ring-offset-0 transition-all duration-300 text-base font-medium shadow-none"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl blur-xl opacity-60" />
        </div>

        {searchQuery && (
          <div className="text-center mt-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-foreground">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
                {searchQuery && <span className="text-primary font-semibold ml-1">for "{searchQuery}"</span>}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 p-6">
        {/* Default alert */}
        {(() => {
          let pageAlerts: any = null

          try {
            if (pageInfo?.PageAlertsBeforeCart) {
              pageAlerts =
                typeof pageInfo.PageAlertsBeforeCart === "string"
                  ? JSON.parse(pageInfo.PageAlertsBeforeCart)
                  : pageInfo.PageAlertsBeforeCart
            }
          } catch (e) {
            console.error("❌ Invalid JSON in PageAlertsBeforeCart", e)
          }

          console.log("✅ Parsed PageAlertsBeforeCart:", pageAlerts)

          if (!pageAlerts) return null

          return (
            <>
              {/* Alerts */}
              {Array.isArray(pageAlerts.alerts) &&
                pageAlerts.alerts
                  .filter((a: any) => a.active)
                  .map((alert: any, idx: number) => (
                    <Alert
                      key={idx}
                      className={`mb-2 ${
                        alert.priority === "high"
                          ? "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200"
                          : "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
                      }`}
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{alert.title}</AlertTitle>
                      <AlertDescription>{alert.message}</AlertDescription>
                    </Alert>
                  ))}

              {/* Timings */}
              {pageAlerts.timings && (
                <Alert className="mt-2 border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Opening & Closing Hours</AlertTitle>
                  <AlertDescription>
                    {pageAlerts.timings.open} – {pageAlerts.timings.close}
                    {pageAlerts.timings.special && (
                      <div className="mt-2 text-xs text-muted-foreground dark:text-gray-400">
                        <p>Friday: {pageAlerts.timings.special.friday}</p>
                        <p>Sunday: {pageAlerts.timings.special.sunday}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )
        })()}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Link key={product.id} href={`/explore/business/${params.pagename}/${params.pageId}/product/${product.id}`}>
              <ProductCard product={product} pageId={params.pageId} />
            </Link>
          ))
        ) : searchQuery ? (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No products found</p>
              <p className="text-sm">Try searching with different keywords</p>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}

function ProductCard({ product, pageId }) {
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

      {/* Product image */}
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={product.images[0] || "/placeholder.svg"} // No need for template literal if it's already a string
          alt={product.name}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-105"
        />
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
      </div>
    </div>
  )
}
