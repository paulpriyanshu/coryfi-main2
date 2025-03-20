import { getAllProducts, getCategories } from "@/app/api/business/products"
import CategoriesList from "./categories-list"

export default async function CategoriesPage({ params }) {
  const businessId = params.businessId
  const pageid=params.pageid
  const categories = await getCategories(pageid)
  console.log("category page",businessId,pageid)
  
  const products= await getAllProducts(pageid)
  console.log("cats",categories)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
        Category Management
      </h1>
      <CategoriesList initialCategories={categories.data} pageId={pageid} businessId={businessId} initialProducts={products} />
    </div>
  )
}
