import { getProductDetails } from "@/app/api/business/products"
import Product from "./product"


export default async function ProductPage({params}) {

  const data=await getProductDetails(params.pageId,parseInt(params.productId))
  console.log("Product Data",JSON.stringify(data.ProductAlertsBeforeCart,null,2))


return (
  
    <>
    <Product product={data} productId={params.productId}/>
    </>

  )
}

