"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Package,
  CheckCircle,
  Clock,
  MapPin,
  Home,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  XCircle,
  RefreshCw,
  Phone,
  User,
  Mail,
  Filter,
  Search,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast, { Toaster } from "react-hot-toast"
import { fulfillItemsByOtp, checkAllItemsFulfilled } from "./delivery"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function EnhancedTaskComponent({ sampleData }) {
  const [tasks, setTasks] = useState(null)
  const [filteredTasks, setFilteredTasks] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [otpDialogOpen, setOtpDialogOpen] = useState(false)
  const [otp, setOtp] = useState("")
  const [expandedTasks, setExpandedTasks] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (sampleData?.data) {
      const processedData = getLatestTaskInstances(sampleData.data)
      setTasks(processedData)
      setFilteredTasks(processedData)
    }
  }, [sampleData])

  // Filter tasks based on search term and status
  useEffect(() => {
    if (!tasks) return

    let filtered = tasks

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.order?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.task_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.order?.phoneNumber?.includes(searchTerm),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, statusFilter])

  // Function to get only the latest instance of each task ID
  const getLatestTaskInstances = (data) => {
    const taskGroups = new Map()
    data.forEach((task) => {
      const taskId = task.task_id || task.name
      if (!taskGroups.has(taskId)) {
        taskGroups.set(taskId, [])
      }
      taskGroups.get(taskId).push(task)
    })

    const latestTasks = []
    taskGroups.forEach((taskList, taskId) => {
      const sortedTasks = taskList.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt)
        const dateB = new Date(b.updatedAt || b.createdAt)
        return dateB - dateA
      })
      const latestTask = sortedTasks[0]
      const processedTask = processTask(latestTask)
      latestTasks.push(processedTask)
    })

    return latestTasks.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt)
      const dateB = new Date(b.updatedAt || b.createdAt)
      return dateB - dateA
    })
  }

  const processTask = (task) => {
    if (!task.order?.orderItems || task.order.orderItems.length === 0) {
      return task
    }
    const taskCopy = JSON.parse(JSON.stringify(task))
    taskCopy.order.orderItems = consolidateIdenticalProducts(taskCopy.order.orderItems)
    return taskCopy
  }

  const consolidateIdenticalProducts = (orderItems) => {
    const uniqueProductsMap = new Map()
    orderItems.forEach((item) => {
      const itemKey = createUniqueProductKey(item)
      if (uniqueProductsMap.has(itemKey)) {
        const existingItem = uniqueProductsMap.get(itemKey)
        existingItem.quantity = (Number.parseInt(existingItem.quantity) || 1) + (Number.parseInt(item.quantity) || 1)
      } else {
        uniqueProductsMap.set(itemKey, { ...item })
      }
    })
    return Array.from(uniqueProductsMap.values())
  }

  const createUniqueProductKey = (item) => {
    const comparisonObject = {
      productId: item.productId,
      businessName: item.businessName,
      businessImage: item.businessImage,
      details: item.details,
      customization: item.customization,
      outForDelivery: item.outForDelivery,
      productFulfillmentStatus: item.productFulfillmentStatus,
    }
    return JSON.stringify(comparisonObject)
  }

  const handleDeliverClick = (task) => {
    setSelectedTask(task)
    setOtpDialogOpen(true)
  }

  const toggleTaskDetails = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  const router = useRouter()

  const getTaskCardBackground = (task) => {
    if (task.status === "cancelled") {
      return "bg-red-500"
    } else if (task.status === "completed") {
      return "bg-green-400"
    } else if (task.status === "reassigned") {
      return "bg-yellow-400"
    } else {
      return "bg-blue-400"
    }
  }

  const getStatusBadge = (task) => {
    switch (task.status) {
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="h-4 w-4 mr-1" /> Cancelled
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline">
            <CheckCircle className="h-4 w-4 mr-1" /> Completed
          </Badge>
        )
      case "reassigned":
        return (
          <Badge variant="secondary">
            <RefreshCw className="h-4 w-4 mr-1" /> Reassigned
          </Badge>
        )
      default:
        return (
          <Badge variant="default">
            <Clock className="h-4 w-4 mr-1" /> Pending
          </Badge>
        )
    }
  }

  const verifyOtp = async () => {
    console.log("selected task", selectedTask)
    if (selectedTask?.order?.orderItems && selectedTask.order.orderItems.length > 0) {
      const orderItemOtps = [...new Set(selectedTask.order.orderItems.map((item) => item.otp))]
      const isValidOtp = orderItemOtps.includes(otp)

      if (isValidOtp) {
        const result = await fulfillItemsByOtp(selectedTask.order.id, otp, selectedTask.employeeId)
        if (result.success) {
          toast.success(result.message || `${result.count} item(s) marked as fulfilled`)
          const allFulfilled = await checkAllItemsFulfilled(selectedTask.order.id)

          if (allFulfilled) {
            const updatedTasks = tasks?.map((task) =>
              task.id === selectedTask.id
                ? {
                    ...task,
                    status: "completed",
                    order: {
                      ...task.order,
                      status: "completed",
                      fulfillmentStatus: "completed",
                    },
                  }
                : task,
            )
            setTasks(updatedTasks)
            toast.success(`All items fulfilled! Order ${selectedTask.task_id} has been completed.`)
          } else {
            toast?.success("Some items in this order are still pending fulfillment.")
          }

          router.refresh()
          setOtpDialogOpen(false)
          setOtp("")
        } else {
          toast.error(result.message || "Failed to update order status")
        }
      } else {
        toast.error("Invalid OTP. Please check and try again")
      }
    } else {
      toast.error("No order items found to verify OTP against")
    }
  }

  const getStatusCounts = () => {
    if (!tasks) return {}
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {})
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by customer name, task ID, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status ({tasks?.length || 0})</SelectItem>
              <SelectItem value="pending">Pending ({statusCounts.pending || 0})</SelectItem>
              <SelectItem value="completed">Completed ({statusCounts.completed || 0})</SelectItem>
              <SelectItem value="cancelled">Cancelled ({statusCounts.cancelled || 0})</SelectItem>
              <SelectItem value="reassigned">Reassigned ({statusCounts.reassigned || 0})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm || statusFilter !== "all") && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {filteredTasks?.length || 0} of {tasks?.length || 0} tasks
          </span>
          {searchTerm && <Badge variant="outline">Search: "{searchTerm}"</Badge>}
          {statusFilter !== "all" && <Badge variant="outline">Status: {statusFilter}</Badge>}
        </div>
      )}

      {/* Task Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTasks?.map((task) => (
          <Card key={task.id} className={`overflow-hidden dark:bg-gray-700 ${getTaskCardBackground(task)}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">{task.order?.username || "Unknown Customer"}</CardTitle>
                  <p className="text-sm text-muted-foreground">Task ID: {task.task_id || task.name}</p>
                  {task.status === "cancelled" && (
                    <p className="text-sm font-medium text-red-800 mt-1">⚠️ This task has been cancelled</p>
                  )}
                  {task.status === "reassigned" && (
                    <p className="text-md font-medium text-green-500 mt-1">🔄 This task has been reassigned</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(task)}
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleTaskDetails(task.id)}>
                    {expandedTasks[task.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Contact Information */}
              {(task.order?.phoneNumber || task.order?.email || task.order?.username) && (
                <div className="bg-muted/30 p-3 rounded-md">
                  <h3 className="font-medium mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Customer Information
                  </h3>
                  <div className="ml-6 space-y-1 text-sm">
                    {task.order?.username && (
                      <p>
                        <span className="text-muted-foreground">Name:</span>{" "}
                        <span className="font-medium">{task.order.username}</span>
                      </p>
                    )}
                    {task.order?.phoneNumber && (
                      <p className="flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">Phone:</span>{" "}
                        <span className="font-medium ml-1">{task.order.phoneNumber}</span>
                      </p>
                    )}
                    {task.order?.email && (
                      <p className="flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">Email:</span>{" "}
                        <span className="font-medium ml-1">{task.order.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {task.order?.userAddress?.[0] && (
                <div>
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Delivery Address</span>
                  </div>
                  <div className="ml-6 space-y-1 text-sm">
                    <p className="font-medium">{task.order.userAddress[0].addressLine1}</p>
                    {task.order.userAddress[0].addressLine2 && <p>{task.order.userAddress[0].addressLine2}</p>}
                    <p>
                      {task.order.userAddress[0].city}, {task.order.userAddress[0].state},{" "}
                      {task.order.userAddress[0].zip}
                    </p>
                    <p>{task.order.userAddress[0].country}</p>
                    {task.order.userAddress[0].landmark && (
                      <p className="text-muted-foreground">
                        <strong>Landmark:</strong> {task.order.userAddress[0].landmark}
                      </p>
                    )}
                    {task.order.userAddress[0].instructions && (
                      <p className="text-muted-foreground mt-2">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        <strong>Delivery Instructions:</strong> {task.order.userAddress[0].instructions}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              {task.order?.orderItems && (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-muted-foreground">Total Cost:</span>
                    <span className="ml-2 font-semibold">
                      $
                      {task.order.orderItems
                        ? task.order.orderItems
                            .reduce(
                              (sum, item) => sum + (item?.details?.price || 0) * (Number.parseInt(item?.quantity) || 1),
                              0,
                            )
                            .toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {task.order?.address?.[0]?.type && (
                      <Badge variant="outline">
                        <Home className="h-3 w-3 mr-1" />
                        {task.order.address[0].type}
                      </Badge>
                    )}
                    {task.order?.orderItems && <Badge variant="secondary">{task.order.orderItems.length} Items</Badge>}
                  </div>
                </div>
              )}

              {/* Expanded Details */}
              {expandedTasks[task.id] && (
                <div className="mt-4 space-y-4">
                  <Separator />

                  {/* Task Information */}
                  <div className="bg-muted/30 p-3 rounded-md">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Task Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6 text-sm">
                      <div className="space-y-1">
                        <p>
                          <span className="text-muted-foreground">Task ID:</span>{" "}
                          <span className="font-medium">{task.task_id || task.name}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Status:</span> <span>{task.status}</span>
                        </p>
                        {task.order?.order_id && (
                          <p>
                            <span className="text-muted-foreground">Order ID:</span>{" "}
                            <span className="font-medium">{task.order.order_id}</span>
                          </p>
                        )}
                        {task.employeeId && (
                          <p>
                            <span className="text-muted-foreground">Employee ID:</span> <span>{task.employeeId}</span>
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p>
                          <span className="text-muted-foreground">Created:</span>{" "}
                          <span>{new Date(task.createdAt).toLocaleString()}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Updated:</span>{" "}
                          <span>{new Date(task.updatedAt).toLocaleString()}</span>
                        </p>
                        {task.order?.orderDate && (
                          <p>
                            <span className="text-muted-foreground">Order Date:</span>{" "}
                            <span>{new Date(task.order.orderDate).toLocaleString()}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {task.order?.orderItems && (
                    <div className="space-y-3">
                      <h3 className="font-medium flex items-center">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Order Items ({task.order.orderItems.length})
                      </h3>
                      {task.order.orderItems.map((item, index) => (
                        <div
                          key={index}
                          className={`border rounded-md p-3 ${
                            item.outForDelivery === "TRUE" && item.productFulfillmentStatus !== "fulfilled"
                              ? "bg-orange-300"
                              : item.outForDelivery === "TRUE" && item.productFulfillmentStatus === "fulfilled"
                                ? "bg-green-300"
                                : ""
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium flex">
                                <div className="flex items-center gap-2 m-5">
                                  <Image
                                    src={item?.businessImage || "/placeholder.svg"}
                                    alt="Business DP"
                                    width={30}
                                    height={30}
                                    className="rounded-full object-cover"
                                  />
                                  <span>
                                    {item?.businessName} - {item?.details?.name}
                                  </span>
                                </div>
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                <strong>Quantity: {item?.quantity}</strong>
                              </p>
                              <Badge>Product ID: {item?.productId}</Badge>
                            </div>
                            <div className="text-right">
                              {item.productFulfillmentStatus && (
                                <Badge
                                  variant={item.productFulfillmentStatus === "fulfilled" ? "default" : "secondary"}
                                >
                                  {item.productFulfillmentStatus}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {item?.customization && (
                            <div className="mb-2">
                              <p className="text-sm">
                                <span className="text-muted-foreground">Customization:</span> {item?.customization}
                              </p>
                            </div>
                          )}

                          <div className="bg-muted/30 p-2 rounded-md mt-2">
                            <h5 className="text-sm font-medium mb-1">Cost Breakdown:</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Base Price:</span>
                                <span>${item?.details?.price}</span>
                              </div>
                              <Separator className="my-1" />
                              <div className="flex justify-between font-medium">
                                <span>Item Total:</span>
                                <span>
                                  ${(item?.details?.price * (Number.parseInt(item?.quantity) || 1)).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Action Buttons */}
              {task.status !== "completed" && task.status !== "cancelled" && (
                <Button className="w-full" onClick={() => handleDeliverClick(task)}>
                  Deliver Order
                </Button>
              )}

              {task.status === "cancelled" && (
                <div className="text-center p-4 bg-red-100 rounded-md">
                  <p className="text-red-800 font-medium">This task has been cancelled and cannot be delivered.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredTasks?.length === 0 && tasks?.length > 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No tasks found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {tasks?.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No tasks available</h3>
          <p className="text-muted-foreground">There are currently no tasks in the system.</p>
        </div>
      )}

      {/* OTP Dialog */}
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Delivery</DialogTitle>
            <DialogDescription>
              Ask the customer for their verification OTP and enter it below to confirm the delivery.
              {selectedTask?.order?.orderItems?.length > 0
                ? ` This order has ${selectedTask.order.orderItems.length} item(s).`
                : " Note: This order doesn't have any items with OTPs."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center mb-2">
                <Package className="h-4 w-4 mr-2" />
                <span className="font-medium">{selectedTask?.task_id || selectedTask?.name}</span>
              </div>
              <div className="ml-6 text-sm text-muted-foreground space-y-1">
                <p>Customer: {selectedTask?.order?.username}</p>
                {selectedTask?.order?.phoneNumber && (
                  <p className="flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {selectedTask.order.phoneNumber}
                  </p>
                )}
                <p>Customer needs to verify this delivery with an OTP code</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="otp" className="text-sm font-medium">
                  Customer OTP
                </label>
                <Input
                  id="otp"
                  placeholder="Enter the 4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center text-xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground">Enter the OTP provided by the customer</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOtpDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={verifyOtp} disabled={otp.length === 0 || !selectedTask?.order?.orderItems?.length}>
              Verify & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="top-right" />
    </div>
  )
}
