import { getCartsByUserId } from "@/app/api/business/products"
import { ArrowLeft, Check, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import OrderButton from "./OrderButton"
import { fetchUserData } from "../../api/actions/media"
import AddressFormClient from "./address-form-client"

export default async function CheckoutPage({ params }) {
  const userId = params.id
  const userData = await fetchUserData(Number.parseInt(userId))
  const cart = await getCartsByUserId(Number.parseInt(userId))

  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    redirect("/cart")
  }

  const totalCost = cart?.totalCost || 0
  const taxAmount = 0
  const totalWithTax = totalCost + taxAmount

  // Check if user has any addresses
  const hasAddresses = userData?.userDetails?.addresses && userData.userDetails.addresses.length > 0
  const hasPhoneNumber = userData?.userDetails?.phoneNumber

  const groupedItems = []
  if (cart?.cartItems) {
    for (const item of cart.cartItems) {
      const quantity = cart.productIds.filter((id) => id === item.id).length
      const existingItemIndex = groupedItems.findIndex((i) => i.id === item.id)
      if (existingItemIndex !== -1) {
        groupedItems[existingItemIndex].quantity = quantity
      } else {
        groupedItems.push({ ...item, quantity })
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 ">
      <div className="flex items-center mb-8">
        <Link
          href="/cart"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors mr-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden md:block">Back to Cart</span>
        </Link>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 ">
        <div className="lg:col-span-2 space-y-6 ">
          {/* Address Form Client Component */}
          <AddressFormClient
            userId={userId}
            userData={userData}
            hasAddresses={hasAddresses}
            hasPhoneNumber={hasPhoneNumber}
          />

          {hasAddresses && hasPhoneNumber && (
            <Card className="dark:bg-gray-900">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Complete your purchase with Google Pay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 border rounded-md flex flex-col items-center justify-center text-center">
                  <Image
                    src="/placeholder.svg?height=80&width=80"
                    alt="Google Pay"
                    width={80}
                    height={80}
                    className="mb-4"
                  />
                  <p className="text-muted-foreground mb-6">
                    You'll be redirected to Google Pay to complete your payment securely.
                  </p>
                  <OrderButton
                    userId={userId}
                    user_email={userData.email}
                    user_name={userData.name}
                    user_phone={userData?.userDetails?.phoneNumber}
                    total_amount={totalWithTax}
                    cart={cart}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-muted/40 overflow-hidden dark:bg-gray-900">
            <CardHeader className="bg-muted/10 pb-4">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {groupedItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4">
                    <div className="relative w-16 h-16 bg-muted/20 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.images?.[0] || `/placeholder.svg?height=200&width=200`}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium">₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}

                <Separator className="my-2" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (18%)</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{totalWithTax.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted/30 bg-muted/5 dark:bg-gray-900">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Secure Checkout</h3>
                    <p className="text-xs text-muted-foreground">Protected payment process</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center rounded-full bg-primary/10">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Free Shipping</h3>
                    <p className="text-xs text-muted-foreground">On all orders</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

