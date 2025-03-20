import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import CategoryNavigation from "./category-navigation"
import BusinessCard from "./business-card"
// import SearchBar from "./search-bar"
import SearchBar from "@/components/ui/sections/SearchBar"
import { getAllPages } from "../api/business/business"
import { json } from "d3"

export default async function MarketplacePage() {

  const data=await getAllPages()
  console.log("pages",JSON.stringify(data,null,2))

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

  // const featuredBusinesses = [
  //   {
  //     id: 1,
  //     name: "Organic Harvest Market",
  //     category: "food",
  //     rating: 4.8,
  //     reviews: 124,
  //     image: "/placeholder.svg?height=300&width=400&text=Organic+Market",
  //     location: "Downtown",
  //     featured: true,
  //   },
  //   {
  //     id: 2,
  //     name: "Urban Style Boutique",
  //     category: "fashion",
  //     rating: 4.6,
  //     reviews: 89,
  //     image: "/placeholder.svg?height=300&width=400&text=Fashion+Boutique",
  //     location: "Fashion District",
  //     featured: true,
  //   },
  //   {
  //     id: 3,
  //     name: "TechHub Innovations",
  //     category: "tech",
  //     rating: 4.9,
  //     reviews: 156,
  //     image: "/placeholder.svg?height=300&width=400&text=Tech+Hub",
  //     location: "Innovation Park",
  //     featured: true,
  //   },
  // ]

  // const allBusinesses = [
  //   ...featuredBusinesses,
  //   {
  //     id: 4,
  //     name: "Fresh Bites Cafe",
  //     category: "food",
  //     rating: 4.5,
  //     reviews: 78,
  //     image: "/placeholder.svg?height=300&width=400&text=Fresh+Bites",
  //     location: "Riverside",
  //   },
  //   {
  //     id: 5,
  //     name: "Gourmet Delights",
  //     category: "food",
  //     rating: 4.7,
  //     reviews: 112,
  //     image: "/placeholder.svg?height=300&width=400&text=Gourmet+Delights",
  //     location: "Central Square",
  //   },
  //   {
  //     id: 6,
  //     name: "Trendy Threads",
  //     category: "fashion",
  //     rating: 4.4,
  //     reviews: 67,
  //     image: "/placeholder.svg?height=300&width=400&text=Trendy+Threads",
  //     location: "Shopping Mall",
  //   },
  //   {
  //     id: 7,
  //     name: "Elegant Styles",
  //     category: "fashion",
  //     rating: 4.3,
  //     reviews: 52,
  //     image: "/placeholder.svg?height=300&width=400&text=Elegant+Styles",
  //     location: "Fashion Avenue",
  //   },
  //   {
  //     id: 8,
  //     name: "Gadget Galaxy",
  //     category: "tech",
  //     rating: 4.6,
  //     reviews: 93,
  //     image: "/placeholder.svg?height=300&width=400&text=Gadget+Galaxy",
  //     location: "Tech Park",
  //   },
  //   {
  //     id: 9,
  //     name: "Digital Dreams",
  //     category: "tech",
  //     rating: 4.5,
  //     reviews: 84,
  //     image: "/placeholder.svg?height=300&width=400&text=Digital+Dreams",
  //     location: "Innovation District",
  //   },
  //   {
  //     id: 10,
  //     name: "Wellness Spa",
  //     category: "health",
  //     rating: 4.8,
  //     reviews: 136,
  //     image: "/placeholder.svg?height=300&width=400&text=Wellness+Spa",
  //     location: "Serenity Street",
  //   },
  //   {
  //     id: 11,
  //     name: "Beauty Essentials",
  //     category: "health",
  //     rating: 4.4,
  //     reviews: 72,
  //     image: "/placeholder.svg?height=300&width=400&text=Beauty+Essentials",
  //     location: "Glamour Avenue",
  //   },
  //   {
  //     id: 12,
  //     name: "Home Harmony",
  //     category: "home",
  //     rating: 4.7,
  //     reviews: 98,
  //     image: "/placeholder.svg?height=300&width=400&text=Home+Harmony",
  //     location: "Decor District",
  //   },
  //   {
  //     id: 13,
  //     name: "Cozy Corners",
  //     category: "home",
  //     rating: 4.5,
  //     reviews: 87,
  //     image: "/placeholder.svg?height=300&width=400&text=Cozy+Corners",
  //     location: "Comfort Lane",
  //   },
  //   {
  //     id: 14,
  //     name: "Expert Consultants",
  //     category: "services",
  //     rating: 4.9,
  //     reviews: 142,
  //     image: "/placeholder.svg?height=300&width=400&text=Expert+Consultants",
  //     location: "Business Center",
  //   },
  //   {
  //     id: 15,
  //     name: "Quick Repairs",
  //     category: "services",
  //     rating: 4.6,
  //     reviews: 103,
  //     image: "/placeholder.svg?height=300&width=400&text=Quick+Repairs",
  //     location: "Service Square",
  //   },
  // ]

  // Group businesses by category
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

