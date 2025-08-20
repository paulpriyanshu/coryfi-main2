"use client"

import { useEffect, useState } from "react"
import ProductsList from "./products-list"

export default function ProductsGrid({ pageId, businessId }) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await fetch(
          `/api/business?businessPageId=${pageId}`, 
          { cache: "no-store" } // ensures latest only on first load
        )
        if (!res.ok) throw new Error("Failed to fetch products")
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [pageId])

  if (loading) return <p>Loading products...</p>

  return (
    <ProductsList 
      initialProducts={products} 
      pageId={pageId} 
      businessId={businessId} 
    />
  )
}