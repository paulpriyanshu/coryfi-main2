"use server"
import db from "@/db"

export const addProduct=async({businessId,name,description,categoryId,images,stock,basePrice,BeforeDiscountPrice,SKU})=>{
  
   try {
     const data=await db.product.create({
         data:{
             businessId,
             name,
             description,
             categoryId,
             images,
             stock,
             basePrice,
             BeforeDiscountPrice,
             SKU
             
         }
 
     })
     return {success:true,data}
   } catch (error) {
    console.error("Error creating merchant:", error);
    return { success: false, error: "Something went wrong" };
    
   }

}


export const getAllProducts=async(businessId:number)=>{
  const data=await db.product.findMany({
    where:{
      businessId
    }
  })
  return data
}