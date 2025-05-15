import Image from "next/image"
import { Metadata } from 'next'
import { Carousel } from "./Carousel"
import { ProductGrid } from "@/components/ProductGrid"
import { SearchInput } from "@/components/search-input"
import { CategoryCarousel } from "@/components/CategoryCarousel"
import { CategoryTags } from "./category-tags"
import { getBusinessPageData } from "@/app/api/business/business"

// Metadata Generation
export async function generateMetadata({ params }): Promise<Metadata> {
  const { pageData } = await getBusinessPageData(params.pageId)

  return {
    title: {
      absolute: `${pageData?.name} - Coryfi`,
    },
    description: pageData?.description || `Explore products and offerings from ${pageData?.name}`,
    openGraph: {
      title: `${pageData?.name} - Business Profile`,
      description: pageData?.description,
      images: [
        {
          url: `https://connect.coryfi.com/api/og/${params.pageId}`, // Use dynamic OG image
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageData?.name} - Business Profile`,
      description: pageData?.description,
      images: [`https://connect.coryfi.com/api/og/${params.pageId}`],
    },
  }
}

// Main Business Profile Component
export default async function BusinessProfile({ searchParams, params }) {
  const { pageData } = await getBusinessPageData(params.pageId)

  // Get the currently selected category from search params
  const selectedCategory = searchParams?.category || null

  // Filter products by category if one is selected
  const filteredProducts = selectedCategory
    ? pageData?.products.filter(product => {
        // Find the category object with the matching name
        const categoryObj = pageData?.categories.find(cat => cat.name === selectedCategory);
        
        // If category is found, filter products by that category's ID
        return categoryObj ? product.categoryId === categoryObj.id : false;
      })
    : pageData?.products;

  // Default image placeholder
  const profileImage = pageData?.dpImageUrl || "/placeholder.svg";

  return (
    <>
      <div className="min-h-screen bg-background">
        <Carousel images={pageData?.bannerImageUrls} />

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Business Profile Header */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
            <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-background bg-slate-100 shadow-lg mx-auto md:mx-0">
              <Image
                src={profileImage}
                alt={pageData?.name || "Business Profile"}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{pageData?.name}</h1>
              <p className="text-muted-foreground mt-2">{pageData?.description}</p>
            </div>
          </div>

          {/* Categories Section */}
          {pageData?.categories && pageData.categories.length > 0 && (
            <div className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Featured Categories</h2>
                  <p className="text-muted-foreground mt-1">Browse our collections</p>
                </div>
              </div>
              {pageData?.categoryCarousel && (
                <CategoryCarousel 
                  categories={pageData.categoryCarousel.categories} 
                  productSectionId="product-section" 
                />
              )}
              <CategoryTags 
                categories={pageData.categories} 
                selectedCategory={selectedCategory} 
              />
            </div>
          )}

          {/* Products Section */}
          {pageData?.products && pageData.products.length > 0 && (
            <div id="product-section" className="mb-16">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedCategory ? `${selectedCategory} Products` : "Our Products"}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {selectedCategory
                      ? `Explore our ${selectedCategory.toLowerCase()} collection`
                      : ''}
                  </p>
                </div>
                <SearchInput />
              </div>
              
              <div className="pointer-cursor">
                <ProductGrid products={filteredProducts} params={params} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}