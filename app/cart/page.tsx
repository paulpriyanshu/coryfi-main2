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
  const userData = await fetchUserId(session.user.email)
  
  const userId = userData.id
  const cart = await getCartsByUserId(userId)
  
  const ans = await applyBestOffer(
    cart?.cartItems?.map(item => ({
      productId: item.productId,
      price: item.price,
    }))
  )
  console.log("ans", JSON.stringify(ans, null, 2))

  const totalCost = cart?.totalCost
  const taxAmount = 0
  
  // Calculate total discount from all offers
  const totalDiscount = Object.values(ans).reduce((sum, offer) => sum + (offer.bestDiscount || 0), 0)
  const finalTotalAfterOffers = Object.values(ans).reduce((sum, offer) => sum + (offer.finalTotal || 0), 0)
  const totalWithTax = finalTotalAfterOffers + taxAmount

  // Group items by productId and count quantities
  const groupedItems = []

  if (cart?.cartItems) {
    for (const item of cart.cartItems) {
      const uniqueKey = `${item.id}-${JSON.stringify(item.customization)}`
      const existingItemIndex = groupedItems.findIndex((i) => i.uniqueKey === uniqueKey)

      if (existingItemIndex !== -1) {
        groupedItems[existingItemIndex].quantity += 1
      } else {
        // FIXED: Find which business page this item belongs to and attach offer info
        let itemOfferInfo = null
        
        // Debug: Log what we're looking for
        console.log(`Looking for productId ${item.productId} in offers:`, Object.keys(ans))
        
        for (const [businessPageId, offerData] of Object.entries(ans)) {
          console.log(`Checking business ${businessPageId}:`, {
            hasProductIds: !!offerData?.productIds,
            productIds: offerData?.productIds,
            appliedOffer: offerData?.appliedOffer,
            includesProduct: offerData?.productIds?.includes(item.productId)
          })
          
          if (offerData?.productIds?.includes(item.productId) && offerData?.appliedOffer) {
            const discountAmount = item.price * offerData.appliedOffer.discountValue / 100
            const discountedPrice = item.price - discountAmount
            
            itemOfferInfo = {
              businessPageId,
              appliedOffer: offerData.appliedOffer,
              hasOffer: true,
              discount: discountAmount,
              originalPrice: item.price,
              discountedPrice: discountedPrice
            }
            
            console.log(`✅ Found offer for product ${item.productId}:`, itemOfferInfo)
            break
          }
        }
        
        if (!itemOfferInfo) {
          console.log(`❌ No offer found for product ${item.productId}`)
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

  console.log("grouped items with offers", groupedItems.map(item => ({
    name: item.name,
    productId: item.productId,
    hasOffer: !!item.offerInfo?.hasOffer,
    offerDetails: item.offerInfo
  })))

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
        <Link href="/products">
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

      {/* Enhanced Active Offers Banner */}
      {getActiveOffers().length > 0 && (
        <div className="mb-6">
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800 shadow-lg shadow-green-100/50 dark:shadow-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-500 p-2 rounded-full mr-3">
                  <Sparkles className="h-5 w-5 text-white animate-pulse" />
                </div>
                <h3 className="font-bold text-green-800 dark:text-green-200 text-lg">🎉 Congratulations! Active Offers Applied!</h3>
              </div>
              <div className="space-y-3">
                {getActiveOffers().map((offer, index) => (
                  <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-green-200 dark:border-green-700">
                    <div className="flex items-center">
                      <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full mr-3">
                        <Percent className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-base">{offer?.appliedOffer?.title}</p>
                        <p className="text-sm text-muted-foreground">{offer?.appliedOffer?.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 font-bold text-sm px-3 py-1">
                        -{offer?.appliedOffer?.discountValue}%
                      </Badge>
                      <p className="text-green-600 font-bold mt-1">Save ₹{offer?.bestDiscount}</p>
                    </div>
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
                overflow-hidden transition-all duration-500 transform
                ${item.stock === 0 ? 
                  "border-destructive border-2 opacity-75" : 
                  ""
                } 
                ${item.offerInfo?.hasOffer ? 
                  "ring-4 ring-green-400/50 border-green-300 bg-gradient-to-br from-green-50/80 via-emerald-50/50 to-green-50/80 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-green-900/30 shadow-2xl shadow-green-200/50 dark:shadow-green-900/30 hover:shadow-3xl hover:ring-green-400/70 hover:scale-[1.02]" : 
                  "hover:shadow-lg border-muted/40 dark:bg-gray-900 hover:border-muted/60"
                }
              `}
            >
              {/* Enhanced Offer Banner at Top */}
              {item.offerInfo?.hasOffer && (
                <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white px-6 py-3 relative overflow-hidden">
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-pulse"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-white/20 p-1.5 rounded-full mr-3 animate-bounce">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-bold block">
                          🎊 {item.offerInfo.appliedOffer.title} Applied!
                        </span>
                        <span className="text-xs opacity-90">
                          {item.offerInfo.appliedOffer.description}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-white text-green-600 border-white/30 text-sm font-bold px-3 py-1 shadow-lg">
                        {item.offerInfo.appliedOffer.discountValue}% OFF
                      </Badge>
                      <p className="text-xs mt-1 opacity-90">Save ₹{item.offerInfo.discount.toFixed(2)}</p>
                    </div>
                  </div>
                  {/* Decorative corner elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
                </div>
              )}

              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-32 h-48 sm:h-auto bg-muted/20">
                    {/* Enhanced Offer Glow Effect on Image */}
                    {item.offerInfo?.hasOffer && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 pointer-events-none animate-pulse"></div>
                        <div className="absolute inset-0 border-4 border-green-400/50 rounded-lg"></div>
                      </>
                    )}
                    
                    <Image
                      src={item.images[0] || `/placeholder.svg?height=200&width=200`}
                      alt={item.name}
                      fill
                      className={`object-cover transition-all duration-500 ${item.offerInfo?.hasOffer ? 'brightness-110 saturate-110' : ''}`}
                    />
                    
                    {/* Enhanced Offer Badge on Image with Animation */}
                    {item.offerInfo?.hasOffer && (
                      <div className="absolute top-3 left-3">
                        <div className="relative animate-pulse">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1.5 font-bold shadow-xl border-2 border-white/50 animate-bounce">
                            🏷️ {item.offerInfo.appliedOffer.discountValue}% OFF
                          </Badge>
                          {/* Glowing dots around badge */}
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-400 rounded-full animate-ping delay-300"></div>
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
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-semibold text-xl transition-colors duration-300 ${item.offerInfo?.hasOffer ? 'text-green-900 dark:text-green-100' : ''}`}>
                            {item.name}
                            {item.offerInfo?.hasOffer && (
                              <div className="inline-flex items-center ml-2">
                                <Sparkles className="h-4 w-4 text-green-600 animate-spin" />
                                <div className="ml-1 w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                              </div>
                            )}
                          </h3>
                          
                          {/* Enhanced offer applied indicator */}
                          {item.offerInfo?.hasOffer && (
                            <div className="flex items-center mt-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 px-3 py-2 rounded-full w-fit shadow-md border border-green-200 dark:border-green-700">
                              <div className="bg-green-500 p-1 rounded-full mr-2 animate-pulse">
                                <Tag className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-sm text-green-800 dark:text-green-200 font-bold">
                                {item.offerInfo.appliedOffer.title} applied ✨
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Enhanced Price Display with Offer */}
                        <div className="text-right">
                          {item.offerInfo?.hasOffer ? (
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground line-through relative">
                                ₹{item.price.toFixed(2)}
                                <div className="absolute inset-0 bg-red-500/20 animate-pulse rounded"></div>
                              </div>
                              <div className="font-bold text-xl text-green-600 animate-pulse">
                                ₹{item.offerInfo.discountedPrice.toFixed(2)}
                              </div>
                              <div className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full font-bold shadow-sm border border-green-200 dark:border-green-700">
                                💰 You save ₹{(item.price - item.offerInfo.discountedPrice).toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <p className="font-bold text-lg">₹{item.price.toFixed(2)}</p>
                          )}
                        </div>
                      </div>

                      {item.customization && (
                        <div className={`px-4 py-3 rounded-lg transition-all duration-300 ${
                          item.offerInfo?.hasOffer ? 
                            'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-700 shadow-sm' : 
                            'bg-muted/20'
                        }`}>
                          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1 flex items-center">
                            <Package className="h-3 w-3 mr-1" />
                            Customization
                          </h4>
                          <p className="text-sm font-medium">{item.customization}</p>
                        </div>
                      )}
                      
                      {/* Enhanced Cost Breakdown */}
                      <div className={`mt-4 px-4 py-3 rounded-lg transition-all duration-300 ${
                        item.offerInfo?.hasOffer ? 
                          'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200 dark:border-green-700 shadow-lg' : 
                          'bg-muted/10'
                      }`}>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 flex items-center">
                          💼 Cost Breakdown
                          {item.offerInfo?.hasOffer && (
                            <Badge className="ml-2 bg-green-600 text-white text-xs px-2 py-1 animate-pulse">
                              Offer Applied
                            </Badge>
                          )}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Base Price</span>
                            <span className={item.offerInfo?.hasOffer ? 'font-semibold text-green-700 dark:text-green-300' : ''}>
                              ₹{item.basePrice.toFixed(2)}
                            </span>
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

                          <div className="flex justify-between font-medium pt-2 border-t border-muted/30">
                            <span>Subtotal</span>
                            <span>₹{item.price.toFixed(2)}</span>
                          </div>

                          {/* Enhanced discount display */}
                          {item.offerInfo?.hasOffer && (
                            <>
                              <div className="flex justify-between text-green-600 font-semibold bg-green-100/50 dark:bg-green-800/30 px-2 py-1 rounded">
                                <span className="flex items-center">
                                  <Tag className="h-3 w-3 mr-1 animate-spin" />
                                  Discount ({item.offerInfo.appliedOffer.discountValue}%)
                                </span>
                                <span>-₹{(item.price - item.offerInfo.discountedPrice).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-green-700 dark:text-green-300 pt-2 border-t-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                <span>🎉 Final Price</span>
                                <span className="text-lg">₹{item.offerInfo.discountedPrice.toFixed(2)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Delivery/Pickup info */}
                      {item.recieveBy && Object.keys(item.recieveBy).length > 0 ? (
                        <div className="max-w-xs">
                          <Badge variant="secondary" className={`font-normal whitespace-normal text-xs ${
                            item.offerInfo?.hasOffer ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : ''
                          }`}>
                            {Object.values(item.recieveBy)[0]}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="secondary" className={`font-normal whitespace-normal text-xs ${
                          item.offerInfo?.hasOffer ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : ''
                        }`}>
                          DELIVERY
                        </Badge>
                      )}
                      
                      {/* Scheduled pickup info */}
                      {item.recieveBy && Object.keys(item.recieveBy).length > 0 && item.scheduledDateTime && (
                        <div className="max-w-full">
                          <Badge variant="secondary" className={`font-semibold whitespace-normal text-xs ${
                            item.offerInfo?.hasOffer ? 'bg-green-400 text-white' : 'bg-green-400'
                          }`}>
                            Pickup Slot - {item.scheduledDateTime.date} | Time {item.scheduledDateTime.timeSlot}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Stock info */}
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

                      {/* Enhanced Quantity controls */}
                      <div className="flex items-center mt-4">
                        <span className="text-sm text-muted-foreground mr-3">Quantity:</span>
                        <div className={`flex items-center border-2 rounded-lg transition-all duration-300 ${
                          item.offerInfo?.hasOffer ? 
                            'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-md' : 
                            'border-muted'
                        }`}>
                          <form action={decreaseQuantity.bind(null, cart.id, cart.cartItems, item, cart.address)}>
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className={`h-9 px-3 transition-colors ${
                                item.offerInfo?.hasOffer ? 'hover:bg-green-100 dark:hover:bg-green-800' : ''
                              }`}
                              disabled={item.quantity <= 1 || item.stock === 0}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </form>

                          <span className={`px-4 font-bold text-lg ${
                            item.offerInfo?.hasOffer ? 'text-green-700 dark:text-green-300' : ''
                          }`}>
                            {item.quantity}
                          </span>

                          <form action={increaseQuantity.bind(null, cart.id, cart.cartItems, item, cart.address)}>
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className={`h-9 px-3 transition-colors ${
                                item.offerInfo?.hasOffer ? 'hover:bg-green-100 dark:hover:bg-green-800' : ''
                              }`}
                              disabled={item.quantity >= item.stock || item.stock === 0}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>

                    {/* Remove button */}
                    <div className="mt-6 flex justify-end">
                      <form action={removeItem.bind(null, cart.id, cart.cartItems, item.id, cart.address)}>
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
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

        {/* Order Summary - Enhanced */}
        <div className="space-y-6">
          <Card className={`border-muted/40 overflow-hidden dark:bg-gray-900 transition-all duration-300 ${
            totalDiscount > 0 ? 'ring-2 ring-green-400/50 border-green-300 shadow-xl' : ''
          }`}>
            <CardHeader className={`pb-4 ${
              totalDiscount > 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' : 'bg-muted/10'
            }`}>
              <CardTitle className="flex items-center text-lg">
                📊 Order Summary
                {totalDiscount > 0 && (
                  <Badge className="ml-3 bg-green-600 text-white animate-pulse">
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
                  <span className="font-semibold">₹{totalCost.toFixed(2)}</span>
                </div>
                
                {/* Enhanced discount breakdown */}
                {totalDiscount > 0 && (
                  <div className="space-y-3 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-green-900/30 p-4 rounded-xl border-2 border-green-200 dark:border-green-700 shadow-lg">
                    <h4 className="text-sm font-bold text-green-800 dark:text-green-200 flex items-center">
                      <div className="bg-green-500 p-1.5 rounded-full mr-2 animate-pulse">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      🎊 Applied Discounts
                    </h4>
                    {getActiveOffers().map((offer, index) => (
                      <div key={index} className="flex justify-between text-sm bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-green-200 dark:border-green-600">
                        <span className="text-green-700 dark:text-green-300 flex items-center font-medium">
                          <Tag className="h-3 w-3 mr-2 animate-spin" />
                          {offer.appliedOffer.title}
                        </span>
                        <span className="text-green-700 dark:text-green-300 font-bold">-₹{offer.bestDiscount.toFixed(2)}</span>
                      </div>
                    ))}
                    <Separator className="my-3 bg-green-300 dark:bg-green-700" />
                    <div className="flex justify-between text-sm font-bold bg-green-100 dark:bg-green-800/50 p-3 rounded-lg">
                      <span className="text-green-800 dark:text-green-200 flex items-center">
                        💰 Total Savings
                      </span>
                      <span className="text-green-800 dark:text-green-200 text-lg">-₹{totalDiscount.toFixed(2)}</span>
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
                <Separator className="my-3" />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <div className="text-right">
                    {totalDiscount > 0 && (
                      <div className="text-sm text-muted-foreground line-through mb-1">
                        ₹{(totalCost + taxAmount).toFixed(2)}
                      </div>
                    )}
                    <span className={`${totalDiscount > 0 ? 'text-green-600 text-2xl animate-pulse' : ''}`}>
                      ₹{totalWithTax.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {/* Enhanced total savings summary */}
                {totalDiscount > 0 && (
                  <div className="bg-gradient-to-r from-green-100 via-emerald-100 to-green-100 dark:from-green-900/40 dark:via-emerald-900/30 dark:to-green-900/40 p-5 rounded-xl mt-4 border-2 border-green-300 dark:border-green-600 shadow-lg relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-200/30 rounded-full translate-y-8 -translate-x-8"></div>
                    
                    <div className="relative flex items-center justify-center text-green-700 dark:text-green-300">
                      <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-3 rounded-full shadow-lg border-2 border-green-300 dark:border-green-600">
                        <div className="bg-green-500 p-2 rounded-full mr-3 animate-bounce">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold">🎉 Congratulations!</p>
                          <p className="text-lg font-bold">You saved ₹{totalDiscount.toFixed(2)} on this order!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className={`pt-6 ${
              totalDiscount > 0 ? 'bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10' : 'bg-muted/5'
            }`}>
              {hasOutOfStockItems ? (
                <Button className="w-full py-6 text-sm" size="lg" disabled>
                  Checkout Unavailable - Remove Out of Stock Items
                </Button>
              ) : (
                <Link href={`/checkout/${userId}`} className="w-full">
                  <Button className={`w-full py-6 text-base font-semibold transition-all duration-300 ${
                    totalDiscount > 0 ? 
                      'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl hover:shadow-2xl transform hover:scale-105' : 
                      ''
                  }`} size="lg">
                    {totalDiscount > 0 ? '🎊 ' : ''}Proceed to Checkout
                    {totalDiscount > 0 && (
                      <div className="ml-2 flex items-center">
                        <Sparkles className="h-4 w-4 animate-spin" />
                      </div>
                    )}
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