
import { Button } from "@/components/ui/button"
import CategoryNavigation from "./category-navigation"
import BusinessCard from "./business-card"
// import SearchBar from "./search-bar"
import SearchBar from "@/components/ui/sections/SearchBar"
import { getAllPages } from "../api/business/business"

export const dynamic='force-dynamic';
export const revalidate=0;

export default async function MarketplacePage() {

  const data=await getAllPages()
  // console.log("pages",JSON.stringify(data,null,2))

  //  const Alldata=JSON.stringify(data,null,2)
   const allBusinesses=data.pageData
  const categories = [
    { id: "all", name: "All Categories" },
    { id: "food", name: "Food & Restaurants" },
    { id: "fashion", name: "Fashion & Clothing" },
    { id: "tech", name: "Technology" },
    { id: "health", name: "Health & Beauty" },
    { id: "home", name: "Home & Decor" },
    { id: "services", name: "Services" },
  ]



  const businessesByCategory = categories
    .filter((category) => category.id !== "all")
    .map((category) => ({
      ...category,
      businesses: allBusinesses.filter((business) => business.category === category.id),
    }))

  return (
    <div className="flex min-h-screen flex-col bg-background w-full">
    {/* Header */}
    <div className="container mx-auto py-4 px-4 flex items-center justify-between border-b">
      <div className="w-1/4"></div>
      <div className="w-1/2 flex justify-center">
        <SearchBar />
      </div>
      <div className="w-1/4 flex justify-end">
        <Button className="bg-primary hover:bg-primary/90 text-white font-medium">
          <a href="/add-business">Add Business</a>
        </Button>
      </div>
    </div>
  
    <main className="flex-1 container mx-auto">
      {/* Category Navigation */}
      <CategoryNavigation categories={categories} />
  
      {/* All Businesses */}
      <section className="py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">All Businesses</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {allBusinesses.length} businesses
            </span>
          </div>
        </div>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {allBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              categoryName={
                categories.find((c) => c.id === business.category)?.name || ""
              }
            />
          ))}
        </div>
      </section>
  
      {/* Category Sections */}
      {businessesByCategory.map((category) => {
        if (category.businesses.length === 0) return null;
  
        return (
          <section key={category.id} id={category.id} className="py-8 border-t">
            <div className="container mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{category.name}</h2>
                <Button variant="ghost" size="sm" asChild>
                  <a href={`#${category.id}`}>View All</a>
                </Button>
              </div>
  
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.businesses.slice(0, 4).map((business) => (
                  <BusinessCard key={business.id} business={business} categoryName={category.name} />
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </main>
  </div>
  )
}

