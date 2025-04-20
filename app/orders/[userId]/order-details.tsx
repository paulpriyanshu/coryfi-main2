"use client"
import { useState, useEffect } from "react"
import { Check, ChevronDown, ChevronRight, ChevronUp } from "lucide-react"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function Orderdetails({ orderData }) {
  // Initialize state with a default expanded order if available
  const [expandedOrders, setExpandedOrders] = useState(() => {
    if (orderData?.data?.[0]?.id) {
      return { [orderData.data[0].id]: false }
    }
    return {}
  })

  // Debug state changes
  useEffect(() => {
    console.log("Current expanded orders state:", expandedOrders)
  }, [expandedOrders])

  const toggleOrderExpansion = (orderId) => {
    console.log("Toggle called for order:", orderId)
    setExpandedOrders((prev) => {
      const newState = {
        ...prev,
        [orderId]: !prev[orderId],
      }
      console.log("New expanded state:", newState)
      return newState
    })
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Date formatting error:", error)
      return dateString || "Invalid date"
    }
  }

  // Error handling for missing data
  if (!orderData || !orderData.data || !Array.isArray(orderData.data)) {
    return <div className="p-4">No order data available</div>
  }

  if (orderData.data.length === 0) {
    return <div className="p-4">No orders found</div>
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">View and track your order history</p>
      </div>

      <div className="space-y-6">
        {orderData.data.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            {/* Separate div for click handling to avoid nested component issues */}
            <div
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation() // Prevent event bubbling
                console.log("Clicked on order:", order.id)
                toggleOrderExpansion(order.id)
              }}
            >
              <CardHeader className="bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        // Create a map of OTP to products
                        const otpGroups = {}
                        order.orderItems.forEach((item) => {
                          if (!otpGroups[item.OTP]) {
                            otpGroups[item.OTP] = []
                          }
                          otpGroups[item.OTP].push(item)
                        })

                        // Render each OTP group
                        return Object.entries(otpGroups).map(([otp, items], groupIdx) => (
                          <span key={otp} className="font-medium mr-2">
                            {groupIdx > 0 && " | "}
                            <span className="mr-1">
                              {items.map((item, itemIdx) => (
                                <span key={item.id}>
                                  {itemIdx > 0 && ", "}
                                  {item.product.name}
                                </span>
                              ))}
                            </span>
                            <Badge variant="outline" className="ml-1 text-xs bg-green-100">
                              OTP: {otp}
                            </Badge>
                          </span>
                        ))
                      })()}
                    </div>
                    <Badge variant="default" className="capitalize w-fit">
                      {order.order_id}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</div>
                      <div className="font-semibold text-lg">${order.totalCost.toFixed(2)}</div>
                    </div>
                    {expandedOrders[order.id] ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between sm:hidden mt-2">
                  <div className="text-sm">{formatDate(order.createdAt)}</div>
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  {(() => {
                    // Create a map of OTP to products
                    const otpGroups = {}
                    order.orderItems.forEach((item) => {
                      if (!otpGroups[item.OTP]) {
                        otpGroups[item.OTP] = []
                      }
                      otpGroups[item.OTP].push(item)
                    })

                    // Render each OTP group
                    return Object.entries(otpGroups).map(([otp, items]) => (
                      <div key={otp} className="flex flex-col items-center border rounded-md p-2 bg-muted/20">
                        <Badge variant="secondary" className="mb-2 bg-green-100">
                          OTP: {otp}
                        </Badge>
                        <div className="flex gap-1">
                          {items.slice(0, 3).map((item, idx) => (
                            <div
                              key={idx}
                              className="w-12 h-12 relative rounded-md overflow-hidden flex-shrink-0 bg-muted"
                            >
                              <Image
                                src={item.product.images[0] || "/placeholder.svg"}
                                alt={item.product.name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            </div>
                          ))}
                          {items.length > 3 && (
                            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-sm font-medium">
                              +{items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="text-xs mt-1 text-center max-w-[150px] truncate">
                          {items[0].product.business.name}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </CardHeader>
            </div>

            {expandedOrders[order.id] && (
              <>
                <CardContent className="pt-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>Order Items</span>
                            <Badge variant="outline" className="ml-2">
                              {order.orderItems.length} items
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {order.orderItems.map((item, index) => (
                            <div
                              key={index}
                              className={item.productFulfillmentStatus === "fulfilled" ? "bg-green-50 rounded-md" : ""}
                            >
                              <div className="flex gap-4 p-2">
                                <div className="w-20 h-20 relative rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                  <Image
                                    src={item.product.images[0] || "/placeholder.svg"}
                                    alt={item.product.name}
                                    width={80}
                                    height={80}
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <h3 className="font-medium capitalize">
                                      {item.product.name}
                                      {item.OTP && (
                                        <Badge variant="secondary" className="ml-2 bg-green-100">
                                          OTP: {item.OTP}
                                        </Badge>
                                      )}
                                      {item.productFulfillmentStatus === "fulfilled" && (
                                        <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                                          Received
                                        </Badge>
                                      )}
                                     
                                    </h3>
                                    <p className="font-medium">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="text-sm text-muted-foreground">Product ID: {item.product.id}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Business: {item.product.business.name}
                                  </p>
                                </div>
                              </div>
                              {index < order.orderItems.length - 1 && <Separator className="my-4" />}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Order ID</span>
                              <span className="font-mono">{order.order_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Date</span>
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <Separator />
                            <Separator className="my-2" />
                            <div className="flex justify-between font-medium text-lg">
                              <span>Total Cost</span>
                              <span>${order.totalCost.toFixed(2)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Order Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                <Check className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Order Placed</p>
                                <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                              </div>
                            </div>

                            <div className="w-0.5 h-6 bg-border ml-4"></div>

                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary">
                                <ChevronRight className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Processing</p>
                                <p className="text-sm text-muted-foreground">In progress</p>
                              </div>
                            </div>

                            <div className="w-0.5 h-6 bg-border ml-4"></div>

                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-muted border border-muted-foreground flex items-center justify-center opacity-50">
                                <ChevronRight className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Completed</p>
                                <p className="text-sm text-muted-foreground">Pending</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center pt-0 pb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleOrderExpansion(order.id)
                    }}
                    className="flex items-center gap-1"
                  >
                    <ChevronUp className="h-4 w-4" />
                    <span>Collapse</span>
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Orderdetails
