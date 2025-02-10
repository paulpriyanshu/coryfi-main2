"use server"
import db from "@/db"

export const user_check=async({userId,email})=>{
    userId=Number(userId)
    const user=await db.user.findFirst({
        where:{
            id:userId
        }
    })
    console.log(user.email,email)

    if(user?.email===email) return true
    else return false

}