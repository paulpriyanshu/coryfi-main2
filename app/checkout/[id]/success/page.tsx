import Link from "next/link"
import { CheckCircle, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import GooglePayButtonComponent from "./GooglePlayButtonComponent"

export default function OrderSuccessPage() {
  const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000)
  const orderDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const totalAmount = 2948.82 // Ensure this comes dynamically from your order

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <div className="max-w-md w-full text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. We've received your order and will process it right away.
        </p>
      </div>

      <Card className="max-w-md w-full mb-8">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Order #{orderNumber}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Date</span>
              <span>{orderDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span>Google Pay</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping Method</span>
              <span>Standard Shipping</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total Amount</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex items-center w-full p-4 bg-muted/20 rounded-md">
            <Package className="h-5 w-5 text-muted-foreground mr-3" />
            <div>
              <h3 className="text-sm font-medium">Estimated Delivery</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
                {" - "}
                {new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Google Pay Button (Client Component) */}
      {/* <GooglePayButtonComponent totalAmount={1} /> */}

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link href="/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
        <Link href="/account/orders">
          <Button>View Order History</Button>
        </Link>
      </div>
    </div>
  )
}