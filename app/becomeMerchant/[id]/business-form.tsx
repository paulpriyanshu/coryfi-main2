"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createBusiness } from "@/app/api/business/business"
import { createMerchantAndBusiness } from "@/app/api/business/business"

export default function BusinessForm({ merchantData, onBack }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()



  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
  
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)
  
    const businessData = {
      Business_Name: formData.get("Business_Name"),
      Business_Email: formData.get("Business_Email"),
      Business_Address: formData.get("Business_Address"),
      Entity: formData.get("Entity"),
      Sector: formData.get("Sector"),
      GSTIN: formData.get("GSTIN"),
      Business_Mobile_Number: formData.get("Business_Mobile_Number"),
      Alternate_Mobile_Number: formData.get("Alternate_Mobile_Number"),
      Udyam_Registration_Number: formData.get("Udyam_Registration_Number"),
      Business_UPI_ID: formData.get("Business_UPI_ID"),
      Bank_Account_Number: formData.get("Bank_Account_Number"),
      IFSC_CODE: formData.get("IFSC_CODE"),
    }
  
    try {
      const result = await createMerchantAndBusiness(merchantData, businessData)
     
      
      if (result.success) {
        router.replace(`/dashboard/${result.business.Business_Id}/${result.businessPage.pageId}`) // Redirect on success
        console.log("result",result)
      } else {
        console.error("Failed to create merchant and business:", result)
      }
    } catch (error) {
      console.error("Transaction failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <Label htmlFor="Business_Name">Business Name</Label>
        <Input id="Business_Name" name="Business_Name" required />
      </div>

      <div>
        <Label htmlFor="Business_Email">Business Email</Label>
        <Input id="Business_Email" name="Business_Email" type="email" />
      </div>

      <div>
        <Label htmlFor="Business_Address">Business Address</Label>
        <Textarea id="Business_Address" name="Business_Address" required />
      </div>

      <div>
        <Label htmlFor="Entity">Business Type (Entity)</Label>
        <Input id="Entity" name="Entity" placeholder="Sole Proprietorship, LLP, Pvt Ltd, etc." required />
      </div>

      <div>
        <Label htmlFor="Sector">Sector</Label>
        <Input id="Sector" name="Sector" placeholder="Retail, Manufacturing, Services, etc." required />
      </div>

      <div>
        <Label htmlFor="GSTIN">GSTIN</Label>
        <Input id="GSTIN" name="GSTIN" required />
      </div>

      <div>
        <Label htmlFor="Business_Mobile_Number">Business Mobile Number</Label>
        <Input id="Business_Mobile_Number" name="Business_Mobile_Number" type="tel" required />
      </div>

      <div>
        <Label htmlFor="Alternate_Mobile_Number">Alternate Mobile Number</Label>
        <Input id="Alternate_Mobile_Number" name="Alternate_Mobile_Number" type="tel" />
      </div>

      <div>
        <Label htmlFor="Udyam_Registration_Number">Udyam Registration Number</Label>
        <Input id="Udyam_Registration_Number" name="Udyam_Registration_Number" />
      </div>

      <div>
        <Label htmlFor="Business_UPI_ID">Business UPI ID</Label>
        <Input id="Business_UPI_ID" name="Business_UPI_ID" />
      </div>

      <div>
        <Label htmlFor="Bank_Account_Number">Bank Account Number</Label>
        <Input id="Bank_Account_Number" name="Bank_Account_Number" required />
      </div>

      <div>
        <Label htmlFor="IFSC_CODE">IFSC Code</Label>
        <Input id="IFSC_CODE" name="IFSC_CODE" required />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back to Merchant Details
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Merchant & Business"}
        </Button>
      </div>
    </form>
  )
}