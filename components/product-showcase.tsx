import { ProductGrid } from "./ProductGrid"
import { CategoryCarousel } from "./CategoryCarousel"

export default function ProductShowcase() {
  // Sample data with enhanced product information
  const products = [
    {
      id: 1,
      name: "Modern Desk Lamp",
      price: 49.99,
      originalPrice: 69.99,
      rating: 4,
      reviewCount: 42,
      badge: "Sale",
      colors: [
        { name: "Black", value: "#000000" },
        { name: "White", value: "#ffffff" },
        { name: "Gold", value: "#FFD700" },
      ],
    },
    {
      id: 2,
      name: "Ergonomic Office Chair",
      price: 199.99,
      rating: 5,
      reviewCount: 128,
      colors: [
        { name: "Black", value: "#000000" },
        { name: "Gray", value: "#808080" },
        { name: "Blue", value: "#0000FF" },
      ],
    },
    {
      id: 3,
      name: "Wireless Headphones",
      price: 89.99,
      originalPrice: 119.99,
      rating: 4,
      reviewCount: 76,
      badge: "Sale",
      colors: [
        { name: "Black", value: "#000000" },
        { name: "White", value: "#ffffff" },
        { name: "Red", value: "#FF0000" },
      ],
    },
    {
      id: 4,
      name: "Smart Watch Series 7",
      price: 299.99,
      rating: 5,
      reviewCount: 214,
      badge: "New",
      colors: [
        { name: "Silver", value: "#C0C0C0" },
        { name: "Black", value: "#000000" },
        { name: "Rose Gold", value: "#B76E79" },
      ],
    },
    {
      id: 5,
      name: "Portable Bluetooth Speaker",
      price: 59.99,
      rating: 4,
      reviewCount: 89,
      colors: [
        { name: "Black", value: "#000000" },
        { name: "Blue", value: "#0000FF" },
        { name: "Red", value: "#FF0000" },
      ],
    },
    {
      id: 6,
      name: "Minimalist Wall Clock",
      price: 39.99,
      rating: 4,
      reviewCount: 56,
      colors: [
        { name: "White", value: "#ffffff" },
        { name: "Black", value: "#000000" },
        { name: "Natural Wood", value: "#DEB887" },
      ],
    },
    {
      id: 7,
      name: "Ceramic Coffee Mug Set",
      price: 24.99,
      originalPrice: 34.99,
      rating: 4,
      reviewCount: 42,
      badge: "Sale",
      colors: [
        { name: "White", value: "#ffffff" },
        { name: "Black", value: "#000000" },
        { name: "Navy", value: "#000080" },
      ],
    },
    {
      id: 8,
      name: "Leather Wallet",
      price: 34.99,
      rating: 5,
      reviewCount: 67,
      colors: [
        { name: "Brown", value: "#8B4513" },
        { name: "Black", value: "#000000" },
        { name: "Tan", value: "#D2B48C" },
      ],
    },
  ]

  const categories = ["Electronics", "Home Decor", "Kitchen", "Fashion", "Outdoor", "Accessories"]

  return (
    <div className="space-y-16 py-8">
      <section>
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Featured Categories</h2>
              <p className="text-muted-foreground mt-1">Explore our collections</p>
            </div>
            <Button variant="link" className="gap-1">
              View all categories
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <CategoryCarousel categories={categories} />
        </div>
      </section>

      <section>
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Popular Products</h2>
              <p className="text-muted-foreground mt-1">Top picks for you</p>
            </div>
            <Button variant="link" className="gap-1">
              View all products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>
    </div>
  )
}

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

