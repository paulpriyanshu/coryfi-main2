import Image from "next/image"
import { Carousel } from "@/components/Carousel"
import { CategoryCarousel } from "@/components/CategoryCarousel"
import { ProductGrid } from "@/components/ProductGrid"
import { SearchInput } from "@/components/SearchInput"

async function getBusinessData() {
  return {
    name: "Business Name",
    description: "Professional business description and tagline",
    featuredProducts: [1, 2, 3, 4, 5],
    categories: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    products: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Product ${i + 1}`,
      price: 99.99,
    })),
  }
}

export default async function BusinessProfile() {
  const { name, description, featuredProducts, categories, products } = await getBusinessData()

  return (
    <div className="min-h-screen bg-background">
      <Carousel images={featuredProducts} height={300} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-background bg-slate-100 shadow-lg">
            <Image
              src="/placeholder.svg?height=96&width=96"
              alt="Business Profile"
              fill
              className="object-cover"
              priority
            /> 
          </div>
          <div>
            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Featured Categories</h2>
          <CategoryCarousel categories={categories} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">All Products</h2>
            <SearchInput />
          </div>

          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  )
}

