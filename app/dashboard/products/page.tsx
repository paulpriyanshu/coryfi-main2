import { Suspense } from "react"
import  ProductsGrid from "./products-grid"
import { ProductsGridSkeleton } from "./products-grid-skeleton"
import { getMerchant } from "@/app/api/business/business"
import { getServerSession } from "next-auth"
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function ProductsPage() {
  const session=await getServerSession(authOptions)
  const businessData=await getMerchant(session?.user?.email)
  console.log("business data",businessData)
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-600">
        Product Management
      </h1>
      <Suspense fallback={<ProductsGridSkeleton />}>
        <ProductsGrid businessId={businessData.businesses[0].id} />
      </Suspense>
    </div>
  )
}

