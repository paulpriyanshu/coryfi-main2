"use client"

import { useState } from "react"
import { MapPin, Edit2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AddressFormModal from "@/components/address-form-modal"

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

interface AddressFormClientProps {
  userId: string | number
  userData: User
  hasAddresses: boolean
  hasPhoneNumber: boolean
}

export default function AddressFormClient({ userId, userData, hasAddresses, hasPhoneNumber }: AddressFormClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(!hasAddresses || !hasPhoneNumber)

  // Get the home address by default, or the first available address
  const defaultAddress =
    userData?.userDetails?.addresses?.find((address) => address.type === "home") ||
    userData?.userDetails?.addresses?.[0]

  return (
    <>
      {hasAddresses && hasPhoneNumber ? (
        <Card className="dark:bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Shipping Address</CardTitle>
              <CardDescription>Your order will be delivered to this address</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} className="flex items-center">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-muted-foreground mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{userData.name}</p>
                  <p>{defaultAddress?.addressLine1}</p>
                  {defaultAddress?.addressLine2 && <p>{defaultAddress.addressLine2}</p>}
                  <p>
                    {defaultAddress?.city}, {defaultAddress?.state} {defaultAddress?.zip}
                  </p>
                  {defaultAddress?.country && <p>{defaultAddress.country}</p>}
                  {defaultAddress?.landmark && <p>Landmark: {defaultAddress.landmark}</p>}
                  <p className="mt-1">Phone: {userData?.userDetails?.phoneNumber}</p>
                  {defaultAddress?.instructions && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium">Delivery Instructions:</span> {defaultAddress.instructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
            <CardDescription>Please provide your shipping address and contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsModalOpen(true)} className="w-full">
              Add Shipping Address
            </Button>
          </CardContent>
        </Card>
      )}

      <AddressFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        userData={userData}
        userId={Number(userId)}
        onAddressSaved={() => {}}
      />
    </>
  )
}

