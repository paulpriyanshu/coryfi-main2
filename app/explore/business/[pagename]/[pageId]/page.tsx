import Image from "next/image"
import { Metadata } from 'next'
import { Carousel } from "./Carousel"
import { ProductGrid } from "@/components/ProductGrid"
import { SearchInput } from "@/components/search-input"
import { CategoryCarousel } from "@/components/CategoryCarousel"
import { CategoryTags } from "./category-tags"
import { getBusinessPageData } from "@/app/api/business/business"
// import { Organization, Product, WebPage } from 'schema-dts'

// Structured Data Generation Function
// function generateStructuredData(pageData) {
//   const structuredData: WebPage & { 
//     about?: Organization, 
//     mainEntity?: Product[] 
//   } = {
//     '@context': 'https://schema.org',
//     '@type': 'WebPage',
//     name: `${pageData.name} - Business Profile`,
//     description: pageData.description || `Explore products and offerings from ${pageData.name}`,
//   }

//   // Organization Details
//   structuredData.about = {
//     '@type': 'Organization',
//     name: pageData.name,
//     description: pageData.description,
//     logo: pageData.dpImageUrl,
//     url: typeof window !== 'undefined' ? window.location.href : ''
//   }

//   // Products as Structured Data
//   if (pageData.products && pageData.products.length > 0) {
//     structuredData.mainEntity = pageData.products.map(product => ({
//       '@type': 'Product',
//       name: product.name,
//       description: product.description,
//       image: product.imageUrl,
//       offers: {
//         '@type': 'Offer',
//         price: product.price,
//         priceCurrency: 'USD',
//         availability: 'https://schema.org/InStock'
//       }
//     }))
//   }

//   return JSON.stringify(structuredData)
// }

// Metadata Generation
export async function generateMetadata({ params }): Promise<Metadata> {
  const { pageData } = await getBusinessPageData(params.pageId)
  
  return {
    title: {
      absolute:`${pageData.name} - Coryfi`
    },
    description: pageData.description || `Explore products and offerings from ${pageData.name}`,
    keywords: pageData.categories?.map(cat => cat.name).join(', '),
    openGraph: {
      title: `${pageData.name} - Business Profile`,
      description: pageData.description || `Explore products and offerings from ${pageData.name}`,
      images: [
        {
          url: pageData.dpImageUrl || '/default-business-image.jpg',
          width: 800,
          height: 600,
        }
      ],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageData.name} - Business Profile`,
      description: pageData.description || `Explore products and offerings from ${pageData.name}`,
      images: [pageData.dpImageUrl || '/default-business-image.jpg']
    },
    alternates: {
      canonical: `/business/${params.pageId}`
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  }
}

// Main Business Profile Component
export default async function BusinessProfile({ searchParams, params }) {
  const { pageData } = await getBusinessPageData(params.pageId)

  // Get the currently selected category from search params
  const selectedCategory = searchParams?.category || null

  // Filter products by category if one is selected
  const filteredProducts = selectedCategory
    ? pageData.products.filter(product => {
        // Find the category object with the matching name
        const categoryObj = pageData.categories.find(cat => cat.name === selectedCategory);
        
        // If category is found, filter products by that category's ID
        return categoryObj ? product.categoryId === categoryObj.id : false;
      })
    : pageData.products;

  return (
    <>
      {/* Structured Data Script */}
      {/* <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ 
          __html: generateStructuredData(pageData) 
        }} 
      /> */}

      <div className="min-h-screen bg-background">
        <Carousel images={pageData.bannerImageUrls} />

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Business Profile Header */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
            <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-background bg-slate-100 shadow-lg mx-auto md:mx-0">
              <Image
                src={`${pageData.dpImageUrl}` || "/placeholder.svg"}
                alt={pageData.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{pageData.name}</h1>
              <p className="text-muted-foreground mt-2">{pageData.description}</p>
            </div>
          </div>

          {/* Categories Section */}
          {pageData.categories.length > 0 && (
            <div className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Featured Categories</h2>
                  <p className="text-muted-foreground mt-1">Browse our collections</p>
                </div>
              </div>
              <CategoryCarousel 
                categories={pageData.categoryCarousel.categories} 
                productSectionId="product-section" 
              />
              <CategoryTags 
                categories={pageData.categories} 
                selectedCategory={selectedCategory} 
              />
            </div>
          )}

          {/* Products Section */}
          {pageData.products.length > 0 && (
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