"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Package, Clock, User, ChevronDown, ChevronUp, UserCheck } from "lucide-react"

interface OrderItem {
  id: number
  quantity: number
  customization: string
  details: {
    id?: number
    name: string
    price: number
    stock?: number
    fields?: any
    images?: string[]
    basePrice?: number
    productId?: number
    recieveBy?: {
      type: string
      charge: number
    }
    counterItems?: any
    scheduledDateTime?: any
  }
  recieveBy?: {
    type: string
    charge: number
  }
  OTP: string
  productFulfillmentStatus: string
  outForDelivery: string
  product: {
    id: number
    name: string
    businessPageId: string
    businessName: string
    businessImage: string
  }
}

interface Task {
  id: number
  name: string
  status: string
  task_id: string
  employeeId: number
  businessId: string
  createdAt: string
  updatedAt: string
  employee: {
    id: number
    userId: number
    businessId: string
    jobId?: any
    user: {
      name: string
      email: string
      userdp: string
      phoneNumber: string
    }
  }
}

interface Address {
  id: number
  zip: string
  city: string
  type: string
  state: string
  country: string
  landmark: string
  addressLine1: string
  addressLine2: string
  instructions: string
}

interface Order {
  id: string
  order_id: string
  userId: number
  totalCost: number
  createdAt: string
  fulfillmentStatus: string
  address: Address[]
  username: string
  userPhone: string
  userAddress: Address[]
  tasks: Task[]
  orderItems: OrderItem[]
}

interface AllOrdersComponentProps {
  orders: Order[]
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "reassigned":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString)?.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AllOrdersComponent({ orders }: AllOrdersComponentProps) {
  const [openOrders, setOpenOrders] = useState<Set<string>>(new Set())
  const groupedOrders = useMemo(() => {
    const grouped = new Map<string, Order>()

    orders?.forEach((order) => {
      const existingOrder = grouped.get(order.order_id)

      if (existingOrder) {
        // Merge order items and tasks without duplicating
        existingOrder.orderItems = [...existingOrder?.orderItems, ...order?.orderItems]
        existingOrder.tasks = [...existingOrder?.tasks, ...order?.tasks]
        // Don't add total cost again, keep the original
      } else {
        // Create a new grouped order
        grouped.set(order.order_id, { ...order })
      }
    })

    return Array.from(grouped.values())
  }, [orders])

  if (!orders || orders?.length === 0) {
    return (
      <div className="text-center p-8">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No orders found</h3>
        <p className="text-muted-foreground">There are no orders to display at the moment.</p>
      </div>
    )
  }

  const toggleOrder = (orderId: string) => {
    const newOpenOrders = new Set(openOrders)
    if (newOpenOrders?.has(orderId)) {
      newOpenOrders?.delete(orderId)
    } else {
      newOpenOrders.add(orderId)
    }
    setOpenOrders(newOpenOrders)
  }

  // Function to get assigned employee for a specific product based on business matching
  const getAssignedEmployeeForProduct = (orderItem: OrderItem, allTasks: Task[]) => {
    // Find tasks that belong to the same business as the product
    const matchingTask = allTasks?.find(
      (task) => task.businessId === orderItem.product.businessPageId && task.status !== "cancelled",
    )

    return matchingTask?.employee.user || null
  }

  return (
    <div className="space-y-4">
      {groupedOrders.map((order, index) => {
        const isOpen = openOrders.has(order.order_id)

        return (
          <Card key={index} className="w-full dark:bg-gray-900 dark:text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Order #{order.order_id}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(order.fulfillmentStatus)}>
                    {order.fulfillmentStatus}
                  </Badge>
                  <Badge variant="secondary">₹{order.totalCost}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Always Visible: Basic Customer Information */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{order.username}</p>
                    {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a
                        href={`tel:${order.userPhone}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {order.userPhone}
                      </a>
                    </div> */}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {formatDate(order.createdAt)}
                </div>
              </div>

              {/* Collapsible Section for Additional Details */}
              <Collapsible open={isOpen} onOpenChange={() => toggleOrder(order.order_id)}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                    <span className="text-sm font-medium">
                      View Details ({order.orderItems.length} items, {order.tasks?.length || 0} tasks)
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-4 mt-4">
                  {/* Address */}
                  {order.address && order.address.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Delivery Address</p>
                        <p className="text-sm text-muted-foreground">
                          {order.address[0].addressLine1}
                          {order.address[0].addressLine2 && `, ${order.address[0].addressLine2}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.address[0].city}, {order.address[0].state} - {order.address[0].zip}
                        </p>
                        {order.address[0].landmark && (
                          <p className="text-xs text-muted-foreground">Landmark: {order.address[0].landmark}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Items with Assigned Employees */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Order Items ({order.orderItems.length})</span>
                    </div>
                    <div className="space-y-3">
                      {order.orderItems.map((item) => {
                        const assignedEmployee = getAssignedEmployeeForProduct(item, order.tasks)

                        return (
                          <div key={item.id} className="border rounded-lg p-3 space-y-3">
                            {/* Product Info */}
                            <div className="flex items-center gap-3">
                              <img
                                src={item.details.images?.[0] || item.product.businessImage || "/placeholder.svg"}
                                alt={item.product.name}
                                className="h-12 w-12 rounded object-cover"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.product.name}</p>
                                <p className="text-xs text-muted-foreground">{item.product.businessName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Qty: {item.quantity} • ₹{item.details.price}
                                </p>
                                {item.customization && item.customization !== "Normal" && (
                                  <p className="text-xs text-blue-600">{item.customization}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className={getStatusColor(item.productFulfillmentStatus)}>
                                  {item.productFulfillmentStatus}
                                </Badge>
                                {item.outForDelivery === "TRUE" && (
                                  <p className="text-xs text-green-600 mt-1">Out for Delivery</p>
                                )}
                              </div>
                            </div>

                            {/* Assigned Employee for this Product */}
                            {assignedEmployee ? (
                              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                <UserCheck className="h-4 w-4 text-blue-600" />
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={assignedEmployee.userdp || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">{assignedEmployee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-blue-800">
                                    Assigned to: {assignedEmployee.name}
                                  </p>
                                  <p className="text-xs text-blue-600">{assignedEmployee.email}</p>
                                  {assignedEmployee.phoneNumber && (
                                    <div className="flex items-center gap-1 text-xs text-blue-600">
                                      <Phone className="h-3 w-3" />
                                      <a
                                        href={`tel:${assignedEmployee.phoneNumber}`}
                                        className="hover:text-blue-800 hover:underline cursor-pointer"
                                      >
                                        {assignedEmployee.phoneNumber}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                                <User className="h-4 w-4 text-orange-600" />
                                <p className="text-xs text-orange-800 font-medium">Not assigned yet</p>
                                <p className="text-xs text-orange-600">Awaiting employee assignment</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* All Assigned Tasks Summary */}
                  {order.tasks && order.tasks.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-sm">All Assigned Tasks ({order.tasks.length})</p>
                      <div className="grid gap-2">
                        {order.tasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-3 p-2 border rounded-lg">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={task.employee.user.userdp || "/placeholder.svg"} />
                              <AvatarFallback>{task.employee.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{task.employee.user.name}</p>
                              <p className="text-xs text-muted-foreground">{task.employee.user.email}</p>
                              {task.employee.user.phoneNumber && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <a
                                    href={`tel:${task.employee.user.phoneNumber}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                  >
                                    {task.employee.user.phoneNumber}
                                  </a>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">Task: {task.name}</p>
                            </div>
                            <Badge variant="outline" className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Tasks Assigned */}
                  {(!order.tasks || order.tasks.length === 0) && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800 font-medium">No tasks assigned</p>
                      <p className="text-xs text-orange-600">This order is awaiting task assignment</p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
