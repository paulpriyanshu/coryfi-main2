import Image from "next/image"
import type { Metadata } from "next"
import { ProductGrid } from "@/components/ProductGrid"
import { SearchInput } from "@/components/search-input"
import { CategoryCarousel } from "@/components/CategoryCarousel"
import { CategoryTags } from "./category-tags"
import { getBusinessPageData } from "@/app/api/business/business"
import { getServerSession } from "next-auth/next"
import { BlurOverlay } from "./blur-overlay"
import { LoginPrompt } from "./login-prompt"
import { Carousel } from "./Carousel"

// Metadata Generation
export const dynamic = "force-dynamic"
export async function generateMetadata({ params }): Promise<Metadata> {
  const { pageId } = params
  const { pageData } = await getBusinessPageData(pageId)
  console.log("page data",pageData)

  return {
    title: `${pageData.name} - Coryfi`,
    description: `${pageData.description}`,
    openGraph: {
      title: `${pageData.name} - Coryfi`,
      description: `${pageData.description}`,
      images: [
        {
          url: `https://connect.coryfi.com/api/og/${pageId}`,
          width: 1200,
          height: 630,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageData.name} - Coryfi`,
      description: `${pageData.description}`,
      images: [`https://connect.coryfi.com/api/og/${pageId}`],
    },
  }
}

// Main Business Profile Component
export default async function BusinessProfile({ searchParams, params }) {
  const { pageData } = await getBusinessPageData(params.pageId)
  const selectedCategory = searchParams?.category || null
  console.log("page info",pageData.PageAlertsBeforeCart)
  // Check if user is logged in
  const session = await getServerSession()
  const isLoggedIn = !!session

  const filteredProducts = selectedCategory
    ? pageData?.products.filter((product) => {
        const categoryObj = pageData?.categories.find((cat) => cat.name === selectedCategory)
        return categoryObj ? product.categoryId === categoryObj.id : false
      })
    : pageData?.products

  const profileImage = pageData?.dpImageUrl || "/placeholder.svg"
  const sampleMedia = [
  {
    id: 1,
    src: "/Video-217.mp4",
    alt: "Fashion Collection",
    type: "image" as const,
    title: "New Collection",
    subtitle: "Discover our latest fashion trends and styles"
  },
]

  return (
    <div className="min-h-screen bg-background">
      {/* Non-blurred sections: Carousel and Business Logo */}
      <Carousel  images={pageData?.bannerImageUrls} />
      {/* <MobileCarousel media={sampleMedia}/> */}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Business logo and name section - NOT blurred */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
          <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-background bg-slate-100 shadow-lg mx-auto md:mx-0">
            <Image
              src={profileImage || "/placeholder.svg"}
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

        {/* Content below business logo - will be blurred for non-logged in users */}
        <div className="relative">
          {/* Blur overlay for non-logged in users */}
          {!isLoggedIn && <BlurOverlay />}

          {pageData?.categories?.length > 0 && (
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
              <CategoryTags categories={pageData.categories} selectedCategory={selectedCategory} />
            </div>
          )}
          {!isLoggedIn && <LoginPrompt />}
          {isLoggedIn && (filteredProducts?.length > 0 && (
            <div id="product-section" className="mb-16">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedCategory ? `${selectedCategory} Products` : "Our Products"}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {selectedCategory ? `Explore our ${selectedCategory.toLowerCase()} collection` : ""}
                  </p>
                </div>
                <SearchInput />
              </div>

              <ProductGrid products={filteredProducts} params={params} pageInfo={pageData} />
            </div>
          ))}

          {/* Login prompt for non-logged in users */}
          
        </div>
      </div>
    </div>
  )
}
