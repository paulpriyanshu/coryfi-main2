'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function CategoryNavigation({ categories, selectedCategory, productSectionId }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const handleCategorySelect = (category) => {
    // Create new URLSearchParams object based on current params
    const params = new URLSearchParams(searchParams.toString())
    
    // Set the category parameter
    params.set('category', category)
    
    // Update the URL with the new search parameters
    router.push(`?${params.toString()}`)
    
    // Scroll to product section smoothly
    setTimeout(() => {
      const productSection = document.getElementById(productSectionId)
      if (productSection) {
        productSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 200)
  }

  // Optional: If needed, handle initial scroll when URL contains a category param
  useEffect(() => {
    if (selectedCategory) {
      const productSection = document.getElementById(productSectionId)
      if (productSection) {
        productSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [])

  return (
    <div className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto pb-4">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategorySelect(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === category
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}