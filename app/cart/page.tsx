import { getCartsByUserId } from "@/app/api/business/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Trash2, ArrowLeft, Package, Plus, Minus, AlertTriangle, Tag, Percent, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Define server actions in a separate file
import { decreaseQuantity, increaseQuantity, removeItem } from "./actions"
import { fetchUserId } from "../api/actions/media"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { applyBestOffer } from "./best-offers"

export default async function CartPage() {
  const session = await getServerSession(authOptions)
  const userData = await fetchUserId(session?.user?.email)
  // console.log("userData while checkout", userData)
  // Replace with actual user ID from your auth system
  if (!userData || !userData.id) {
    console.error("User data not found or missing ID:", userData)
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 p-8 rounded-full mb-6">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-3">User Not Found</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          We couldn't find your user account. Please try logging in again.
        </p>
        <Link href="/login">
          <Button size="lg" className="px-8">
            Login Again
          </Button>
        </Link>
      </div>
    )
  }
 let cart
  try {
    cart = await getCartsByUserId(userId)
  } catch (error) {
    console.error("Error fetching cart:", error)
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 p-8 rounded-full mb-6">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Error Loading Cart</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          There was an error loading your cart. Please try again.
        </p>
        <Button onClick={() => window.location.reload()} size="lg" className="px-8">
          Retry
        </Button>
      </div>
    )
  }
  // console.log("cart details", JSON.stringify(cart, null, 3))
  let ans = {}
  if (cart?.cartItems?.length > 0) {
    try {
      ans = await applyBestOffer(
        cart.cartItems.map(item => ({
          productId: item.productId,
          price: item.price,
        }))
      )
      console.log("ans", JSON.stringify(ans, null, 2))
    } catch (error) {
      console.error("Error applying offers:", error)
      // Continue without offers if there's an error
    }
  }
  // console.log("ans",JSON.stringify(ans,null,2))

  // const userData=await fetchUserData(userId)

  const totalCost = cart?.totalCost
  const taxAmount = 0
  
  // Calculate total discount from all offers
  const totalDiscount = Object.values(ans).reduce((sum, offer) => sum + (offer.bestDiscount || 0), 0)
  const finalTotalAfterOffers = Object.values(ans).reduce((sum, offer) => sum + (offer.finalTotal || 0), 0)
  const totalWithTax = finalTotalAfterOffers + taxAmount
  
  // console.log("user data", JSON.stringify(userData, null, 2))
  //   const quantity=cartItems.filter((item)=>item)
  // console.log("user cart", cart)

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
        for (const [businessPageId, offerData] of Object.entries(ans)) {
          if (offerData?.productIds?.includes(item.productId)) {
            itemOfferInfo = {
              businessPageId,
              appliedOffer: offerData.appliedOffer,
              hasOffer: !!offerData.appliedOffer,
              discount: offerData.bestDiscount || 0,
              originalPrice: item.price,
              discountedPrice: offerData.appliedOffer ? 
                item.price - (item.price * offerData.appliedOffer.discountValue / 100) : 
                item.price
            }
            break
          }
        }
        
        groupedItems.push({ 
          ...item, 
          quantity: 1, 
          uniqueKey,
          offerInfo: itemOfferInfo
        })
      }
    }
  }
  

  // Remove the uniqueKey before returning the grouped items
  const finalGroupedItems = groupedItems.map(({ uniqueKey, ...rest }) => rest)

  console.log("grouped items", groupedItems)

  // Check if any item in the cart has a stock of 0
  const hasOutOfStockItems = groupedItems.some(item => item.stock === 0)

  // Helper function to get active offers for display
  const getActiveOffers = () => {
    return Object.values(ans).filter(offer => offer.appliedOffer !== null)
  }

  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-muted/30 p-8 rounded-full mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Looks like you haven't added any items to your cart yet. Explore our products and find something you love!
        </p>
        <Link href="/explore">
          <Button size="lg" className="px-8">
            Continue Shopping
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <Link
          href="/products"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors mr-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <div className="hidden md:block">Continue Shopping</div>
        </Link>
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <span className="ml-3 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
          {groupedItems.length} {groupedItems.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Active Offers Banner */}
      {getActiveOffers().length > 0 && (
        <div className="mb-6">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <Sparkles className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">🎉 Active Offers Applied!</h3>
              </div>
              <div className="space-y-2">
                {getActiveOffers().map((offer, index) => (
                  <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 text-green-600 mr-2" />
                      <div>
                        <p className="font-medium text-sm">{offer?.appliedOffer?.title}</p>
                        <p className="text-xs text-muted-foreground">{offer?.appliedOffer?.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 font-semibold">
                      -₹{offer?.bestDiscount}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {hasOutOfStockItems && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>
                One or more items in your cart are out of stock. Please remove them to proceed with checkout.
              </AlertDescription>
            </Alert>
          )}
          {groupedItems.map((item, index) => (
            <Card 
              key={index} 
              className={`
                overflow-hidden border-muted/40 dark:bg-gray-900 transition-all duration-300
                ${item.stock === 0 ? "border-destructive border-2" : ""} 
                ${item.offerInfo?.hasOffer ? 
                  "ring-2 ring-green-400 border-green-300 bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg shadow-green-100/50 dark:shadow-green-900/20" : 
                  "hover:shadow-md"
                }
              `}
            >
              {/* Offer Banner at Top */}
              {item.offerInfo?.hasOffer && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                      <span className="text-sm font-semibold">
                        🎊 {item.offerInfo.appliedOffer.title} Applied!
                      </span>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold">
                      {item.offerInfo.appliedOffer.discountValue}% OFF
                    </Badge>
                  </div>
                </div>
              )}

              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-32 h-48 sm:h-auto bg-muted/20">
                    {/* Offer Glow Effect on Image */}
                    {item.offerInfo?.hasOffer && (
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 pointer-events-none"></div>
                    )}
                    
                    <Image
                      src={item.images[0] || `/placeholder.svg?height=200&width=200`}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Enhanced Offer Badge on Image */}
                    {item.offerInfo?.hasOffer && (
                      <div className="absolute top-2 left-2">
                        <div className="relative">
                          <Badge className="bg-gradient-to-r from-green-600 to-emerald-700 text-white text-xs px-3 py-1 font-bold shadow-lg animate-pulse">
                            🏷️ {item.offerInfo.appliedOffer.discountValue}% OFF
                          </Badge>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    )}

                    {/* Stock status overlay */}
                    {item.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-semibold text-xl ${item.offerInfo?.hasOffer ? 'text-green-900 dark:text-green-100' : ''}`}>
                            {item.name}
                            {item.offerInfo?.hasOffer && (
                              <Sparkles className="inline h-4 w-4 ml-1 text-green-600 animate-pulse" />
                            )}
                          </h3>
                          
                          {/* Enhanced offer applied indicator */}
                          {item.offerInfo?.hasOffer && (
                            <div className="flex items-center mt-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full w-fit">
                              <Tag className="h-3 w-3 text-green-600 mr-1" />
                              <span className="text-xs text-green-700 dark:text-green-300 font-semibold">
                                {item.offerInfo.appliedOffer.title} applied ✨
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Enhanced Price Display with Offer */}
                        <div className="text-right">
                          {item.offerInfo?.hasOffer ? (
                            <div>
                              <div className="text-sm text-muted-foreground line-through">
                                ₹{item.price.toFixed(2)}
                              </div>
                              <div className="font-bold text-lg text-green-600">
                                ₹{item.offerInfo.discountedPrice.toFixed(2)}
                              </div>
                              <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded font-semibold">
                                You save ₹{(item.price - item.offerInfo.discountedPrice).toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <p className="font-bold text-lg">₹{item.price.toFixed(2)}</p>
                          )}
                        </div>
                      </div>

                      {item.customization && (
                        <div className={`px-3 py-2 rounded-md ${item.offerInfo?.hasOffer ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-muted/20'}`}>
                          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                            Customization
                          </h4>
                          <p className="text-sm">{item.customization}</p>
                        </div>
                      )}
                      
                      {/* Enhanced Cost Breakdown */}
                      <div className={`mt-3 px-3 py-2 rounded-md ${item.offerInfo?.hasOffer ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-muted/10'}`}>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1 flex items-center">
                          Cost Breakdown
                          {item.offerInfo?.hasOffer && (
                            <Badge className="ml-2 bg-green-600 text-white text-xs px-2 py-0">
                              Offer Applied
                            </Badge>
                          )}
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Base Price</span>
                            <span>₹{item.basePrice.toFixed(2)}</span>
                          </div>

                          {/* Fields breakdown */}
                          {item.fields &&
                            Object.entries(item.fields).map(([category, field]) => (
                              <div key={`${category}-${field.key}`} className="flex justify-between">
                                <span>{field.key}</span>
                                <span>₹{field.value.toFixed(2)}</span>
                              </div>
                            ))}

                          {/* Counter items breakdown */}
                          {item.counterItems &&
                            Object.entries(item.counterItems).map(([name, details]) => (
                              <div key={name} className="flex justify-between">
                                <span>
                                  {name} × {details.count}
                                </span>
                                <span>₹{(details.cost * (details.count-details.default)).toFixed(2)}</span>
                              </div>
                            ))}

                          {/* Delivery charge if applicable */}
                          {item.recieveBy && item.recieveBy.charge > 0 && (
                            <div className="flex justify-between">
                              <span>{item.recieveBy.type}</span>
                              <span>₹{item.recieveBy.charge.toFixed(2)}</span>
                            </div>
                          )}

                          <div className="flex justify-between font-medium pt-1 border-t border-muted/30">
                            <span>Subtotal</span>
                            <span>₹{item.price.toFixed(2)}</span>
                          </div>

                          {/* Show discount if applicable */}
                          {item.offerInfo?.hasOffer && (
                            <>
                              <div className="flex justify-between text-green-600 font-medium">
                                <span className="flex items-center">
                                  <Tag className="h-3 w-3 mr-1" />
                                  Discount ({item.offerInfo.appliedOffer.discountValue}%)
                                </span>
                                <span>-₹{(item.price - item.offerInfo.discountedPrice).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-green-700 dark:text-green-300 pt-1 border-t border-green-200 dark:border-green-800">
                                <span>Final Price</span>
                                <span>₹{item.offerInfo.discountedPrice.toFixed(2)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {item.recieveBy && Object.keys(item.recieveBy).length > 0 ? (
                        <div className="max-w-xs">
                          <Badge variant="secondary" className="font-normal whitespace-normal text-xs">
                            {Object.values(item.recieveBy)[0]} {/* Will show "takeaway", "delivery", etc. */}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="font-normal whitespace-normal text-xs">
                          DELIVERY
                        </Badge>
                      )}
                      
                      {item.recieveBy && Object.keys(item.recieveBy).length > 0 && item.scheduledDateTime ? (
                        <div className="max-w-full">
                          <Badge variant="secondary" className="font-semibold whitespace-normal text-xs bg-green-400">
                            Pickup Slot - {item.scheduledDateTime.date} | Time {item.scheduledDateTime.timeSlot}
                          </Badge>
                        </div>
                      ) : (
                      null
                      )}
                      
                      <div className="flex items-center mt-2">
                        <Package className="h-4 w-4 text-muted-foreground mr-1.5" />
                        <span
                          className={`text-sm ${
                            item.stock === 0 
                            ? "text-destructive font-medium" 
                            : item.stock <= 3 
                              ? "text-amber-600 font-medium" 
                              : "text-muted-foreground"
                          }`}
                        >
                          {item.stock === 0 
                            ? "Out of stock" 
                            : item.stock <= 3 
                              ? `Only ${item.stock} left in stock!` 
                              : `${item.stock} in stock`
                          }
                        </span>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center mt-4">
                        <span className="text-sm text-muted-foreground mr-3">Quantity:</span>
                        <div className={`flex items-center border rounded-md ${item.offerInfo?.hasOffer ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : ''}`}>
                          <form action={decreaseQuantity.bind(null, cart.id, cart.cartItems, item, cart.address)}>
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              disabled={item.quantity <= 1 || item.stock === 0}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </form>

                          <span className={`px-3 font-semibold ${item.offerInfo?.hasOffer ? 'text-green-700 dark:text-green-300' : ''}`}>
                            {item.quantity}
                          </span>

                          <form action={increaseQuantity.bind(null, cart.id, cart.cartItems, item, cart.address)}>
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              disabled={item.quantity >= item.stock || item.stock === 0}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <form action={removeItem.bind(null, cart.id, cart.cartItems, item.id, cart.address)}>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="border-muted/40 overflow-hidden dark:bg-gray-900">
            <CardHeader className="bg-muted/10 pb-4">
              <CardTitle className="flex items-center">
                Order Summary
                {totalDiscount > 0 && (
                  <Badge className="ml-2 bg-green-600 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Offers Applied
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalCost.toFixed(2)}</span>
                </div>
                
                {/* Show discount breakdown if any offers applied */}
                {totalDiscount > 0 && (
                  <div className="space-y-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Applied Discounts
                    </h4>
                    {getActiveOffers().map((offer, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-green-700 dark:text-green-300 flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          {offer.appliedOffer.title}
                        </span>
                        <span className="text-green-700 dark:text-green-300 font-semibold">-₹{offer.bestDiscount.toFixed(2)}</span>
                      </div>
                    ))}
                    <Separator className="my-2 bg-green-200 dark:bg-green-800" />
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-green-800 dark:text-green-200">Total Savings</span>
                      <span className="text-green-800 dark:text-green-200">-₹{totalDiscount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                
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
                  <div className="text-right">
                    {totalDiscount > 0 && (
                      <div className="text-sm text-muted-foreground line-through">
                        ₹{(totalCost + taxAmount).toFixed(2)}
                      </div>
                    )}
                    <span className={totalDiscount > 0 ? 'text-green-600' : ''}>
                      ₹{totalWithTax.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {/* Enhanced total savings summary */}
                {totalDiscount > 0 && (
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-lg mt-3 border border-green-300 dark:border-green-700">
                    <div className="flex items-center justify-center text-green-700 dark:text-green-300">
                      <div className="flex items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-sm">
                        <Sparkles className="h-4 w-4 mr-2 text-green-600 animate-pulse" />
                        <span className="text-sm font-bold">🎉 You saved ₹{totalDiscount.toFixed(2)} on this order!</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/5 pt-6">
              {hasOutOfStockItems ? (
                <Button className="w-full py-6 text-sm" size="lg" disabled>
                  Checkout Unavailable - Remove Out of Stock Items
                </Button>
              ) : (
                <Link href={`/checkout/${userId}`}>
                  <Button className="w-full py-6 text-base" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}