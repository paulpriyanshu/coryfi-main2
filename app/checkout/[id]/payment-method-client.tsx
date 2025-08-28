"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import OrderButton from "./OrderButton"

type PaymentMethodClientProps = {
  userId: string | number
  userEmail: string
  userName: string
  userPhone?: string
  totalAmount: number
  cart: any
}

export default function PaymentMethodClient({
  userId,
  userEmail,
  userName,
  userPhone,
  totalAmount,
  cart,
}: PaymentMethodClientProps) {
  const [isCOD, setIsCOD] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="cod"
            checked={isCOD}
            onCheckedChange={(v) => setIsCOD(Boolean(v))}
            aria-checked={isCOD}
            aria-label="Pay with Cash on Delivery (COD)"
          />
          <label htmlFor="cod" className="text-sm select-none">
            Cash on Delivery (COD)
          </label>
        </div>
        <Badge
          variant="secondary"
          className={
            isCOD
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }
        >
          {isCOD ? "COD" : "Secure"}
        </Badge>
      </div>

      <div className="p-8 border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center text-center bg-muted/5">
        {!isCOD ? (
          <>
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Image src="/google-pay-logo.png" alt="Google Pay" width={40} height={40} className="opacity-80" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Secure Payment Processing</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Your payment is processed securely .
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              For refunds and cancellation contact the business as we are not facilitating your payment.
            </p>
          </>
        )}

        <OrderButton
          userId={userId}
          user_email={userEmail}
          user_name={userName}
          user_phone={userPhone}
          total_amount={totalAmount}
          cart={cart}
          COD={isCOD}
        />
      </div>
    </div>
  )
}
