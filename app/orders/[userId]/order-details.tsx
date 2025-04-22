"use client"
import { useState, useEffect } from "react"
import { Check, ChevronDown, ChevronRight, ChevronUp } from "lucide-react"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// First, add a new import for the modal components at the top of the file
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Printer, Truck } from "lucide-react"

function Orderdetails({ orderData }) {
  // Initialize state with a default expanded order if available
  const [expandedOrders, setExpandedOrders] = useState(() => {
    if (orderData?.data?.[0]?.id) {
      return { [orderData.data[0].id]: false }
    }
    return {}
  })

  // Add a new state for the invoice modal
  const [selectedInvoice, setSelectedInvoice] = useState(null)

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

  // Add a new function to handle invoice viewing after the formatDate function
  const viewInvoice = (type, data) => {
    console.log("subtotal data check",data)
    setSelectedInvoice({ type, data })
  }

  // Update the calculateItemTotal function to be more explicit about including all charges
  const calculateItemTotal = (item) => {
    // const basePrice = item.details?.basePrice || 0
    // const deliveryCharge = item.details?.recieveBy?.charge || 0


    // The price already includes customizations as per the data structure
    // where details.price is the total product price including customizations
    return (item.details?.price) * item.quantity
  }

  // Add a new helper function after calculateItemTotal to show price breakdown
  const getPriceBreakdown = (item) => {
    const basePrice = item.details?.basePrice || 0
    const customizationCost = (item.details?.price || 0) - (item.details?.basePrice || 0)
    const deliveryCharge = item.details?.recieveBy?.charge || 0

    return {
      basePrice,
      customizationCost,
      deliveryCharge,
      total: (item.details?.price || 0) + deliveryCharge,
    }
  }

  // Add a function to group order items by business
  const groupItemsByBusiness = (items) => {
    console.log("grouped items",items)
    const businessGroups = {}

    items.forEach((item) => {
      const businessId = item.product.business.pageId // Use pageId as the unique identifier
      if (!businessGroups[businessId]) {
        businessGroups[businessId] = {
          businessName: item.product.business.name,
          businessId,
          pageId: item.product.business.pageId,
          items: [],
          total: 0,
          otps: new Set(), // Track unique OTPs
          deliveryTotal: 0,
        }
      }
      businessGroups[businessId].items.push(item)

      // Calculate total using the details.price and delivery charge
      const itemTotal = calculateItemTotal(item)
      businessGroups[businessId].total += itemTotal

      // Track delivery charges separately
      if (item.details?.recieveBy?.charge) {
        businessGroups[businessId].deliveryTotal += item.details.recieveBy.charge * item.quantity
      }

      businessGroups[businessId].otps.add(item.OTP)
    })

    // Convert Set to Array for easier rendering
    Object.values(businessGroups).forEach((group) => {
      group.otps = Array.from(group.otps)
    })

    return Object.values(businessGroups)
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
                      <div className="font-semibold text-lg">₹{order.totalCost.toFixed(2)}</div>
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
                                  {item.details?.customization && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Customization: {item.details.customization}
                                    </p>
                                  )}
                                  {item.details?.recieveBy && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                      <Truck className="h-3 w-3" />
                                      <span>
                                        {item.details.recieveBy.type}{" "}
                                        {item.details.recieveBy.charge > 0 &&
                                          `(+₹${item.details.recieveBy.charge.toFixed(2)})`}
                                      </span>
                                    </div>
                                  )}
                                  <div className="mt-3 border-t pt-3">
                                    <h4 className="font-medium text-sm uppercase text-muted-foreground mb-2">
                                      CUSTOMIZATION
                                    </h4>
                                    <p className="mb-3">{item.details?.customization || "Standard"}</p>

                                    <h4 className="font-medium text-sm uppercase text-muted-foreground mb-2">
                                      COST BREAKDOWN
                                    </h4>
                                    <div className="space-y-1">
                                      <div className="flex justify-between">
                                        <span>Base Price</span>
                                        <span>₹{item.details?.basePrice?.toFixed(2) || "0.00"}</span>
                                      </div>

                                   {item.details?.customization &&
                                  item.details.customization.split(",").map((custom, i) => {
                                    const trimmed = custom.trim()
                                    let name = ""
                                    let quantity = 1
                                    let cost = 0

                                    // Handle "key: value" or just "key"
                                    if (trimmed.includes(":")) {
                                      const [rawName, rawValue] = trimmed.split(":")
                                      name = rawName.trim()
                                      quantity = parseInt(rawValue.trim(), 10) || 1
                                    } else {
                                      name = trimmed
                                    }

                                    // Check in counterItems
                                    if (item.details.counterItems && item.details.counterItems[name]) {
                                      const { cost: itemCost, count, default: defaultCount } = item.details.counterItems[name]
                                      const extraCount = quantity - defaultCount
                                      cost = extraCount > 0 ? extraCount * itemCost : 0
                                    }

                                    // Check in fields
                                    else if (
                                      item.details.fields &&
                                      Object.values(item.details.fields).some(f => f.key === name)
                                    ) {
                                      const matchedField = Object.values(item.details.fields).find(f => f.key === name)
                                      cost = matchedField?.value || 0
                                    }

                                    return (
                                      <div key={i} className="flex justify-between">
                                        <span>{name} × {quantity}:</span>
                                        <span>₹{cost.toFixed(2)}</span>
                                      </div>
                                    )
                                  })}

                                      {item.details?.recieveBy?.charge > 0 && (
                                        <div className="flex justify-between">
                                          <span className="uppercase">DELIVERY</span>
                                          <span>₹{item.details.recieveBy.charge.toFixed(2)}</span>
                                        </div>
                                      )}

                                      <div className="flex justify-between font-medium pt-1 border-t mt-1">
                                        <span>Item Total</span>
                                        <span className="text-lg">
                                          ₹
                                          {(
                                            (item.details?.price || 0)
                                          ).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2">
                                      <Badge variant="outline" className="bg-muted/50">
                                        {item.details?.recieveBy?.type || "PICKUP"}
                                      </Badge>
                                      {item.details?.stock !== undefined && (
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-package"
                                          >
                                            <path d="m7.5 4.27 9 5.15" />
                                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                            <path d="m3.3 7 8.7 5 8.7-5" />
                                            <path d="M12 22V12" />
                                          </svg>
                                          {item.details.stock} in stock
                                        </div>
                                      )}
                                    </div>

                                    <div className="mt-3 flex items-center gap-2">
                                      <div className="flex items-center border rounded-md">
                                        <button className="px-3 py-1 text-lg" disabled>
                                          −
                                        </button>
                                        <span className="px-3 py-1">{item.quantity}</span>
                                        <button className="px-3 py-1 text-lg" disabled>
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  </div>
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
                              <span>₹{order.totalCost.toFixed(2)}</span>
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
                      <Card>
                        <CardHeader>
                          <CardTitle>Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {groupItemsByBusiness(order.orderItems).map((group) => (
                              <div key={group.businessId} className="border rounded-md p-3 bg-muted/10">
                                <div className="flex justify-between items-center mb-2">
                                  <div>
                                    <p className="font-medium">{group.businessName}</p>
                                    <p className="text-sm text-muted-foreground">{group.items.length} item(s)</p>
                                    {group.otps.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {group.otps.map((otp) => (
                                          <Badge key={otp} variant="outline" className="text-xs bg-green-50">
                                            OTP: {otp}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      viewInvoice("business", { order, businessGroup: group })
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <FileText className="h-4 w-4" />
                                    <span>View Invoice</span>
                                  </Button>
                                </div>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  {group.items.slice(0, 3).map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="w-10 h-10 relative rounded-md overflow-hidden flex-shrink-0 bg-muted"
                                    >
                                      <Image
                                        src={item.product.images[0] || "/placeholder.svg"}
                                        alt={item.product.name}
                                        width={40}
                                        height={40}
                                        className="object-cover"
                                      />
                                    </div>
                                  ))}
                                  {group.items.length > 3 && (
                                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xs font-medium">
                                      +{group.items.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div className="flex justify-between items-center pt-2 border-t mt-4">
                              <div>
                                <p className="font-medium">Complete Order Invoice</p>
                                <p className="text-sm text-muted-foreground">All items from all businesses</p>
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  viewInvoice("complete", { order })
                                }}
                                className="flex items-center gap-1"
                              >
                                <FileText className="h-4 w-4" />
                                <span>View Full Invoice</span>
                              </Button>
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
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedInvoice.type === "business"
                  ? `Invoice - ${selectedInvoice.data.businessGroup.businessName}`
                  : "Complete Order Invoice"}
              </DialogTitle>
              <DialogDescription>
                Order #{selectedInvoice.data.order.order_id} - {formatDate(selectedInvoice.data.order.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 my-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Invoice Details</h3>
                  <p className="text-sm text-muted-foreground">Order ID: {selectedInvoice.data.order.order_id}</p>
                  <p className="text-sm text-muted-foreground">
                    Date: {formatDate(selectedInvoice.data.order.createdAt)}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                  <span>Print Invoice</span>
                </Button>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2">Item</th>
                        <th className="text-center p-2">Quantity</th>
                        <th className="text-center p-2">OTP</th>
                        <th className="text-center p-2">Price</th>
                        <th className="text-right p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.type === "business"
                        ? selectedInvoice.data.businessGroup.items.map((item, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 relative rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                    <Image
                                      src={item.product.images[0] || "/placeholder.svg"}
                                      alt={item.product.name}
                                      width={40}
                                      height={40}
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-xs text-muted-foreground">ID: {item.product.id}</p>
                                    {item.details?.customization && (
                                      <p className="text-xs text-muted-foreground">
                                        Customization: {item.details.customization}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-2 text-center">{item.quantity}</td>
                              <td className="p-2 text-center">
                                <Badge variant="outline" className="text-xs bg-green-50">
                                  {item.OTP}
                                </Badge>
                              </td>
                              <td className="p-2">
                                <div className="border rounded-md p-2 bg-muted/10 space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Base Price:</span>
                                    <span>₹{item.details?.basePrice?.toFixed(2) || "0.00"}</span>
                                  </div>

                                  {item.details?.customization &&
                                  item.details.customization.split(",").map((custom, i) => {
                                    const trimmed = custom.trim()
                                    let name = ""
                                    let quantity = 1
                                    let cost = 0

                                    // Handle "key: value" or just "key"
                                    if (trimmed.includes(":")) {
                                      const [rawName, rawValue] = trimmed.split(":")
                                      name = rawName.trim()
                                      quantity = parseInt(rawValue.trim(), 10) || 1
                                    } else {
                                      name = trimmed
                                    }

                                    // Check in counterItems
                                    if (item.details.counterItems && item.details.counterItems[name]) {
                                      const { cost: itemCost, count, default: defaultCount } = item.details.counterItems[name]
                                      const extraCount = quantity - defaultCount
                                      cost = extraCount > 0 ? extraCount * itemCost : 0
                                    }

                                    // Check in fields
                                    else if (
                                      item.details.fields &&
                                      Object.values(item.details.fields).some(f => f.key === name)
                                    ) {
                                      const matchedField = Object.values(item.details.fields).find(f => f.key === name)
                                      cost = matchedField?.value || 0
                                    }

                                    return (
                                      <div key={i} className="flex justify-between">
                                        <span>{name} × {quantity}:</span>
                                        <span>₹{cost.toFixed(2)}</span>
                                      </div>
                                    )
                                  })}

                                  {item.details?.recieveBy?.charge > 0 && (
                                    <div className="flex justify-between">
                                      <span>DELIVERY:</span>
                                      <span>₹{item.details.recieveBy.charge.toFixed(2)}</span>
                                    </div>
                                  )}

                                  <div className="flex justify-between font-medium pt-1 border-t">
                                    <span>Total:</span>
                                    <span>
                                      ₹
                                      {((item.details?.price || 0)).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-2 text-right">₹{calculateItemTotal(item).toFixed(2)}</td>
                            </tr>
                          ))
                        : selectedInvoice.data.order.orderItems.map((item, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 relative rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                    <Image
                                      src={item.product.images[0] || "/placeholder.svg"}
                                      alt={item.product.name}
                                      width={40}
                                      height={40}
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.product.business.name}</p>
                                    {item.details?.customization && (
                                      <p className="text-xs text-muted-foreground">
                                        Customization: {item.details.customization}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-2 text-center">{item.quantity}</td>
                              <td className="p-2 text-center">
                                <Badge variant="outline" className="text-xs bg-green-50">
                                  {item.OTP}
                                </Badge>
                              </td>
                              <td className="p-2">
                                <div className="border rounded-md p-2 bg-muted/10 space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Base Price:</span>
                                    <span>₹{item.details?.basePrice?.toFixed(2) || "0.00"}</span>
                                  </div>

                                  {item.details?.customization &&
                                    item.details.customization.split(",").map((custom, i) => {
                                      const parts = custom.trim().split(":")
                                      if (parts.length === 2) {
                                        const [name, value] = parts
                                        // Simplified calculation for custom item costs
                                        const customCost =
                                          i === 0
                                            ? ((item.details.price - item.details.basePrice) / parts.length).toFixed(2)
                                            : ((item.details.price - item.details.basePrice) / parts.length).toFixed(2)

                                        return (
                                          <div key={i} className="flex justify-between">
                                            <span>
                                              {name.trim()} × {value.trim()}:
                                            </span>
                                            <span>₹{customCost}</span>
                                          </div>
                                        )
                                      }
                                      return null
                                    })}

                                  {item.details?.recieveBy?.charge > 0 && (
                                    <div className="flex justify-between">
                                      <span>DELIVERY:</span>
                                      <span>₹{item.details.recieveBy.charge.toFixed(2)}</span>
                                    </div>
                                  )}

                                  <div className="flex justify-between font-medium pt-1 border-t">
                                    <span>Total:</span>
                                    <span>
                                      ₹
                                      {((item.details?.price || 0)).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-2 text-right">₹{calculateItemTotal(item).toFixed(2)}</td>
                            </tr>
                          ))}
                    </tbody>
                    <tfoot className="bg-muted/30">
                      {selectedInvoice.type === "business" && (
                        <>
                          <tr className="border-t">
                            <td colSpan={4} className="p-2 text-right">
                              Subtotal:
                            </td>
                            <td className="p-2 text-right">
                              ₹
                              {(
                                selectedInvoice.data.businessGroup.total -
                                selectedInvoice.data.businessGroup.deliveryTotal
                              ).toFixed(2)}
                            </td>
                          </tr>
                          {selectedInvoice.data.businessGroup.deliveryTotal > 0 && (
                            <tr>
                              <td colSpan={4} className="p-2 text-right">
                                Delivery Charges:
                              </td>
                              <td className="p-2 text-right">
                                ₹{selectedInvoice.data.businessGroup.deliveryTotal.toFixed(2)}
                              </td>
                            </tr>
                          )}
                          <tr className="border-t">
                            <td colSpan={4} className="p-2 text-right font-medium">
                              Total:
                            </td>
                            <td className="p-2 text-right font-medium">
                              ₹{selectedInvoice.data.businessGroup.total.toFixed(2)}
                            </td>
                          </tr>
                        </>
                      )}

                      {selectedInvoice.type === "complete" && (
                        <>
                          <tr className="border-t">
                            <td colSpan={4} className="p-2 text-right">
                              Subtotal:
                            </td>
                            <td className="p-2 text-right">
                              ₹
                              {selectedInvoice.data.order.orderItems
                                .reduce((total, item) => {
                                  return total + (item.details?.price || 0) * item.quantity
                                }, 0)
                                .toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="p-2 text-right">
                              Delivery Charges:
                            </td>
                            <td className="p-2 text-right">
                              ₹
                              {selectedInvoice.data.order.orderItems
                                .reduce((total, item) => {
                                  return total + (item.details?.recieveBy?.charge || 0) * item.quantity
                                }, 0)
                                .toFixed(2)}
                            </td>
                          </tr>
                          <tr className="border-t">
                            <td colSpan={4} className="p-2 text-right font-bold">
                              Total:
                            </td>
                            <td className="p-2 text-right font-bold">
                              ₹{selectedInvoice.data.order.totalCost.toFixed(2)}
                            </td>
                          </tr>
                        </>
                      )}
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedInvoice.type === "business" && (
                <div className="bg-muted/20 p-4 rounded-md">
                  <p className="text-sm font-medium mb-2">Business Invoice</p>
                  <p className="text-sm text-muted-foreground">
                    This is a partial invoice for items from {selectedInvoice.data.businessGroup.businessName} only.
                  </p>
                  {selectedInvoice.data.businessGroup.otps && selectedInvoice.data.businessGroup.otps.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">OTP Codes:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedInvoice.data.businessGroup.otps.map((otp) => (
                          <Badge key={otp} variant="outline" className="text-xs bg-green-50">
                            {otp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedInvoice.data.businessGroup.items.some((item) => item.details?.customization) && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Customizations:</p>
                      <ul className="mt-1 text-xs text-muted-foreground">
                        {selectedInvoice.data.businessGroup.items.map(
                          (item, idx) =>
                            item.details?.customization && (
                              <li key={idx} className="ml-2">
                                {item.product.name}: {item.details.customization}
                              </li>
                            ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {selectedInvoice.type === "complete" && (
                <div className="bg-muted/20 p-4 rounded-md">
                  <p className="text-sm font-medium">Order Summary</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Total Items:</span>{" "}
                      {selectedInvoice.data.order.orderItems.length}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Businesses:</span>{" "}
                      {groupItemsByBusiness(selectedInvoice.data.order.orderItems).length}
                    </p>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Business Breakdown:</p>
                      <div className="space-y-1 mt-1">
                        {groupItemsByBusiness(selectedInvoice.data.order.orderItems).map((group) => (
                          <div key={group.pageId} className="text-sm flex justify-between">
                            <span>{group.businessName}</span>
                            <span>{group.items.length} item(s)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Delivery Methods:</p>
                      <div className="space-y-1 mt-1">
                        {selectedInvoice.data.order.orderItems.map(
                          (item, idx) =>
                            item.details?.recieveBy && (
                              <div key={idx} className="text-xs flex items-center gap-1">
                                <Truck className="h-3 w-3" />
                                <span>
                                  {item.product.name}: {item.details.recieveBy.type} (+₹
                                  {item.details.recieveBy.charge.toFixed(2)})
                                </span>
                              </div>
                            ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default Orderdetails
