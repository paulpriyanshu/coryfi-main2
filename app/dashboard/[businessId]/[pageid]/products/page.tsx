import { Suspense } from "react"
import  ProductsGrid from "./products-grid"
import { ProductsGridSkeleton } from "./products-grid-skeleton"

export default async function ProductsPage({params}) {
  const pageid=params.pageid
  const businessId=params.businessId
  return (
    <div className="container  py-2">
      
      <Suspense fallback={<ProductsGridSkeleton />}>
        <ProductsGrid pageId={pageid} businessId={businessId} />
      </Suspense>
    </div>
  )
}

