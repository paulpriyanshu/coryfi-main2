"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Button } from "@/components/ui/button"
import { user_check } from "@/app/api/security/verications"
import { motion } from "framer-motion"
import BusinessForm from "./business-form"

export default function MerchantForm({ userId, email }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBusinessForm, setShowBusinessForm] = useState(false)
  const [merchantData, setMerchantData] = useState({
    userId: Number(userId),
    Name: "",
    MobileNumber: "",
    AlternativeMobileNumber: "",
    Email: email || "",
    UPI_ID: "",
    PermanentAddress: "",
    AadharNumber: "",
    PAN: "",
  })
  const router = useRouter()

  const handleSubmit = async (event) => {
    event.preventDefault()
    const verify = await user_check({ userId, email })
    if (!verify) {
      alert("Invalid user")
      return
    }
    setIsSubmitting(true)

    const form = event.target as HTMLFormElement
    const formData = new FormData(form)

    setMerchantData({
      userId: Number(userId),
      Name: formData.get("Name") as string,
      MobileNumber: formData.get("MobileNumber") as string,
      AlternativeMobileNumber: formData.get("AlternativeMobileNumber") as string,
      Email: formData.get("Email") as string,
      UPI_ID: formData.get("UPI_ID") as string,
      PermanentAddress: formData.get("PermanentAddress") as string,
      AadharNumber: formData.get("AadharNumber") as string,
      PAN: formData.get("PAN") as string,
    })

    setIsSubmitting(false)
    setShowBusinessForm(true)
  }

  return (
    <div className="relative w-full overflow-hidden">
      <motion.div
        className="flex w-full"
        initial={false}
        animate={{ x: showBusinessForm ? "-100%" : "0%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Merchant Form */}
        <div className="w-full flex-shrink-0">
          {!showBusinessForm && (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="Name">Name</Label>
                <Input id="Name" name="Name" required defaultValue={merchantData.Name} />
              </div>

              <div>
                <Label htmlFor="MobileNumber">Mobile Number</Label>
                <Input id="MobileNumber" name="MobileNumber" type="tel" required defaultValue={merchantData.MobileNumber} />
              </div>

              <div>
                <Label htmlFor="AlternativeMobileNumber">Alternative Mobile Number</Label>
                <Input id="AlternativeMobileNumber" name="AlternativeMobileNumber" type="tel" defaultValue={merchantData.AlternativeMobileNumber} />
              </div>

              <div>
                <Label htmlFor="Email">Email</Label>
                <Input id="Email" name="Email" type="email" required defaultValue={merchantData.Email} />
              </div>

              <div>
                <Label htmlFor="UPI_ID">UPI ID</Label>
                <Input id="UPI_ID" name="UPI_ID" defaultValue={merchantData.UPI_ID} />
              </div>

              <div>
                <Label htmlFor="PermanentAddress">Address</Label>
                <Input id="PermanentAddress" name="PermanentAddress" defaultValue={merchantData.PermanentAddress} />
              </div>

              <div>
                <Label htmlFor="AadharNumber">Aadhar Number</Label>
                <Input id="AadharNumber" name="AadharNumber" required defaultValue={merchantData.AadharNumber} />
              </div>

              <div>
                <Label htmlFor="PAN">PAN</Label>
                <Input id="PAN" name="PAN" defaultValue={merchantData.PAN} />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Next: Business Details"}
              </Button>
            </form>
          )}
        </div>

        {/* Business Form */}
        <div className="w-full flex-shrink-0">
          {showBusinessForm && (
            <BusinessForm
              merchantData={merchantData}
              onBack={() => setShowBusinessForm(false)}
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}