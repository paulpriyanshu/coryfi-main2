"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/Input"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
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
} from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { fulfillItemsByOtp, checkAllItemsFulfilled } from "./delivery"

import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { revalidatePath } from "next/cache"

export default function TaskComponent({ sampleData }) {
  const [tasks, setTasks] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [otpDialogOpen, setOtpDialogOpen] = useState(false)
  const [otp, setOtp] = useState("")
  const [expandedTasks, setExpandedTasks] = useState({})

  useEffect(() => {
    if (sampleData?.data) {
      // Process the data to get only the latest instance of each task ID
      const processedData = getLatestTaskInstances(sampleData.data)
      setTasks(processedData)
      console.log("processed data", processedData)
    }
  }, [sampleData])

  // Function to get only the latest instance of each task ID
  const getLatestTaskInstances = (data) => {
    // Group tasks by task_id (or name field based on your sample data)
    const taskGroups = new Map()

    data.forEach((task) => {
      const taskId = task.task_id || task.name // Use task_id if available, otherwise use name

      if (!taskGroups.has(taskId)) {
        taskGroups.set(taskId, [])
      }
      taskGroups.get(taskId).push(task)
    })

    // Get the latest task from each group (based on updatedAt or createdAt)
    const latestTasks = []

    taskGroups.forEach((taskList, taskId) => {
      // Sort by updatedAt (or createdAt if updatedAt is not available) in descending order
      const sortedTasks = taskList.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt)
        const dateB = new Date(b.updatedAt || b.createdAt)
        return dateB - dateA // Most recent first
      })

      // Take the most recent task
      const latestTask = sortedTasks[0]

      // Process the task (consolidate products if needed)
      const processedTask = processTask(latestTask)
      latestTasks.push(processedTask)
    })

    // Sort the final array by updatedAt/createdAt in descending order (most recent first)
    return latestTasks.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt)
      const dateB = new Date(b.updatedAt || b.createdAt)
      return dateB - dateA // Most recent first
    })
  }

  // Function to process individual task (consolidate products, etc.)
  const processTask = (task) => {
    if (!task.order?.orderItems || task.order.orderItems.length === 0) {
      return task
    }

    // Create a deep copy of the task to avoid mutation issues
    const taskCopy = JSON.parse(JSON.stringify(task))

    // Consolidate identical products in the order items
    taskCopy.order.orderItems = consolidateIdenticalProducts(taskCopy.order.orderItems)

    return taskCopy
  }

  // Function to consolidate identical products
  const consolidateIdenticalProducts = (orderItems) => {
    const uniqueProductsMap = new Map()

    // First pass: create unique keys and group identical products
    orderItems.forEach((item) => {
      // Create a unique key based on all attributes that should be compared
      const itemKey = createUniqueProductKey(item)

      if (uniqueProductsMap.has(itemKey)) {
        // If this exact product already exists, increase quantity
        const existingItem = uniqueProductsMap.get(itemKey)
        existingItem.quantity = (Number.parseInt(existingItem.quantity) || 1) + (Number.parseInt(item.quantity) || 1)
      } else {
        // Otherwise add as a new unique product
        uniqueProductsMap.set(itemKey, { ...item })
      }
    })

    // Convert the map values back to an array
    return Array.from(uniqueProductsMap.values())
  }

  // Function to create a unique key for a product based on all its attributes
  const createUniqueProductKey = (item) => {
    // Create a simplified object with only the properties we want to compare
    const comparisonObject = {
      productId: item.productId,
      businessName: item.businessName,
      businessImage: item.businessImage,
      details: item.details,
      customization: item.customization,
      // Include any other attributes that should be considered for uniqueness
      outForDelivery: item.outForDelivery,
      productFulfillmentStatus: item.productFulfillmentStatus,
    }

    // Convert to string for comparison
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

  // Function to get appropriate background color based on task status
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

  // Function to get status badge
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
    // Check if the entered OTP matches the ones in the orderItems
    console.log("selected task", selectedTask)

    if (selectedTask?.order?.orderItems && selectedTask.order.orderItems.length > 0) {
      // Get all unique OTPs from order items
      const orderItemOtps = [...new Set(selectedTask.order.orderItems.map((item) => item.otp))]
      console.log("order items", orderItemOtps)

      // Check if entered OTP matches any of the order item OTPs
      const isValidOtp = orderItemOtps.includes(otp)
      console.log("isvalid", isValidOtp)

      if (isValidOtp) {
        // Call the fulfillItemsByOtp function to update the database
        const result = await fulfillItemsByOtp(selectedTask.name, otp, selectedTask.employeeId)
        console.log("result", result)

        if (result.success) {
          // Show success message for the items that were updated
          toast.success(result.message || `${result.count} item(s) marked as fulfilled`)

          // Check if all items in the order are now fulfilled using the server action
          const allFulfilled = await checkAllItemsFulfilled(selectedTask.task_id)
          console.log("fulfilled", allFulfilled)

          if (allFulfilled) {
            // Update task status in the UI only if all items are fulfilled
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
            revalidatePath('/settings/tasks')
          } else {
            // Fetch the latest order data to update the UI with current fulfillment status
            toast?.success("Some items in this order are still pending fulfillment.")
          }

          // Close dialog and reset
          router.refresh()
          setOtpDialogOpen(false)
          setOtp("")
        } else {
          // Show error message from the function
          toast.error(result.message || "Failed to update order status")
        }
      } else {
        // Show error message for invalid OTP
        toast.error("Invalid OTP. Please check and try again")
      }
    } else {
      toast.error("No order items found to verify OTP against")
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6 ">
      <h1 className="text-2xl font-bold">Delivery Tasks</h1>

      <div className="grid grid-cols-1 gap-4">
        {tasks?.map((task) => (
          <Card key={task.id} className={`overflow-hidden dark:bg-gray-900 ${getTaskCardBackground(task)}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">{task.order?.username || "Unknown Customer"}</CardTitle>
                  <p className="text-sm text-muted-foreground">Task ID: {task.task_id || task.name}</p>
                  {task.status === "cancelled" && (
                    <p className="text-sm font-medium text-red-800 mt-1">⚠️ This task has been cancelled</p>
                  )}
                  {task.status === "reassigned" && (
                    <p className="text-md  font-medium text-green-500 mt-1">🔄 This task has been reassigned to you</p>
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
              {/* Customer Contact Information - Always visible */}
              {(task.order?.userPhone || task.order?.email || task.order?.username) && (
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
                    {task.order?.userPhone && (
                      <p className="flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">Phone:</span>{" "}
                        <a
                          href={`tel:${task.order.userPhone}`}
                          className="font-medium ml-1 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          onClick={(e) => {
                            // Prevent event bubbling to avoid expanding/collapsing the card
                            e.stopPropagation()
                          }}
                        >
                          {task.order.userPhone}
                        </a>
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

              {/* Delivery Address - Enhanced with more details */}
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

                    {/* Additional userAddress details */}
                    {task.order.userAddress[0].phoneNumber && (
                      <p className="flex items-center text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" />
                        <strong>Address Phone:</strong>
                        <a
                          href={`tel:${task.order.userAddress[0].phoneNumber}`}
                          className="ml-1 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                        >
                          {task.order.userAddress[0].phoneNumber}
                        </a>
                      </p>
                    )}

                    {task.order.userAddress[0].recipientName && (
                      <p className="text-muted-foreground">
                        <strong>Recipient:</strong> {task.order.userAddress[0].recipientName}
                      </p>
                    )}
                  </div>
                </div>
              )}

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

              {/* Expanded details */}
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
                        {task.order?.userId && (
                          <p>
                            <span className="text-muted-foreground">User ID:</span> <span>{task.order.userId}</span>
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
                        {task.order?.expectedDeliveryTime && (
                          <p>
                            <span className="text-muted-foreground">Expected Delivery:</span>{" "}
                            <span>{new Date(task.order.expectedDeliveryTime).toLocaleString()}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items - only show if they exist */}

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
                          <div>
                            {item?.cancellationReason && item?.productFulfillmentStatus === "cancelled" && (
                              <Alert
                                variant="destructive"
                                className="border border-red-300 bg-red-50 text-red-800 dark:border-red-400 dark:bg-red-950 dark:text-red-200"
                              >
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{item.cancellationReason}</AlertDescription>
                              </Alert>
                            )}
                          </div>
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
                              {/* {item?.otp && (
                                <Badge variant="outline" className="ml-2">
                                  OTP: {item.otp}
                                </Badge>
                              )} */}
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

                              {item?.details?.recieveBy && (
                                <div className="flex justify-between">
                                  <span>{item?.details?.recieveBy.type} Charge:</span>
                                  <span>${item?.details?.recieveBy.charge}</span>
                                </div>
                              )}

                              {item?.details?.fields &&
                                Object.entries(item?.details?.fields).map(([category, field]) => (
                                  <div key={category} className="flex justify-between">
                                    <span>
                                      {category} ({field.key}):
                                    </span>
                                    <span>${field.value}</span>
                                  </div>
                                ))}

                              {item?.details?.counterItems &&
                                Object.entries(item?.details?.counterItems).map(([name, details]) => (
                                  <div key={name} className="flex justify-between">
                                    <span>
                                      {name} (x{details?.count}):
                                    </span>
                                    <span>${details?.cost * details?.count}</span>
                                  </div>
                                ))}

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

              {/* Only show deliver button for non-cancelled tasks */}
              {task.status !== "completed" && task.status !== "cancelled" && (
                <Button className="w-full" onClick={() => handleDeliverClick(task)}>
                  Deliver Order
                </Button>
              )}

              {/* Show message for cancelled tasks */}
              {task.status === "cancelled" && (
                <div className="text-center p-4 bg-red-100 rounded-md">
                  <p className="text-red-800 font-medium">This task has been cancelled and cannot be delivered.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks?.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No tasks assigned</h3>
          <p className="text-muted-foreground">You currently have no delivery tasks assigned.</p>
        </div>
      )}

      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent className="sm:max-w-md" autoFocus={false}>
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
                {selectedTask?.order?.userPhone && (
                  <p className="flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    <a
                      href={`tel:${selectedTask.order.userPhone}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      {selectedTask.order.userPhone}
                    </a>
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
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter the 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  className="text-center text-xl tracking-widest"
                  autoComplete="one-time-code"
                  autoFocus={false}
                />
                <p className="text-xs text-muted-foreground">Enter the OTP provided by the customer</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setOtpDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={verifyOtp}
              disabled={otp.length === 0 || !selectedTask?.order?.orderItems?.length}
              className="w-full sm:w-auto"
            >
              Verify & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
    </div>
  )
}
