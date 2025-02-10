"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Button } from "@/components/ui/button"
import { user_check } from "@/app/api/security/verications"

export default function MerchantForm({ userId, createMerchant,email }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()


  const handleSubmit = async (event) => {
    event.preventDefault()
   const verify=await user_check({userId,email})
   if (!verify) {
    alert("Invalid user");
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <h1>Invalid User</h1>
      </div>
    );
  }
    setIsSubmitting(true)

    const form = event.target as HTMLFormElement
    const formData = new FormData(form)

    const data = {
      userId: Number(userId),
      Name: formData.get("Name") as string,
      MobileNumber: formData.get("Mobile Number") as string,
      AlternativeMobileNumber:formData.get("AlternativeMobileNumber") as string,
      Email: formData.get("Email") as string,
      UPI_ID: formData.get("UPI_ID") as string,
      PermanentAddress: formData.get("PermanentAddress") as string,
      AadharNumber: formData.get("AadharNumber") as string,
      PAN:formData.get("PAN") as string
    }

    try {
      const result = await createMerchant(data)
      if (result.success) {
        router.replace("/dashboard") // Redirect on success
      } else {
        // Handle error (e.g., show error message)
        console.error("Failed to create merchant:", result.error)
      }
    } catch (error) {
      console.error("Failed to create merchant:", error)
      // Handle error (e.g., show error message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <Label htmlFor="Name">Name</Label>
        <Input id="Name" name="Name" required />
      </div>

      <div>
        <Label htmlFor="Mobile Number"> Mobile Number</Label>
        <Input id="Mobile Number" name="Mobile Number" type="tel" required />
      </div>
      <div>
        <Label htmlFor="AlternativeMobileNumber"> Alternative Mobile Number</Label>
        <Input id="AlternativeMobileNumber" name="AlternativeMobileNumber" type="tel" required />
      </div>

      <div>
        <Label htmlFor="Email"> Email</Label>
        <Input id="Email" name="Email" type="email" required />
      </div>

      <div>
        <Label htmlFor="UPI_ID"> UPI ID</Label>
        <Input id="UPI_ID" name="UPI_ID" />
      </div>

      <div>
        <Label htmlFor="PermanentAddress"> Address</Label>
        <Input id="PermanentAddress" name="PermanentAddress" />
      </div>

      <div>
        <Label htmlFor="AadharNumber">Aadhar Number</Label>
        <Input id="AadharNumber" name="AadharNumber" required />
      </div>
      <div>
        <Label htmlFor="PAN">PAN</Label>
        <Input id="PAN" name="PAN" />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating..." : "Create Merchant"}
      </Button>
    </form>
  )
}

