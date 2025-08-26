import Image from "next/image"
import type { Metadata } from "next"
import { ProductGrid } from "@/components/ProductGrid"
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
  console.log("page data", pageData.PageAlertsBeforeCart)

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
  // console.log("page info",pageData)
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
  const offers = pageData.offers
  console.log("offers", offers)
  const sampleMedia = [
    {
      id: 1,
      src: "/Video-217.mp4",
      alt: "Fashion Collection",
      type: "image" as const,
      title: "New Collection",
      subtitle: "Discover our latest fashion trends and styles",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Non-blurred sections: Carousel and Business Logo */}
      <Carousel images={pageData?.bannerImageUrls} />
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

       {offers && offers.length > 0 && (
  <div className="mb-16 -mx-4 md:-mx-8 lg:-mx-16">
    <div className="relative overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-purple-100/20"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="relative px-4 md:px-8 lg:px-16 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl mb-6 shadow-lg shadow-orange-500/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
              Special Offers
            </h2>
          </div>

          {/* Offers grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {offers
              .filter((offer) => offer.isActive)
              .map((offer, index) => {
                const isExpiringSoon =
                  new Date(offer.endDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

                return (
                  <div
                    key={offer.id}
                    className="group relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-900/5 hover:shadow-2xl hover:shadow-gray-900/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Card background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Decorative corner gradient */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-200/40 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-6">
                        <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg shadow-orange-500/25">
                          {offer.discountType === "PERCENTAGE"
                            ? `${offer.discountValue}% OFF`
                            : `₹${offer.discountValue} OFF`}
                        </div>

                        {/* {isExpiringSoon && (
                          <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-red-500/25 animate-pulse">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Ending Soon
                          </div>
                        )} */}
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                          {offer.title}
                        </h3>
                        <p className="text-gray-600 text-base leading-relaxed">
                          {offer.description}
                        </p>

                        {offer.minOrderAmount > 1 && (
                          <div className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Min. order ₹{offer.minOrderAmount}
                          </div>
                        )}

                        {/* CTA Button */}
                        {/* <button className="w-full relative bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white px-6 py-4 rounded-2xl font-bold text-base shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-[1.02] group/button overflow-hidden">
                          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000"></span>
                          <span className="relative flex items-center justify-center gap-2">
                            Claim Offer
                            <svg className="w-5 h-5 transform group-hover/button:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </span>
                        </button> */}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

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
          {isLoggedIn && filteredProducts?.length > 0 && (
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
              </div>

              <ProductGrid products={filteredProducts} params={params} pageInfo={pageData} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
