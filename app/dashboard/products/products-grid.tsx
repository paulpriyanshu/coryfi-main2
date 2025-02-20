import { getAllProducts } from "@/app/api/business/products"
import ProductsList from "./products-list"

export default async function ProductsGrid({ businessId }: { businessId: number }) {
    console.log("business id ",businessId)
  const products = await getAllProducts(businessId)
  console.log("your products",products)

  return <ProductsList initialProducts={products} businessId={businessId} />
}