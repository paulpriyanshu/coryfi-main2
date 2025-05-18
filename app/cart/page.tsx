import { getCartsByUserId } from "@/app/api/business/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Trash2, ArrowLeft, Package, Plus, Minus, AlertTriangle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Define server actions in a separate file
import { decreaseQuantity, increaseQuantity, removeItem } from "./actions"
import { fetchUserId } from "../api/actions/media"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"

export default async function CartPage() {
  const session = await getServerSession(authOptions)
  const userData = await fetchUserId(session.user.email)
  // console.log("userData while checkout", userData)
  // Replace with actual user ID from your auth system
  const userId = userData.id
  const cart = await getCartsByUserId(userId)
  // console.log("cart details", JSON.stringify(cart, null, 3))

  // const userData=await fetchUserData(userId)

  const totalCost = cart?.totalCost
  const taxAmount = 0
  const totalWithTax = totalCost + taxAmount
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
        groupedItems.push({ ...item, quantity: 1, uniqueKey })
      }
    }
  }
  

  // Remove the uniqueKey before returning the grouped items
  const finalGroupedItems = groupedItems.map(({ uniqueKey, ...rest }) => rest)

  console.log("grouped items", groupedItems)

  // Check if any item in the cart has a stock of 0
  const hasOutOfStockItems = groupedItems.some(item => item.stock === 0)

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
            <Card key={index} className={`overflow-hidden border-muted/40 dark:bg-gray-900 ${item.stock === 0 ? "border-destructive border-2" : ""}`}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-32 h-48 sm:h-auto bg-muted/20">
                    <Image
                      src={item.images[0] || `/placeholder.svg?height=200&width=200`}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-xl">{item.name}</h3> 
                        <p className="font-bold text-lg">₹{item.price.toFixed(2)}</p>
                      </div>

                      {item.customization && (
                        <div className="bg-muted/20 px-3 py-2 rounded-md">
                          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                            Customization
                          </h4>
                          <p className="text-sm">{item.customization}</p>
                        </div>
                      )}
                      {/* Cost Breakdown */}
                      <div className="mt-3 bg-muted/10 px-3 py-2 rounded-md">
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                          Cost Breakdown
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
                          {/* {item.recieveBy && item.recieveBy.charge > 0 &&  (
                            <div className="flex justify-between">
                              <span>{item.recieveBy.type}</span>
                              <span>₹{item.recieveBy.charge.toFixed(2)}</span>
                            </div>
                          )} */}

                          <div className="flex justify-between font-medium pt-1 border-t border-muted/30">
                            <span>Item Total</span>
                            <span>₹{item.price.toFixed(2)}</span>
                          </div>
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
                        <div className="flex items-center border rounded-md">
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

                          <span className="px-3">{item.quantity}</span>

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
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
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

          {/* <Card className="border-muted/30 bg-muted/5">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex items-center justify-center rounded-full bg-primary/10">
                    <ShoppingBag className="h-4 w-4 text-primary" />
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
          </Card> */}
        </div>
      </div>
    </div>
  )
}