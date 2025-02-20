"use server"
import db from "@/db"
import { string, z } from "zod";
import { fetchUserId } from "../actions/media";

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

export async function getMerchant(userEmail: string) {
  const userData = await fetchUserId(userEmail);

  try {
    const merchant_data = await db.merchant.findFirst({
      where: {
        userId: userData.id
      },
      include: {
        businesses: true // Fetch related businesses
      }
    });

    return merchant_data; 

  } catch (error) {
    console.error("Error fetching merchant data:", error);
    throw new Error("Failed to retrieve merchant data.");
  }
}
export async function createMerchantAndBusiness(merchantData: any, businessData: any) {
  try {
    return await db.$transaction(async (tx) => {
      // Validate merchant data
      const validatedMerchantData = merchantSchema.parse(merchantData);
      
      // Create Merchant
      const merchant = await tx.merchant.create({
        data: {
          userId: validatedMerchantData.userId,
          Name: validatedMerchantData.Name,
          MobileNumber: validatedMerchantData.MobileNumber,
          AlternativeMobileNumber: validatedMerchantData.AlternativeMobileNumber,
          Email: validatedMerchantData.Email,
          UPI_ID: validatedMerchantData.UPI_ID,
          PermanentAdress: validatedMerchantData.PermanentAddress,
          AadharNumber: validatedMerchantData.AadharNumber,
          PAN: validatedMerchantData.PAN,
          additionalFields: validatedMerchantData.additionalFields,
        },
      });

      // Validate business data
      const validatedBusinessData = businessSchema.parse(businessData);

      // Create Business linked to Merchant
      const business = await tx.business.create({
        data: {
          merchantId: merchant.Merchant_Id, // Linking the business to the merchant
          Business_Name: validatedBusinessData.Business_Name,
          Business_Email: validatedBusinessData.Business_Email,
          Business_Address: validatedBusinessData.Business_Address,
          Entity: validatedBusinessData.Entity,
          Sector: validatedBusinessData.Sector,
          GSTIN: validatedBusinessData.GSTIN,
          Business_Mobile_Number: validatedBusinessData.Business_Mobile_Number,
          Alternate_Mobile_Number: validatedBusinessData.Alternate_Mobile_Number,
          Udyam_Registration_Number: validatedBusinessData.Udyam_Registration_Number,
          Business_UPI_ID: validatedBusinessData.Business_UPI_ID,
          Bank_Account_Number: validatedBusinessData.Bank_Account_Number,
          IFSC_CODE: validatedBusinessData.IFSC_CODE,
        },
      });

      return { success: true, merchant, business };
    });
  } catch (error) {
    console.error("Transaction failed:", error);
    return { success: false, error: error instanceof z.ZodError ? error.format() : "Something went wrong" };
  }
}
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
const businessSchema = z.object({
  Business_Name: z.string().min(1, "Business name is required"),
  Business_Email: z.string().email("Invalid email address").optional(),
  Business_Address: z.string().min(1, "Address is required"),
  Entity: z.string().min(1, "Business type is required"),
  Sector: z.string().optional(),
  GSTIN: z.string().optional(),
  Business_Mobile_Number: z.string().min(10, "Invalid business phone number").optional(),
  Alternate_Mobile_Number: z.string().optional(),
  Udyam_Registration_Number: z.string().optional(),
  Business_UPI_ID: z.string().optional(),
  Bank_Account_Number: z.string().optional(),
  IFSC_CODE: z.string().optional(),
});

export async function createBusiness(data: any, merchantId: string) {
  try {
    // Validate the business data
    const validatedBusinessData = businessSchema.parse(data);

    // Create business associated with the merchant
    const business = await db.business.create({
      data: {
        merchantId: merchantId, // Link the business to the correct merchant
        Business_Name: validatedBusinessData.Business_Name,
        Business_Email: validatedBusinessData.Business_Email,
        Business_Address: validatedBusinessData.Business_Address,
        Entity: validatedBusinessData.Entity,
        Sector: validatedBusinessData.Sector,
        GSTIN: validatedBusinessData.GSTIN,
        Business_Mobile_Number: validatedBusinessData.Business_Mobile_Number,
        Alternate_Mobile_Number: validatedBusinessData.Alternate_Mobile_Number,
        Udyam_Registration_Number: validatedBusinessData.Udyam_Registration_Number,
        Business_UPI_ID: validatedBusinessData.Business_UPI_ID,
        Bank_Account_Number: validatedBusinessData.Bank_Account_Number,
        IFSC_CODE: validatedBusinessData.IFSC_CODE,
      },
    });

    return { success: true, business };
  } catch (error) {
    console.error("Error creating business:", error);
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