import { getCartsByUserId } from "@/app/api/business/products"
import { ArrowLeft, Check, ShoppingBag, Shield, RefreshCw, Users, Tag, Percent } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import OrderButton from "./OrderButton"
import { fetchUserData } from "../../api/actions/media"
import AddressFormClient from "./address-form-client"
import { applyBestOffer } from "@/app/cart/best-offers"

export default async function CheckoutPage({ params }) {
  const userId = params.id
  const userData = await fetchUserData(Number.parseInt(userId))
  const cart = await getCartsByUserId(Number.parseInt(userId))

  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    redirect("/cart")
  }

  // Apply offers
  const ans = await applyBestOffer(
    cart.cartItems.map(item => ({
      productId: item.productId,
      price: item.price,
    }))
  )

  const originalTotalCost = cart?.totalCost || 0
  const taxAmount = 0
  
  // Calculate totals from the new data structure
  const totalDiscount = Object.values(ans).reduce((sum, offer) => sum + (offer.bestDiscount || 0), 0)
  const finalTotalAfterOffers = Object.values(ans).reduce((sum, offer) => sum + (offer.finalTotal || 0), 0)
  const totalWithTax = finalTotalAfterOffers + taxAmount

  // Check if user has any addresses
  const hasAddresses = userData?.userDetails?.addresses && userData.userDetails.addresses.length > 0
  const hasPhoneNumber = userData?.userDetails?.phoneNumber

  // Group items by productId and count quantities
  const groupedItems = []

  if (cart?.cartItems) {
    for (const item of cart.cartItems) {
      // Create a unique key based on productId and customization
      const uniqueKey = `${item.id}-${JSON.stringify(item.customization)}`

      // Find if this exact item (including customization) already exists in groupedItems
      const existingItemIndex = groupedItems.findIndex((i) => i.uniqueKey === uniqueKey)

      if (existingItemIndex !== -1) {
        groupedItems[existingItemIndex].quantity += 1
      } else {
        // Find which business page this item belongs to and attach offer info
        let itemOfferInfo = null
        let discountedPrice = item.price // Default to original price
        let originalPrice = item.price

        for (const [businessPageId, offerData] of Object.entries(ans)) {
          if (offerData.appliedOffer && offerData.products) {
            // Find the specific product in the products array
            const productOffer = offerData.products.find(p => p.productId === item.productId)
            if (productOffer) {
              itemOfferInfo = {
                businessPageId,
                appliedOffer: offerData.appliedOffer,
                hasOffer: true,
                originalPrice: productOffer.originalPrice,
                discountedPrice: productOffer.discountedPrice,
                discount: productOffer.originalPrice - productOffer.discountedPrice
              }
              discountedPrice = productOffer.discountedPrice
              originalPrice = productOffer.originalPrice
              break
            }
          }
        }
        
        groupedItems.push({ 
          ...item, 
          quantity: 1, 
          uniqueKey,
          offerInfo: itemOfferInfo,
          displayPrice: discountedPrice,
          originalPrice: originalPrice
        })
      }
    }
  }

  // Remove the uniqueKey before returning the grouped items
  const finalGroupedItems = groupedItems.map(({ uniqueKey, ...rest }) => rest)

  // Helper function to get active offers for display
  const getActiveOffers = () => {
    return Object.values(ans).filter(offer => offer.appliedOffer !== null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link
            href="/cart"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors mr-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden md:block">Back to Cart</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Secure Checkout</h1>
            <p className="text-muted-foreground mt-1">Complete your order with confidence</p>
          </div>
        </div>

        {/* Active Offers Banner */}
        {getActiveOffers().length > 0 && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <Tag className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">Great News! Your Offers Are Applied</h3>
              </div>
              <div className="space-y-2">
                {getActiveOffers().map((offer, index) => (
                  <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 text-green-600 mr-2" />
                      <div>
                        <p className="font-medium text-sm">{offer.appliedOffer.title}</p>
                        <p className="text-xs text-muted-foreground">{offer.appliedOffer.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                      -₹{offer.bestDiscount.toFixed(2)}
                    </Badge>
                  </div>
                ))}
                <div className="text-center mt-3 p-2 bg-green-100 dark:bg-green-900/40 rounded-md">
                  <span className="text-green-700 dark:text-green-300 font-medium text-sm">
                    🎉 You're saving ₹{totalDiscount.toFixed(2)} on this order!
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800 dark:text-green-200">Why We Use Prepaid Orders</CardTitle>
            </div>
            <CardDescription className="text-green-700 dark:text-green-300">
              Your safety and satisfaction are our top priorities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">Problems We Solved</h4>
                <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                    <span>No more phone call miscommunications and errors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                    <span>Eliminated wrong items, quantities, and overcharging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                    <span>No more unprofessional experiences or lost orders</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">Your Protection</h4>
                <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Full Refund Guarantee</strong> - Wrong items or quantities get refunded
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Transparent Orders</strong> - Everything recorded and verified digitally
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Professional Service</strong> - Regulated and trustworthy experience
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Address Form Client Component */}
            <AddressFormClient
              userId={userId}
              userData={userData}
              hasAddresses={hasAddresses}
              hasPhoneNumber={hasPhoneNumber}
            />

            {hasAddresses && hasPhoneNumber && (
              <Card className="dark:bg-gray-900 border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Payment Method
                      </CardTitle>
                      <CardDescription>Complete your purchase securely with Google Pay</CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Secure
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-8 border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center text-center bg-muted/5">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Image
                        src="/google-pay-logo.png"
                        alt="Google Pay"
                        width={40}
                        height={40}
                        className="opacity-80"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Secure Payment Processing</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Your payment is processed securely through Google Pay. We never store your payment information.
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
            <Card className="border-muted/40 overflow-hidden dark:bg-gray-900 sticky top-4">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  {finalGroupedItems.length} item{finalGroupedItems.length !== 1 ? "s" : ""} in your cart
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {finalGroupedItems.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-4 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors ${item.offerInfo?.hasOffer ? "ring-1 ring-green-200 bg-green-50/50 dark:ring-green-800 dark:bg-green-900/20" : ""}`}
                    >
                      <div className="relative w-16 h-16 bg-muted/20 rounded-md overflow-hidden flex-shrink-0 border">
                        <Image
                          src={item.images?.[0] || `/placeholder.svg?height=200&width=200&query=product image`}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        {/* Offer Badge on Image */}
                        {item.offerInfo?.hasOffer && (
                          <div className="absolute -top-1 -right-1">
                            <Badge className="bg-green-600 text-white text-xs px-1 py-0">
                              {item.offerInfo.appliedOffer.discountValue}%
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{item.name}</h4>
                        
                        {/* Show offer applied indicator */}
                        {item.offerInfo?.hasOffer && (
                          <div className="flex items-center mt-1">
                            <Tag className="h-3 w-3 text-green-600 mr-1" />
                            <span className="text-xs text-green-600 font-medium">
                              Saved ₹{(item.offerInfo.discount * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        )}

                        {/* Customization display */}
                        {item.customization && (
                          <div className="mt-1">
                            <p className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                              {item.customization}
                            </p>
                          </div>
                        )}

                        {/* Delivery method badge */}
                        {item.recieveBy && Object.keys(item.recieveBy).length > 0 ? (
                          <Badge variant="outline" className="text-xs mt-1 mr-2">
                            {Object.values(item.recieveBy)[0]}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs mt-1 mr-2">
                            Delivery
                          </Badge>
                        )}

                        {/* Scheduled pickup info */}
                        {item.scheduledDateTime && (
                          <div className="mt-1">
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {item.scheduledDateTime.date} | {item.scheduledDateTime.timeSlot}
                            </Badge>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            Qty: {item.quantity}
                          </Badge>
                          <div className="text-right">
                            {item.offerInfo?.hasOffer ? (
                              <div>
                                <p className="text-xs text-muted-foreground line-through">
                                  ₹{(item.originalPrice * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-sm font-semibold text-green-600">
                                  ₹{(item.displayPrice * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">₹{item.displayPrice.toFixed(2)} each</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm font-semibold">₹{(item.displayPrice * item.quantity).toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">₹{item.displayPrice.toFixed(2)} each</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{originalTotalCost.toFixed(2)}</span>
                  </div>
                  
                  {/* Show discount breakdown if any offers applied */}
                  {totalDiscount > 0 && (
                    <div className="space-y-2">
                      {getActiveOffers().map((offer, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-green-600 flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            {offer.appliedOffer.title}
                          </span>
                          <span className="text-green-600 font-medium">-₹{offer.bestDiscount.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-green-600">Total Savings</span>
                        <span className="text-green-600">-₹{totalDiscount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Free
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (18%)</span>
                    <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg bg-primary/5 p-3 rounded-lg">
                    <span>Total</span>
                    <div className="text-right">
                      {totalDiscount > 0 && (
                        <div className="text-sm text-muted-foreground line-through">
                          ₹{(originalTotalCost + taxAmount).toFixed(2)}
                        </div>
                      )}
                      <span className="text-primary">₹{totalWithTax.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Show total savings summary */}
                  {totalDiscount > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md mt-3">
                      <div className="flex items-center justify-center text-green-700 dark:text-green-300">
                        <Tag className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">You saved ₹{totalDiscount.toFixed(2)} on this order!</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Your Order is Protected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 flex-shrink-0">
                      <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800 dark:text-green-200">Secure Checkout</h3>
                      <p className="text-xs text-green-700 dark:text-green-300">End-to-end encrypted payment process</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 flex-shrink-0">
                      <RefreshCw className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800 dark:text-green-200">Refund Guarantee</h3>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Full refund for wrong items or quantities
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 flex-shrink-0">
                      <ShoppingBag className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800 dark:text-green-200">Free Shipping</h3>
                      <p className="text-xs text-green-700 dark:text-green-300">On all orders, no minimum required</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 flex-shrink-0">
                      <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800 dark:text-green-200">Professional Service</h3>
                      <p className="text-xs text-green-700 dark:text-green-300">Regulated and trustworthy experience</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}