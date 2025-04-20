"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/Input"
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
} from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { fulfillItemsByOtp, checkAllItemsFulfilled } from "./delivery"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function TaskComponent({ sampleData }) {
  const [tasks, setTasks] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [otpDialogOpen, setOtpDialogOpen] = useState(false)
  const [otp, setOtp] = useState("")
  const [expandedTasks, setExpandedTasks] = useState({})

  useEffect(() => {
    if (sampleData?.data) {
      // Process the data to consolidate identical products
      const processedData = sampleData.data.map((task) => {
        if (!task.order?.orderItems || task.order.orderItems.length === 0) {
          return task
        }

        // Create a deep copy of the task to avoid mutation issues
        const taskCopy = JSON.parse(JSON.stringify(task))

        // Consolidate identical products in the order items
        taskCopy.order.orderItems = consolidateIdenticalProducts(taskCopy.order.orderItems)

        return taskCopy
      })

      setTasks(processedData)
    }
  }, [sampleData])

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

  const verifyOtp = async () => {
    // Check if the entered OTP matches the ones in the orderItems
    console.log("selected task", selectedTask)

    if (selectedTask?.order?.orderItems && selectedTask.order.orderItems.length > 0) {
      // Get all unique OTPs from order items
      const orderItemOtps = [...new Set(selectedTask.order.orderItems.map((item) => item.otp))]

      // Check if entered OTP matches any of the order item OTPs
      const isValidOtp = orderItemOtps.includes(otp)

      if (isValidOtp) {
        // Call the fulfillItemsByOtp function to update the database
        const result = await fulfillItemsByOtp(selectedTask.order.id, otp, selectedTask.employeeId)

        if (result.success) {
          // Show success message for the items that were updated
          toast.success(result.message || `${result.count} item(s) marked as fulfilled`)

          // Check if all items in the order are now fulfilled using the server action
          const allFulfilled = await checkAllItemsFulfilled(selectedTask.order.id)

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
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Delivery Tasks</h1>

      <div className="grid grid-cols-1 gap-4">
        {tasks?.map((task) => (
          <Card key={task.id} className={`overflow-hidden ${task.status === "completed" ? "bg-muted/50" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">{task.order.userName}</CardTitle>
                  <p className="text-sm text-muted-foreground">Order ID: {task.task_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={task.status === "completed" ? "outline" : "default"}>
                    {task.status === "completed" ? (
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" /> Completed
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" /> Pending
                      </span>
                    )}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleTaskDetails(task.id)}>
                    {expandedTasks[task.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Basic info always visible */}
              <div>
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Delivery Address</span>
                </div>

                <div className="ml-6 space-y-1 text-sm">
                  <p>{task.order.address[0].addressLine1}</p>
                  {task.order.address[0].addressLine2 && <p>{task.order.address[0].addressLine2}</p>}
                  <p>
                    {task.order.address[0].city}, {task.order.address[0].state}, {task.order.address[0].zip}
                  </p>
                  <p>{task.order.address[0].country}</p>

                  {task.order.address[0].landmark && (
                    <p className="text-muted-foreground">Landmark: {task.order.address[0].landmark}</p>
                  )}

                  {task.order.address[0].instructions && (
                    <p className="text-muted-foreground mt-2">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      {task.order.address[0].instructions}
                    </p>
                  )}
                </div>
              </div>

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

                <div>
                  <Badge variant="outline" className="mr-2">
                    <Home className="h-3 w-3 mr-1" />
                    {task.order.address[0].type}
                  </Badge>
                </div>
              </div>

              {/* Expanded details */}
              {expandedTasks[task.id] && (
                <div className="mt-4 space-y-4">
                  <Separator />

                  {/* Order Information */}
                  <div className="bg-muted/30 p-3 rounded-md">
                    <h3 className="font-medium mb-2 flex items-center">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Order Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6 text-sm">
                      <div className="space-y-1">
                        <p>
                          <span className="text-muted-foreground">Order ID:</span>{" "}
                          <span className="font-medium">{task.order.order_id}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">User ID:</span> <span>{task.order.userId}</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p>
                          <span className="text-muted-foreground">Created:</span>{" "}
                          <span>{new Date(task.order.createdAt).toLocaleString()}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Updated:</span>{" "}
                          <span>{new Date(task.order.updatedAt).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {task.order.orderItems && (
                    <div className="space-y-3">
                      <h3 className="font-medium flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        Order Items
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

              {task.status !== "completed" && (
                <Button className="w-full" onClick={() => handleDeliverClick(task)}>
                  Deliver Order
                </Button>
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
                <span className="font-medium">{selectedTask?.task_id}</span>
              </div>
              <div className="ml-6 text-sm text-muted-foreground">
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
