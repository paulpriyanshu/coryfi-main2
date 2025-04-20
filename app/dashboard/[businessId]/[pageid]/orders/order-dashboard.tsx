"use client"

import { useState, useEffect } from "react"
import { Download, Search, ShoppingBag, Package, User, ChevronDown, ChevronUp, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { OrderDetailsModal } from "./order-details-modal"
import { AssignTaskModal } from "./assign-task-modal"
import { OtpVerificationModal } from "./otp-verification-modal"
import { OutForDeliveryModal } from "./out-for-delivery-modal"
import { getEmployeesByBusiness, assignTaskToEmployee } from "@/app/api/actions/employees"
import { Toaster } from "react-hot-toast"
import { fulfillNonDliveryItem } from "@/app/settings/tasks/delivery"
import { MarkOutForDelivery } from "@/app/api/business/order/order"

// Custom Badge variants
const BadgeWithVariants = ({ variant, ...props }) => {
  if (variant === "success") {
    return <Badge {...props} />
  }
  return <Badge variant={variant} {...props} />
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Truncate long strings
const truncate = (str, n) => {
  return str?.length > n ? str.substr(0, n - 1) + "..." : str
}

export default function OrdersDashboard({ ordersData, pageId, businessId }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("newest")
  const [expandedOrders, setExpandedOrders] = useState({})
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false)
  const [selectedOrderForTask, setSelectedOrderForTask] = useState(null)

  // New state for OTP verification
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [selectedOrderItem, setSelectedOrderItem] = useState(null)
  const [selectedOrderForOtp, setSelectedOrderForOtp] = useState(null)

  // New state for Out for Delivery confirmation modal
  const [isOutForDeliveryModalOpen, setIsOutForDeliveryModalOpen] = useState(false)
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null)

  // State to track orders data
  const [processedOrders, setProcessedOrders] = useState([])

  // Initialize processed orders
  useEffect(() => {
    const orders = ordersData?.data || []
    // Add fulfillment status if not present
    const processed = orders.map((order) => ({
      ...order,
      fulfillmentStatus: order.fulfillmentStatus || "pending",
    }))
    setProcessedOrders(processed)
  }, [ordersData])

  const handleOpenAssignTaskModal = (order) => {
    setSelectedOrderForTask(order)
    setIsAssignTaskModalOpen(true)
  }

  // Toggle expanded state for an order
  const toggleOrderExpanded = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

  // Sort orders based on selected option
  const sortedOrders = [...processedOrders].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt)
    } else if (sortOrder === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt)
    } else if (sortOrder === "highest") {
      return b.totalCost - a.totalCost
    } else if (sortOrder === "lowest") {
      return a.totalCost - b.totalCost
    }
    return 0
  })

  // Filter orders based on search term
  const filteredOrders = sortedOrders.filter(
    (order) =>
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(order.userId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderItems.some(
        (item) =>
          item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.product.businessPageId.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  )

  // Get counts for the statistics cards
  const totalOrders = processedOrders.length
  const totalRevenue = filteredOrders.reduce((sum, order) => {
    // Sum up all product prices in this order
    const orderTotal = order.orderItems.reduce((itemSum, item) => {
      // Use the price from details if available
      const productPrice = item.details?.price || 0
      return itemSum + productPrice * item.quantity
    }, 0)
    return sum + orderTotal
  }, 0)
  const totalItems = processedOrders.reduce(
    (sum, order) => sum + order.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  )
  const uniqueCustomers = new Set(processedOrders.map((order) => order.userId)).size

  // Group orders by business page
  const businessPages = {}
  processedOrders.forEach((order) => {
    order.orderItems.forEach((item) => {
      const pageId = item.product.businessPageId
      if (!businessPages[pageId]) {
        businessPages[pageId] = {
          id: pageId,
          orderCount: 0,
          revenue: 0,
          products: new Set(),
        }
      }
      businessPages[pageId].orderCount++
      businessPages[pageId].revenue += order.totalCost / order.orderItems.length
      businessPages[pageId].products.add(item.product.id)
    })
  })

  // Handle OTP verification for grouped items
  const handleOpenOtpModal = (order, item) => {
    setSelectedOrderForOtp(order)
    setSelectedOrderItem({
      ...item,
      isGrouped: !!item.originalItemIds, // Flag to indicate if this is a grouped item
    })
    setIsOtpModalOpen(true)
  }

  // Handle Out for Delivery for grouped items
  const handleOpenOutForDeliveryModal = (order, item) => {
    // Check if this is a grouped item with multiple original IDs
    const itemIds = item.originalItemIds || [item.id]

    setSelectedOrderForDelivery({
      order_id: order.order_id,
      orderItemsId: itemIds, // Now this is an array of IDs
      userId: order.userId,
      createdAt: order.createdAt,
      totalCost: order.totalCost,
      product: {
        name: item.product.name,
        quantity: item.quantity,
        customization: item.customization,
      },
      orderId: order.id,
      productId: item.product.id,
      isGrouped: !!item.originalItemIds, // Flag to indicate if this is a grouped item
    })
    setIsOutForDeliveryModalOpen(true)
  }

  // Verify OTP and mark items as fulfilled
  const verifyOtp = async (otp) => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        console.log("product otp", selectedOrderItem)
        console.log("product id", selectedOrderItem?.id)
        const isValid = otp === selectedOrderItem.OTP
        console.log("isValid", isValid)

        if (isValid && selectedOrderForOtp && selectedOrderItem) {
          const updatedOrders = [...processedOrders]
          const orderIndex = updatedOrders.findIndex((o) => o.id === selectedOrderForOtp.id)

          if (orderIndex >= 0) {
            // If this is a grouped item, update all the original items
            if (selectedOrderItem.isGrouped && selectedOrderItem.originalItemIds) {
              // Process each original item ID
              for (const itemId of selectedOrderItem.originalItemIds) {
                // Find the original item in the order
                const originalItemIndex = updatedOrders[orderIndex].orderItems.findIndex((i) => i.id === itemId)

                if (originalItemIndex >= 0) {
                  // Call API to fulfill this item
                  await fulfillNonDliveryItem(Number.parseInt(itemId))
                  // Update the item status
                  updatedOrders[orderIndex].orderItems[originalItemIndex].productFulfillmentStatus = "fulfilled"
                }
              }
            } else {
              // Handle single item as before
              const itemIndex = updatedOrders[orderIndex].orderItems.findIndex(
                (i) => i.product.id === selectedOrderItem.product.id,
              )

              if (itemIndex >= 0) {
                await fulfillNonDliveryItem(Number.parseInt(selectedOrderItem?.id))
                updatedOrders[orderIndex].orderItems[itemIndex].productFulfillmentStatus = "fulfilled"
              }
            }

            setProcessedOrders(updatedOrders)
          }
        }

        resolve(isValid)
      }, 1000)
    })
  }

  // Mark items as out for delivery
  const markAsOutForDelivery = async () => {
    if (selectedOrderForDelivery) {
      try {
        const updatedOrders = [...processedOrders]
        const orderIndex = updatedOrders.findIndex((o) => o.id === selectedOrderForDelivery.orderId)

        if (orderIndex >= 0) {
          // If this is a grouped item with multiple IDs
          if (selectedOrderForDelivery.isGrouped && Array.isArray(selectedOrderForDelivery.orderItemsId)) {
            // Process each item ID in the group
            for (const itemId of selectedOrderForDelivery.orderItemsId) {
              // Find the original item in the order
              const originalItemIndex = updatedOrders[orderIndex].orderItems.findIndex((i) => i.id === itemId)

              if (originalItemIndex >= 0) {
                // Call API to mark this item as out for delivery
                const markedAsDelivered = await MarkOutForDelivery(itemId)
                if (markedAsDelivered) {
                  updatedOrders[orderIndex].orderItems[originalItemIndex].outForDelivery = "TRUE"
                } else {
                  console.error(`Error marking item ${itemId} as out for delivery`)
                }
              }
            }
          } else {
            // Handle single item as before
            const itemId = selectedOrderForDelivery.orderItemsId
            const itemIndex = updatedOrders[orderIndex].orderItems.findIndex(
              (i) => i.product.id === selectedOrderForDelivery.productId,
            )

            if (itemIndex >= 0) {
              const markedAsDelivered = await MarkOutForDelivery(itemId)
              if (markedAsDelivered) {
                updatedOrders[orderIndex].orderItems[itemIndex].outForDelivery = "TRUE"
              } else {
                console.error("Error from backend")
              }
            }
          }

          setProcessedOrders(updatedOrders)
        }

        setIsOutForDeliveryModalOpen(false)
      } catch (error) {
        console.error("Error marking as out for delivery:", error)
      }
    }
  }

  return (
    <div className="container py-6 space-y-8">
      {/* React Hot Toast container */}
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and analyze your orders across all business pages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {processedOrders.length > 0 && `Last order ${formatDate(processedOrders[0].createdAt)}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Items sold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground">Distinct buyers</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden sm:rounded-lg sm:border sm:shadow-sm rounded-none border-0 shadow-none sm:mx-0 ">
        <CardHeader>
          <CardTitle>Business Pages Performance</CardTitle>
          <CardDescription>Order distribution across your business pages</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">Business Page ID</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Products</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(businessPages).map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium hidden md:table-cell">{truncate(page.id, 20)}</TableCell>
                  <TableCell>{page.orderCount}</TableCell>
                  <TableCell>${page.revenue.toFixed(2)}</TableCell>
                  <TableCell>{page.products.size}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="min-w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="hidden">All Orders</CardTitle>
            <CardTitle className="text-sm">Orders</CardTitle>
            <CardDescription className="hidden md:block">Detailed view of all orders in the system</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="w-[100px] md:w-[200px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[100px] md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="highest">Highest value</SelectItem>
                <SelectItem value="lowest">Lowest value</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          {filteredOrders.length > 0 ? (
            <div className="rounded-md border sm:rounded-md sm:border  sm:mx-0 -mx-4">
              {filteredOrders.map((order) => (
                <Collapsible
                  key={order.id}
                  open={expandedOrders[order.id]}
                  onOpenChange={() => toggleOrderExpanded(order.id)}
                  className={`border-b last:border-b-0 ${
                    order.orderItems.every((item) => item.productFulfillmentStatus === "fulfilled")
                      ? "border-4 border-green-500 bg-green-200"
                      : ""
                  }`}
                >
                  <div
                    className="flex items-center p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleOrderExpanded(order.id)}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 flex-1">
                      <div>
                        <p className="text-sm font-medium">Order ID</p>
                        <p className="text-sm text-muted-foreground">
                          {expandedOrders[order.id] ? order.order_id : truncate(order.order_id, 8)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Customer</p>
                        <p className="text-sm text-muted-foreground">User #{order.userId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Items</p>
                        <p className="text-sm text-muted-foreground">
                          {(() => {
                            // Count unique products after grouping identical items
                            const uniqueProducts = new Set()
                            order.orderItems.forEach((item) => {
                              // Create a unique identifier for each distinct product configuration
                              const productKey = `${item.product.id}-${item.customization || ""}-${item.details?.price || ""}-${item.recieveBy?.type || ""}-${item.details?.scheduledDateTime?.date || ""}-${item.details?.scheduledDateTime?.timeSlot || ""}-${item.productFulfillmentStatus || ""}-${item.outForDelivery || ""}`
                              uniqueProducts.add(productKey)
                            })
                            return uniqueProducts.size
                          })()} unique products
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Total</p>
                        <p className="text-sm text-muted-foreground">
                          $
                          {order.orderItems
                            .reduce((sum, item) => {
                              const productPrice = item.details?.price || 0
                              return sum + productPrice * item.quantity
                            }, 0)
                            .toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Fulfillment</p>
                        <div>
                          {order.orderItems.every((item) => item.productFulfillmentStatus === "fulfilled") ? (
                            <BadgeWithVariants
                              variant="success"
                              className="bg-green-100 text-green-800 hover:bg-green-200"
                            >
                              Fulfilled
                            </BadgeWithVariants>
                          ) : (
                            <BadgeWithVariants variant="outline">Pending</BadgeWithVariants>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      {expandedOrders[order.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <CollapsibleContent>
                    <div className="p-4 pt-0 bg-muted/20">
                      <div className="rounded-md border bg-background">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product ID</TableHead>
                              <TableHead>Product Name</TableHead>
                              <TableHead>Business Page</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Customization</TableHead>
                              <TableHead>Recieve By</TableHead>
                              <TableHead>Slot</TableHead>
                              <TableHead>Employee</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              // Group identical items
                              const groupedItems = []
                              order.orderItems.forEach((item) => {
                                // Find if we already have an identical item
                                const existingItemIndex = groupedItems.findIndex((groupedItem) => {
                                  // Check if product ID is the same
                                  if (groupedItem.product.id !== item.product.id) return false

                                  // Check if all other attributes are identical
                                  const sameCustomization = groupedItem.customization === item.customization
                                  const sameBusinessPage =
                                    groupedItem.product.businessPageId === item.product.businessPageId
                                  const samePrice = groupedItem.details?.price === item.details?.price

                                  // Check if recieveBy is identical
                                  let sameReceiveBy = false
                                  if (
                                    (!groupedItem.recieveBy && !item.recieveBy) ||
                                    (groupedItem.recieveBy &&
                                      item.recieveBy &&
                                      groupedItem.recieveBy.type === item.recieveBy.type)
                                  ) {
                                    sameReceiveBy = true
                                  }

                                  // Check if scheduledDateTime is identical
                                  let sameSchedule = false
                                  if (
                                    (!groupedItem.details?.scheduledDateTime && !item.details?.scheduledDateTime) ||
                                    (groupedItem.details?.scheduledDateTime &&
                                      item.details?.scheduledDateTime &&
                                      groupedItem.details.scheduledDateTime.date ===
                                        item.details.scheduledDateTime.date &&
                                      groupedItem.details.scheduledDateTime.timeSlot ===
                                        item.details.scheduledDateTime.timeSlot)
                                  ) {
                                    sameSchedule = true
                                  }

                                  // Check if fulfillment status is the same
                                  const sameFulfillmentStatus =
                                    groupedItem.productFulfillmentStatus === item.productFulfillmentStatus
                                  const sameOutForDelivery = groupedItem.outForDelivery === item.outForDelivery

                                  // Return true only if ALL attributes are identical
                                  return (
                                    sameCustomization &&
                                    sameBusinessPage &&
                                    samePrice &&
                                    sameReceiveBy &&
                                    sameSchedule &&
                                    sameFulfillmentStatus &&
                                    sameOutForDelivery
                                  )
                                })

                                if (existingItemIndex >= 0) {
                                  // If identical item exists, increase its quantity
                                  groupedItems[existingItemIndex].quantity += item.quantity
                                  // Store original item ID in an array for reference (useful for actions)
                                  if (!groupedItems[existingItemIndex].originalItemIds) {
                                    groupedItems[existingItemIndex].originalItemIds = [
                                      groupedItems[existingItemIndex].id,
                                    ]
                                  }
                                  groupedItems[existingItemIndex].originalItemIds.push(item.id)
                                } else {
                                  // Otherwise add as a new item
                                  groupedItems.push({ ...item })
                                }
                              })

                              return groupedItems.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{item.product.id}</TableCell>
                                  <TableCell>{item.product.name}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <BadgeWithVariants variant="outline" className="font-mono text-xs">
                                        {truncate(item.product.businessPageId, 15)}
                                      </BadgeWithVariants>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {item.quantity}
                                    {item.originalItemIds && item.originalItemIds.length > 1 && (
                                      <Badge variant="outline" className="ml-2">
                                        {item.originalItemIds.length} items grouped
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>${item.details?.price ? item.details.price.toFixed(2) : "0.00"}</TableCell>
                                  <TableCell>
                                    {item.customization ? (
                                      <div className="max-w-xs">
                                        <BadgeWithVariants
                                          variant="secondary"
                                          className="font-normal whitespace-normal text-xs"
                                        >
                                          {item.customization}
                                        </BadgeWithVariants>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">No customization</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {item.recieveBy && Object.keys(item.recieveBy).length > 0 ? (
                                      <div className="max-w-xs">
                                        <BadgeWithVariants
                                          variant="secondary"
                                          className="font-normal whitespace-normal text-xs"
                                        >
                                          {Object.values(item.recieveBy)[0]}
                                        </BadgeWithVariants>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">not Delivery</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {item.details?.scheduledDateTime && (
                                      <Badge>
                                        Day - {item.details?.scheduledDateTime.date} Time -{" "}
                                        {item.details?.scheduledDateTime.timeSlot}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {item.recieveBy?.type === "DELIVERY" && order?.tasks?.length > 0 ? (
                                      <div className="text-xs">
                                        {order?.tasks?.map((employee) => employee.employee.user.name).join(" , ")}
                                      </div>
                                    ) : (
                                      <div>not assigned</div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      disabled={
                                        item.productFulfillmentStatus === "fulfilled" || item.outForDelivery === "TRUE"
                                      }
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleOpenOutForDeliveryModal(order, item)
                                      }}
                                    >
                                      {item.outForDelivery === "TRUE" ? "Out For Delivery" : "Mark Out For Delivery"}
                                    </Button>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      disabled={
                                        item.productFulfillmentStatus === "fulfilled" ||
                                        item.recieveBy?.type === "DELIVERY" ||
                                        item.recieveBy?.type === "DELIVERY"
                                      }
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        // Open OTP verification modal instead of directly marking as fulfilled
                                        handleOpenOtpModal(order, item)
                                      }}
                                    >
                                      {item.productFulfillmentStatus === "fulfilled"
                                        ? "Fulfilled"
                                        : "Mark as Fulfilled"}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            })()}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="mt-4 flex justify-end items-center">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedOrder(order)
                              setIsModalOpen(true)
                            }}
                          >
                            View Details
                          </Button>
                          {/* {order.orderItems.some((item) => item.recieveBy && item.recieveBy.type === "DELIVERY") && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenAssignTaskModal(order)
                              }}
                            >
                              Assign Worker
                            </Button>
                          )} */}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms." : "You don't have any orders yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing modals */}
      <OrderDetailsModal order={selectedOrder} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {selectedOrderForTask && (
        <AssignTaskModal
          isOpen={isAssignTaskModalOpen}
          onClose={() => setIsAssignTaskModalOpen(false)}
          businessId={selectedOrderForTask.orderItems[0]?.product.businessPageId || ""}
          orderId={selectedOrderForTask.order_id}
          getEmployeesByBusiness={getEmployeesByBusiness}
          assignTaskToEmployee={assignTaskToEmployee}
          companyId={businessId}
        />
      )}

      {/* New OTP verification modal */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onVerify={verifyOtp}
        title="Customer Verification"
        description="Please ask the customer to enter the 6-digit OTP sent to their registered mobile number to confirm order fulfillment."
      />

      {/* Out For Delivery confirmation modal */}
      <OutForDeliveryModal
        isOpen={isOutForDeliveryModalOpen}
        onClose={() => setIsOutForDeliveryModalOpen(false)}
        onConfirm={markAsOutForDelivery}
        orderDetails={selectedOrderForDelivery}
      />
    </div>
  )
}
