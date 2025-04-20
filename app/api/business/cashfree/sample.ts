"use server"
import db from "@/db"


export const  sample=async()=>{
    const orderData=await db.order.findUnique({
        where:{
            order_id:"ORD_M95XIFVN5N0B"
        }
    })
    return orderData
}

// console.log(sample)




