"use client"
import { useState, useEffect, useMemo } from "react"
import { Download, Search, ShoppingBag, Package, User, ChevronDown, ChevronUp, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { OrderDetailsModal } from "./order-details-modal"
import { AssignTaskModal } from "./assign-task-modal"
import { OtpVerificationModal } from "./otp-verification-modal"
import { OutForDeliveryModal } from "./out-for-delivery-modal"
import { OverrideConfirmationModal } from "./override-confirmation-modal"
import { OverrideCancellationModal } from "./override-cancellation-modal"
import { getEmployeesByBusiness, assignTaskToEmployee } from "@/app/api/actions/employees"
import { Toaster } from "react-hot-toast"
import { fulfillNonDliveryItem } from "@/app/settings/tasks/delivery"
import { getOrdersByBusinessPage, MarkOutForDelivery } from "@/app/api/business/order/order"
import { overRideFulfillment } from "@/app/settings/tasks/delivery"
import { overRideCancellation } from "@/app/settings/tasks/delivery"
import EmployeeTaskDropdownCell from "./employeedropdown"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"

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

export default function OrdersDashboard({ pageId, businessId, employees }) {
  // All state declarations at the top - NEVER conditional
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("newest")
  const [expandedOrders, setExpandedOrders] = useState({})
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false)
  const [selectedOrderForTask, setSelectedOrderForTask] = useState(null)
  const [ordersData, setOrdersData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [selectedOrderItem, setSelectedOrderItem] = useState(null)
  const [selectedOrderForOtp, setSelectedOrderForOtp] = useState(null)
  const [isOutForDeliveryModalOpen, setIsOutForDeliveryModalOpen] = useState(false)
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null)
  const [processedOrders, setProcessedOrders] = useState([])
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false)
  const [selectedOrderForOverride, setSelectedOrderForOverride] = useState(null)
  const [isOverrideCancellationModalOpen, setIsOverrideCancellationModalOpen] = useState(false)
  const [selectedOrderForCancellation, setSelectedOrderForCancellation] = useState(null)
  const { data: session, status } = useSession()

  // All useEffect hooks at the top - NEVER conditional
  useEffect(() => {
    async function fetchOrders() {
      const updatedData = await getOrdersByBusinessPage(pageId)

      console.log("order data", updatedData.data)
      setOrdersData(updatedData)
      setLoading(false)
    }
    fetchOrders()
  }, [pageId])

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

  // Use useMemo for expensive calculations instead of inline calculations
  const sortedOrders = useMemo(() => {
    return [...processedOrders].sort((a, b) => {
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
  }, [processedOrders, sortOrder])

  const filteredOrders = useMemo(() => {
    return sortedOrders.filter(
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
  }, [sortedOrders, searchTerm])

  useEffect(() => {
    console.log("filtered orders", filteredOrders)
  }, [filteredOrders])

  const statistics = useMemo(() => {
    const totalOrders = processedOrders.length
    const totalRevenue = filteredOrders.reduce((sum, order) => {
        const orderTotal=order.totalCost
      return sum + orderTotal
    }, 0)
    const totalItems = processedOrders.reduce(
      (sum, order) => sum + order.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )
    const uniqueCustomers = new Set(processedOrders.map((order) => order.userId)).size

    return { totalOrders, totalRevenue, totalItems, uniqueCustomers }
  }, [processedOrders, filteredOrders])

  const businessPages = useMemo(() => {
    const pages = {}
    processedOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const pageId = item.product.businessPageId
        if (!pages[pageId]) {
          pages[pageId] = {
            id: pageId,
            orderCount: 0,
            revenue: 0,
            products: new Set(),
          }
        }
        pages[pageId].orderCount++
        pages[pageId].revenue += order.totalCost / order.orderItems.length
        pages[pageId].products.add(item.product.id)
      })
    })
    return pages
  }, [processedOrders])

  // Early return AFTER all hooks have been called
  if (loading) return <div>Loading orders...</div>

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
              const markedAsDelivered = await MarkOutForDelivery(itemId[0])
              console.log("delivery data", markedAsDelivered)
              if (markedAsDelivered) {
                updatedOrders[orderIndex].orderItems[itemIndex].outForDelivery = "TRUE"
              } else {
                console.error("Error from backend", markedAsDelivered)
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

  // Helper function to get user details directly from order.user instead of tasks
  const getUserDetails = (order) => {
    // User details are directly available on the order object
    return order.user || null
  }

  const handleOverrideFulfillment = async (order,item) => {
    const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    // console.log("item for over ride",item.product.id)
    setSelectedOrderForOverride({
      order_id: order.order_id,
      orderId: order.id,
      productId:item.product.id,
      totalItems,
    })
    setIsOverrideModalOpen(true)
  }

  const confirmOverrideFulfillment = async () => {
    if (!selectedOrderForOverride) return

    try {
      console.log("selected order for override",selectedOrderForOverride)
      const result = await overRideFulfillment(selectedOrderForOverride.orderId,selectedOrderForOverride.productId)

   if (result.success) {
  const updatedOrders = [...processedOrders]
  const orderIndex = updatedOrders.findIndex(
    (o) => o.id === selectedOrderForOverride.orderId
  )

  if (orderIndex >= 0) {
    // Update only the item with matching productId
    updatedOrders[orderIndex].orderItems = updatedOrders[orderIndex].orderItems.map(
      (item) =>
        item.productId === selectedOrderForOverride.productId
          ? { ...item, productFulfillmentStatus: "fulfilled" }
          : item
    )

    setProcessedOrders(updatedOrders)
  }
  toast.success(result.message)
} else {
        toast.error(result.message || "Failed to override fulfillment")
      }
    } catch (error) {
      console.error("Error overriding fulfillment:", error)
      toast.error("An error occurred while overriding fulfillment")
    }
  }

  const handleOverrideCancellation = async (order,item) => {
    const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    console.log("cancelling item",item)
    console.log("cancelling order",order)
    setSelectedOrderForCancellation({
      product_id:item.product.id,
      order_id: order.order_id,
      orderId: order.id,
      totalItems,
    })
    setIsOverrideCancellationModalOpen(true)
  }

  const confirmOverrideCancellation = async (cancellationReason) => {
    if (!selectedOrderForCancellation) return

    try {
      console.log("cancellation order",selectedOrderForCancellation)
      const result = await overRideCancellation(selectedOrderForCancellation.orderId ,selectedOrderForCancellation.product_id,cancellationReason)

      if (result.success) {
        // Update the local state to reflect the changes
        const updatedOrders = [...processedOrders]
        const orderIndex = updatedOrders.findIndex((o) => o.id === selectedOrderForCancellation.orderId)

        if (orderIndex >= 0) {
          // Mark all items as cancelled
          updatedOrders[orderIndex].orderItems = updatedOrders[orderIndex].orderItems.map((item) => ({
            ...item,
            productFulfillmentStatus: "cancelled",
            cancellationReason,
          }))
          setProcessedOrders(updatedOrders)
        }

        toast.success(result.message)
      } else {
        toast.error(result.message || "Failed to override cancellation")
      }
    } catch (error) {
      console.error("Error overriding cancellation:", error)
      toast.error("An error occurred while overriding cancellation")
    }
  }

  return (
    <div className="container py-6 space-y-8 bg-background text-foreground">
      {/* React Hot Toast container */}
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and analyze your orders across all business pages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border hover:bg-accent bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border dark:bg-black ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{statistics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {processedOrders.length > 0 && `Last order ${formatDate(processedOrders[0].createdAt)}`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border dark:bg-black ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Revenue</CardTitle>
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
            <div className="text-2xl font-bold text-card-foreground">₹{statistics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all orders</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border dark:bg-black ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{statistics.totalItems}</div>
            <p className="text-xs text-muted-foreground">Items sold</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border dark:bg-black ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Unique Customers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{statistics.uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground">Distinct buyers</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden sm:rounded-lg sm:border sm:shadow-sm rounded-none border-0 shadow-none sm:mx-0 bg-card border-border dark:bg-black ">
        <CardHeader>
          <CardTitle className="text-card-foreground">Business Pages Performance</CardTitle>
          <CardDescription>Order distribution across your business pages</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="hidden md:table-cell text-muted-foreground">Business Page ID</TableHead>
                <TableHead className="text-muted-foreground">Orders</TableHead>
                <TableHead className="text-muted-foreground">Revenue</TableHead>
                <TableHead className="text-muted-foreground">Products</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(businessPages).map((page) => (
                <TableRow key={page.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium hidden md:table-cell text-foreground">
                    {truncate(page.id, 20)}
                  </TableCell>
                  <TableCell className="text-foreground">{page.orderCount}</TableCell>
                  <TableCell className="text-foreground">₹{page.revenue.toFixed(2)}</TableCell>
                  <TableCell className="text-foreground">{page.products.size}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="min-w-full bg-card border-border dark:bg-black ">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="hidden">All Orders</CardTitle>
            <CardTitle className="text-sm text-card-foreground">Orders</CardTitle>
            <CardDescription className="hidden md:block">Detailed view of all orders in the system</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search orders..."
                className="w-[100px] md:w-[200px] pl-8 bg-background border-border text-foreground placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[100px] md:w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="newest" className="text-popover-foreground hover:bg-accent">
                  Newest first
                </SelectItem>
                <SelectItem value="oldest" className="text-popover-foreground hover:bg-accent">
                  Oldest first
                </SelectItem>
                <SelectItem value="highest" className="text-popover-foreground hover:bg-accent">
                  Highest value
                </SelectItem>
                <SelectItem value="lowest" className="text-popover-foreground hover:bg-accent">
                  Lowest value
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          {filteredOrders.length > 0 ? (
            <div className="rounded-md border border-border sm:rounded-md sm:border sm:mx-0 -mx-4">
              {filteredOrders.map((order) => {
                const userDetails = getUserDetails(order)

                return (
                  <Collapsible
                    key={order.id}
                    open={expandedOrders[order.id]}
                    onOpenChange={() => toggleOrderExpanded(order.id)}
                  className={`border-b border-border last:border-b-0 ${
                  order.orderItems.every((item) => item.productFulfillmentStatus === "fulfilled")
                    ? "border-4 border-green-500 bg-green-100 dark:bg-green-900/20"
                    : order.orderItems.every((item) => item.productFulfillmentStatus === "cancelled")
                    ? "border-4 border-red-500 bg-red-100 dark:bg-red-900/20"
                    : order.orderItems.some((item) =>
                        ["cancelled", "pending", "fulfilled"].includes(item.productFulfillmentStatus)
                      )
                    ? "border-4 border-yellow-500 bg-yellow-100 dark:bg-yellow-900/20"
                    : ""
                }`}
                >
                    <div
                      className="flex items-center p-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleOrderExpanded(order.id)}
                    >
                      <div className="grid grid-cols-3 md:grid-cols-7 gap-4 flex-1">
                        <div>
                          <p className="text-sm font-medium text-foreground">Order ID</p>
                          <p className="text-sm text-muted-foreground">
                            {expandedOrders[order.id] ? order.order_id : truncate(order.order_id, 8)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Customer</p>
                          {order.user ? (
                            <div className="flex items-center gap-2">
                              {order.user.userdp && (
                                <img
                                  src={order.user.userdp || "/placeholder.svg"}
                                  alt={order.user.name || "User"}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="text-sm text-foreground font-medium">
                                  {order.user.name || "Unknown User"}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">User #{order.userId}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Date</p>
                          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Items</p>
                          <p className="text-sm text-muted-foreground">
                            {(() => {
                              const uniqueProducts = new Set()
                              order.orderItems.forEach((item) => {
                                const productKey = `${item.product.id}-${item.customization || ""}-${
                                  item.details?.price || ""
                                }-${item.recieveBy?.type || ""}-${item.details?.scheduledDateTime?.date || ""}-${
                                  item.details?.scheduledDateTime?.timeSlot || ""
                                }-${item.productFulfillmentStatus || ""}-${item.outForDelivery || ""}`
                                uniqueProducts.add(productKey)
                              })
                              return uniqueProducts.size
                            })()} unique products
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Total</p>
                          <p className="text-sm text-muted-foreground">
                            ₹
                            {order.totalCost.toFixed(2)}
                          </p>
                          
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Payment Method</p>
                          <p className="text-sm text-muted-foreground">
                            {order.payment_method}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Fulfillment</p>
                          <div>
                            {order.orderItems.every((item) => item.productFulfillmentStatus === "fulfilled") ? (
                              <BadgeWithVariants
                                variant="success"
                                className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800"
                              >
                                Fulfilled
                              </BadgeWithVariants>
                            ) : (
                              <BadgeWithVariants variant="outline" className="border-border text-foreground">
                                Pending
                              </BadgeWithVariants>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-auto hover:bg-accent">
                        {expandedOrders[order.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 bg-muted/20">
                        {order.user && expandedOrders[order.id] && (
                          <div className="mb-4 p-4 bg-background rounded-lg border border-border">
                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Customer Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="flex items-center gap-3">
                                {order?.user?.userdp && (
                                  <img
                                    src={order?.user?.userdp || "/placeholder.svg"}
                                    alt={order?.user?.name || "User"}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-border"
                                  />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {order.user.name || "Unknown User"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{order.user.email || "No email"}</p>
                                </div>
                              </div>

                              {order.user.userDetails?.phoneNumber && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Phone
                                  </p>
                                  <p className="text-sm text-foreground">{order.user.userDetails.phoneNumber}</p>
                                </div>
                              )}

                          {order.user.userDetails?.addresses && order.user.userDetails.addresses.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Address
                              </p>
                              <div className="space-y-2">
                                {order.user.userDetails.addresses.slice(0, 2).map((address, index) => (
                                  <div key={index} className="text-sm text-foreground leading-snug">
                                    <p className="font-medium capitalize">{address.type}</p>
                                    <p>{address.addressLine1}</p>
                                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                                    <p>
                                      {address.city}, {address.state} {address.zip}
                                    </p>
                                    <p>{address.country}</p>
                                    {address.landmark && <p className="text-muted-foreground">Landmark: {address.landmark}</p>}
                                    {address.instructions && <p className="text-muted-foreground">Note: {address.instructions}</p>}
                                  </div>
                                ))}
                                {order.user.userDetails.addresses.length > 2 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{order.user.userDetails.addresses.length - 2} more addresses
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                            </div>
                          </div>
                        )}

                        <div className="rounded-md border border-border bg-background">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-border hover:bg-muted/50">
                                <TableHead className="text-muted-foreground">Product ID</TableHead>
                                <TableHead className="text-muted-foreground">Product Name</TableHead>
                                <TableHead className="text-muted-foreground">Business Page</TableHead>
                                <TableHead className="text-muted-foreground">Quantity</TableHead>
                                <TableHead className="text-muted-foreground">Original Price</TableHead>
                                <TableHead className="text-muted-foreground">Price</TableHead>
                                <TableHead className="text-muted-foreground">Customization</TableHead>
                                <TableHead className="text-muted-foreground">Discounts</TableHead>
                                <TableHead className="text-muted-foreground">Recieve By</TableHead>
                                <TableHead className="text-muted-foreground">Slot</TableHead>
                                <TableHead className="text-muted-foreground">Employee</TableHead>
                                <TableHead className="text-muted-foreground">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(() => {
                                // Group identical items logic remains the same
                                const groupedItems = []
                                order.orderItems.forEach((item) => {
                                  const existingItemIndex = groupedItems.findIndex((groupedItem) => {
                                    if (groupedItem.product.id !== item.product.id) return false
                                    const sameCustomization = groupedItem.customization === item.customization
                                    const sameBusinessPage =
                                      groupedItem.product.businessPageId === item.product.businessPageId
                                    const samePrice = groupedItem.details?.price === item.details?.price
                                    let sameReceiveBy = false
                                    if (
                                      (!groupedItem.recieveBy && !item.recieveBy) ||
                                      (groupedItem.recieveBy &&
                                        item.recieveBy &&
                                        groupedItem.recieveBy.type === item.recieveBy.type)
                                    ) {
                                      sameReceiveBy = true
                                    }
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
                                    const sameFulfillmentStatus =
                                      groupedItem.productFulfillmentStatus === item.productFulfillmentStatus
                                    const sameOutForDelivery = groupedItem.outForDelivery === item.outForDelivery
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
                                    groupedItems[existingItemIndex].quantity += item.quantity
                                    if (!groupedItems[existingItemIndex].originalItemIds) {
                                      groupedItems[existingItemIndex].originalItemIds = [
                                        groupedItems[existingItemIndex].id,
                                      ]
                                    }
                                    groupedItems[existingItemIndex].originalItemIds.push(item.id)
                                  } else {
                                    groupedItems.push({ ...item })
                                  }
                                })

                                return groupedItems.map((item, index) => (
                                  <TableRow key={index} className={`border-border  ${
                                    item.productFulfillmentStatus === "cancelled"
                                      ? "border-red-500 bg-red-100 dark:bg-red-900/20"
                                      : ""
                                  }`}>
                                    <TableCell className="font-medium text-foreground">{item.product.id}</TableCell>
                                    <TableCell className="text-foreground">{item.product.name}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center">
                                        <BadgeWithVariants
                                          variant="outline"
                                          className="font-mono text-xs border-border text-foreground"
                                        >
                                          {truncate(item.product.businessPageId, 15)}
                                        </BadgeWithVariants>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-foreground">
                                      {item.quantity}
                                      {item.originalItemIds && item.originalItemIds.length > 1 && (
                                        <Badge variant="outline" className="ml-2 border-border text-foreground">
                                          {item.originalItemIds.length} items grouped
                                        </Badge>
                                      )}
                                    </TableCell>
                                     <TableCell className="text-foreground">
                                      ₹{item.details?.price ? (item.details.price*item.quantity) : "0.00"}
                                    </TableCell>
                                    <TableCell className="text-foreground">
                                      ₹{item?.finalPrice ? item.finalPrice * item.quantity : "0.00"}
                                    </TableCell>
                                    <TableCell>
                                      {item.customization ? (
                                        <div className="max-w-xs">
                                          <BadgeWithVariants
                                            variant="secondary"
                                            className="font-normal whitespace-normal text-xs bg-secondary text-secondary-foreground"
                                          >
                                            {item.customization}
                                          </BadgeWithVariants>
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground text-xs">No customization</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {
                                        item.discount ? (
                                          <div className="max-w-xs">
                                          <BadgeWithVariants
                                            variant="secondary"
                                            className="font-normal whitespace-normal text-xs bg-secondary text-secondary-foreground"
                                          >
                                            {item.discount}%
                                          </BadgeWithVariants>
                                        </div>
                                        ):
                                        <div className="max-w-xs">
                                          <BadgeWithVariants
                                            variant="secondary"
                                            className="font-normal whitespace-normal text-xs bg-secondary text-secondary-foreground"
                                          >
                                            None
                                          </BadgeWithVariants>
                                        </div>
                                      }
                                    </TableCell>
                                    <TableCell>
                                      {item.recieveBy && Object.keys(item.recieveBy).length > 0 ? (
                                        <div className="max-w-xs">
                                          <BadgeWithVariants
                                            variant="secondary"
                                            className="font-normal whitespace-normal text-xs bg-secondary text-secondary-foreground"
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
                                        <Badge className="bg-primary text-primary-foreground">
                                          Day - {item.details?.scheduledDateTime.date} Time -{" "}
                                          {item.details?.scheduledDateTime.timeSlot}
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <EmployeeTaskDropdownCell
                                        item={item}
                                        order={order}
                                        allEmployees={employees} // list of all employee objects: [{ id, user: { name } }]
                                        onChangeAssignment={async (orderId, employeeId) => {
                                          await assignTaskToEmployee({
                                            companyId: businessId,
                                            businessId: pageId,
                                            employeeId,
                                            orderId: orderId,
                                            taskName: order.id,
                                          })
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        size="sm"
                                        disabled={
                                          item.productFulfillmentStatus === "fulfilled" ||
                                          item.outForDelivery === "TRUE"
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleOpenOutForDeliveryModal(order, item)
                                        }}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                      >
                                        {item.outForDelivery === "TRUE" ? "Out For Delivery" : "Mark Out For Delivery"}
                                      </Button>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        size="sm"
                                        disabled={
                                          item.productFulfillmentStatus === "fulfilled" ||
                                          item.productFulfillmentStatus === "cancelled" ||
                                          (item.recieveBy?.type === "DELIVERY" &&
                                            !["priyanshu.paul003@gmail.com", "sgarvit22@gmail.com"].includes(
                                              session?.user?.email ?? "",
                                            ))
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleOpenOtpModal(order, item)
                                        }}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                      >
                                        {item.productFulfillmentStatus === "fulfilled"
                                          ? "Fulfilled"
                                          : item.productFulfillmentStatus === "cancelled"
                                            ? "Cancelled"
                                            : "Mark as Fulfilled"}
                                      </Button>
                                      {["priyanshu.paul003@gmail.com", "sgarvit22@gmail.com"].includes(
                                        session?.user?.email ?? "",
                                      ) && (
                                        <div className="flex flex-col gap-2 mt-2">
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleOverrideFulfillment(order,item)
                                            }}
                                          >
                                            Override Fulfillment
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleOverrideCancellation(order,item)
                                            }}
                                          >
                                            Override Cancellation
                                          </Button>
                                        </div>
                                      )}
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
                              className="border-border hover:bg-accent bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedOrder(order)
                                setIsModalOpen(true)
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No orders found</h3>
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

      <OverrideConfirmationModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        onConfirm={confirmOverrideFulfillment}
        orderDetails={selectedOrderForOverride}
      />

      <OverrideCancellationModal
        isOpen={isOverrideCancellationModalOpen}
        onClose={() => setIsOverrideCancellationModalOpen(false)}
        onConfirm={confirmOverrideCancellation}
        orderDetails={selectedOrderForCancellation}
      />
    </div>
  )
}
