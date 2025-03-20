import Image from "next/image"
import { Carousel } from "./Carousel"
import { ProductGrid } from "@/components/ProductGrid"
import { SearchInput } from "@/components/search-input"
import { CategoryCarousel } from "@/components/CategoryCarousel"
import { CategoryTags } from "./category-tags"
import { getBusinessPageData } from "@/app/api/business/business"
export default async function BusinessProfile({ searchParams,params }) {
  const {pageData}= await getBusinessPageData(params.pageId)
  console.log("hey",pageData)
  console.log("search params",params)



  // Get the currently selected category from search params
  const selectedCategory = searchParams?.category || null
  console.log("selectedCategory", selectedCategory)

  // Create carousel images from featured products


  // Filter products by category if one is selected
// Filter products by category if one is selected
const filteredProducts = selectedCategory
  ? pageData.products.filter(product => {
      // Find the category object with the matching name
      const categoryObj = pageData.categories.find(cat => cat.name === selectedCategory);
      
      // If category is found, filter products by that category's ID
      return categoryObj ? product.categoryId === categoryObj.id : false;
    })
  : pageData.products;

  // // Extract category names for the tags
  // const categoryNames = categories.map((c) => c.name)

  return (
    <div className="min-h-screen bg-background">
      <Carousel images={pageData.bannerImageUrls} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
          <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-background bg-slate-100 shadow-lg mx-auto md:mx-0">
            <Image
              src={`${pageData.dpImageUrl}`}
              alt={pageData.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{pageData.name}</h1>
            <p className="text-muted-foreground mt-2">{pageData.description}</p>
            {/* <div className="flex gap-3 mt-4 justify-center md:justify-start">
              <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                Verified
              </span>
              <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                Since 2018
              </span>
              <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                4.9 ★ (2.4k reviews)
              </span>
            </div> */}
          </div>
        </div>
        {pageData.categories.length > 0 ?
            (
              <div className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Featured Categories</h2>
                  <p className="text-muted-foreground mt-1">Browse our collections</p>
                </div>
              </div>
              <CategoryCarousel categories={pageData.categoryCarousel.categories} productSectionId="product-section" />
    
              <CategoryTags categories={pageData.categories} selectedCategory={selectedCategory} />
            </div>
            ):null

        }

    

      {
        pageData.products.length>0 ? 
        (
          <div id="product-section" className="mb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {selectedCategory ? `${selectedCategory} Products` : "Our Products"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {selectedCategory
                  ? `Explore our ${selectedCategory.toLowerCase()} collection`
                  : "Quality craftsmanship for your home"}
              </p>
            </div>
            <SearchInput />
          </div>
          
          <div className="pointer-cursor">

            <ProductGrid products={filteredProducts} params={params} />

          
          </div>

          
        </div>
        ) :null
      }
      </div>
    </div>
  )
}

