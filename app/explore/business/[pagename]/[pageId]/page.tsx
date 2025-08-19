import Image from "next/image"
import type { Metadata } from "next"
// import ProductsGrid from "@/app/dashboard/[businessId]/[pageid]/products/products-grid"
import { ProductGrid } from "@/components/ProductGrid"
import { SearchInput } from "@/components/search-input"
import { CategoryCarousel } from "@/components/CategoryCarousel"
import { CategoryTags } from "./category-tags"
import { getBusinessPageData } from "@/app/api/business/business"
import { getServerSession } from "next-auth/next"
import { BlurOverlay } from "./blur-overlay"
import { LoginPrompt } from "./login-prompt"
import { Carousel } from "./Carousel"

export const dynamic = "force-dynamic"
export async function generateMetadata({ params }): Promise<Metadata> {
  const pageId = params?.pageId || "sample-page-id"
  const result = await getBusinessPageData(pageId, 1)
  const pageData = result.success ? result.pageData : null

  return {
    title: `${pageData?.name || "Business"} - Coryfi`,
    description: `${pageData?.description || "Business page"}`,
    openGraph: {
      title: `${pageData?.name || "Business"} - Coryfi`,
      description: `${pageData?.description || "Business page"}`,
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
      title: `${pageData?.name || "Business"} - Coryfi`,
      description: `${pageData?.description || "Business page"}`,
      images: [`https://connect.coryfi.com/api/og/${pageId}`],
    },
  }
}

export default async function BusinessProfile({ searchParams, params }) {
  const pageId = params?.pageId || "sample-page-id"
  const currentPage = Number.parseInt(searchParams?.page || "1")
  const selectedCategory = searchParams?.category || undefined

  const result = await getBusinessPageData(pageId, currentPage, selectedCategory)

  if (!result.success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Page not found</p>
      </div>
    )
  }

  const { pageData } = result

  // Check if user is logged in
  const session = await getServerSession()
  const isLoggedIn = !!session

  const profileImage = pageData?.dpImageUrl || "/placeholder.svg?height=176&width=176"

  return (
    <div className="min-h-screen bg-background">
      <Carousel images={pageData?.bannerImageUrls || []} />

      <div className="max-w-7xl mx-auto px-4 py-8">
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
            <h1 className="text-3xl font-bold">{pageData?.name || "Business Name"}</h1>
            <p className="text-muted-foreground mt-2">{pageData?.description || "Business description"}</p>
          </div>
        </div>

        <div className="relative">
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

          {pageData?.products?.length > 0 && (
            <div id="product-section" className="mb-16">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedCategory ? `${selectedCategory} Products` : "Our Products"}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {selectedCategory
                      ? `Explore our ${selectedCategory.toLowerCase()} collection`
                      : "Discover our complete product range"}
                  </p>
                </div>
                <SearchInput />
              </div>

               <ProductGrid
                products={pageData.products || []}
                params={params || { pageId, pagename: "business" }}
                pageInfo={pageData}
                currentPage={pageData.pagination?.currentPage || 1}
                totalPages={pageData.pagination?.totalPages || 1}
              />
            </div>
          )}

          {!isLoggedIn && <LoginPrompt />}
        </div>
      </div>
    </div>
  )
}
