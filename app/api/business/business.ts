"use server"
import db from "@/db"
import { z } from "zod";

// Define validation schema using Zod
const merchantSchema = z.object({
  userId: z.number(),
  Name: z.string().min(1, " name is required"),
  MobileNumber: z.string().min(10, "Invalid phone number"),
  AlternativeMobileNumber: z.string().min(10,"Invalid phone number"),
  Email: z.string().email("Invalid email address"),
  UPI_ID: z.string(),
  PermanentAddress: z.string().optional(),
  AadharNumber: z.string().min(12, "Invalid Aadhaar number"),
  PAN:z.string().optional(),
  additionalFields: z.any().optional(),
});

export async function createMerchant(data: any) {
  try {
    console.log("data",data)
    // Validate input
    const validatedData = merchantSchema.parse(data);
    
    // Create merchant in the database
    const merchant = await db.merchant.create({
        data: {
          userId: validatedData.userId,
          Name: validatedData.Name,
          MobileNumber: validatedData.MobileNumber,
          AlternativeMobileNumber: validatedData.AlternativeMobileNumber,
          Email: validatedData.Email,
          UPI_ID: validatedData.UPI_ID,
          PermanentAdress: validatedData.PermanentAddress,
          AadharNumber: validatedData.AadharNumber,
          PAN: validatedData.PAN,
          additionalFields: validatedData.additionalFields,
        } 
      });

    return { success: true, merchant };
  } catch (error) {
    console.error("Error creating merchant:", error);
    return { success: false, error: error instanceof z.ZodError ? error.format() : "Something went wrong" };
  }
}

export const verifyMerchant=async(userId:number)=>{
 try {
        console.log("finding merchant with id",userId)
       const isMerchant=await db.merchant.findFirst({
           where:{
               userId
           },
           
       })

       if(isMerchant){
        return true
       }
       return false
 } catch (error) {
    console.log(error)
    return {error}
 }

}