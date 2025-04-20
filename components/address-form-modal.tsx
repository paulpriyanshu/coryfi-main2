"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"
import { saveUserAddress } from "@/app/api/actions/network"

interface Address {
  id?: number
  type?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  country?: string
  zip?: string
  landmark?: string
  instructions?: string
}

interface UserDetails {
  id?: number
  phoneNumber?: string
  bio?: string
  displayImage?: string
  addresses?: Address[]
}

interface User {
  id: number
  name?: string
  email?: string
  userDetails?: UserDetails
}

interface AddressFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userData: User
  userId: number
  onAddressSaved?: () => void
}

export default function AddressFormModal({
  open,
  onOpenChange,
  userData,
  userId,
  onAddressSaved,
}: AddressFormModalProps) {
  const router = useRouter()
  const [addressType, setAddressType] = useState<string>("home")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Find the address of the selected type if it exists
  const selectedAddress = userData?.userDetails?.addresses?.find((address) => address.type === addressType)

  // Reset form when address type changes
  useEffect(() => {
    if (open) {
      // Reset form fields when modal opens or address type changes
      const form = document.getElementById("addressForm") as HTMLFormElement
      if (form) form.reset()
    }
  }, [addressType, open])

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
  
    try {
      // Add the address type to the form data
      formData.append("type", addressType)
  
      // Strip "+91" if it exists from the phone number
      const rawPhone = formData.get("phone") as string
      const cleanedPhone = rawPhone.replace(/^\+91\s?/, "")
      formData.set("phone", cleanedPhone)
  
      const response = await saveUserAddress(userId, formData)
  
      if (response.success) {
        toast.success("Your address has been saved successfully.")
        onOpenChange(false)
        if (onAddressSaved) onAddressSaved()
        router.refresh()
      } else {
        throw new Error(response.error || "Failed to save address")
      }
    } catch (error) {
      console.error("Error saving address:", error)
      toast.error("Failed to save your address. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shipping Address</DialogTitle>
          <DialogDescription>
            Enter your shipping address details. You can save multiple address types.
          </DialogDescription>
        </DialogHeader>

        <form id="addressForm" action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Address Type</Label>
            <Select value={addressType} onValueChange={setAddressType}>
              <SelectTrigger>
                <SelectValue placeholder="Select address type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Your phone number"
              defaultValue={userData?.userDetails?.phoneNumber || ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              placeholder="Street address, P.O. box, company name"
              defaultValue={selectedAddress?.addressLine1 || ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
            <Input
              id="addressLine2"
              name="addressLine2"
              placeholder="Apartment, suite, unit, building, floor, etc."
              defaultValue={selectedAddress?.addressLine2 || ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="City" defaultValue={selectedAddress?.city || ""} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                name="state"
                placeholder="State or province"
                defaultValue={selectedAddress?.state || ""}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                placeholder="Country"
                defaultValue={selectedAddress?.country || ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">ZIP/Postal Code</Label>
              <Input
                id="zip"
                name="zip"
                placeholder="ZIP or postal code"
                defaultValue={selectedAddress?.zip || ""}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="landmark">Landmark (Optional)</Label>
            <Input
              id="landmark"
              name="landmark"
              placeholder="Nearby landmark for easier navigation"
              defaultValue={selectedAddress?.landmark || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              name="instructions"
              placeholder="Special instructions for delivery"
              defaultValue={selectedAddress?.instructions || ""}
              className="min-h-[80px]"
            />
          </div>

          {/* Hidden fields for user details */}
          <input type="hidden" name="bio" value={userData?.userDetails?.bio || ""} />
          <input type="hidden" name="displayImage" value={userData?.userDetails?.displayImage || ""} />

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Address
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Mock function for the client component
// The actual function will be called from the server action
// async function saveUserAddress(userId: number, formData: FormData) {
//   // This is just a client-side placeholder
//   // The actual implementation is in the server action
//   return { success: true }
// }

