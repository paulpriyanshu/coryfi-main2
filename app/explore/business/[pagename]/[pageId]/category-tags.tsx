"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface Category {
  id: number
  name: string
}

interface CategoryTagsProps {
  categories: Category[]
  selectedCategory?: string
}

export function CategoryTags({ categories, selectedCategory }: CategoryTagsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAll, setShowAll] = useState(false)

  const handleCategoryClick = (categoryName?: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (!categoryName || selectedCategory === categoryName) {
      params.delete("category") // Reset filter
    } else {
      params.set("category", categoryName)
    }

    params.delete("page")

    router.push(`?${params.toString()}#product-section`)
  }

  const visibleCategories = showAll ? categories : categories.slice(0, 10)

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {/* All Products button */}
        <button
          onClick={() => handleCategoryClick(undefined)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border hover:bg-muted/80",
            !selectedCategory
              ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
              : "bg-background text-foreground border-border",
          )}
        >
          All Products
        </button>

        {visibleCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.name)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border hover:bg-muted/80",
              selectedCategory === category.name
                ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                : "bg-background text-foreground border-border",
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {categories.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 px-4 py-1.5 rounded-full text-sm font-medium border bg-background text-foreground hover:bg-muted/80 transition"
        >
          {showAll ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  )
}
