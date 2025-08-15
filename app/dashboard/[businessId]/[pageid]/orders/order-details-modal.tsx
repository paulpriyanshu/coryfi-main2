import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Format date helper
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

export function OrderDetailsModal({ order, isOpen, onClose }) {
  if (!order) return null

  // Calculate cost breakdown
  const subtotal = order.totalCost
  const deliveryCharge = order.orderItems.reduce((total, item) => {
    if (item.recieveBy && item.recieveBy.type === "DELIVERY" && item.recieveBy.charge) {
      return total + item.recieveBy.charge
    }
    return total
  }, 0)
  const itemsTotal = subtotal - deliveryCharge

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">Order Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="text-lg font-medium">Order Summary</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                <p className="font-medium">{order.order_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p>{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge
                  variant={order.fulfillmentStatus === "fulfilled" ? "default" : "outline"}
                  className={
                    order.fulfillmentStatus === "fulfilled" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""
                  }
                >
                  {order.fulfillmentStatus === "fulfilled" ? "Fulfilled" : "Pending"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Internal ID</p>
                <p className="text-xs font-mono">{truncate(order.id, 20)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Details */}
          <div>
            <h3 className="text-lg font-medium">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {(() => {
                // Get user details from the first task that has employee user data
                const taskWithUser = order.tasks?.find((task) => task.employee?.user)
                const userDetails = taskWithUser?.employee?.user || null

                if (userDetails) {
                  return (
                    <>
                      <div className="col-span-2">
                        <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                          {userDetails.userdp && (
                            <img
                              src={userDetails.userdp || "/placeholder.svg"}
                              alt={userDetails.name || "User"}
                              className="w-12 h-12 rounded-full object-cover border-2 border-border"
                            />
                          )}
                          <div>
                            <p className="font-medium text-foreground">{userDetails.name || "Unknown User"}</p>
                            <p className="text-sm text-muted-foreground">{userDetails.email || "No email"}</p>
                          </div>
                        </div>
                      </div>

                      {userDetails.userDetails?.phoneNumber && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                          <p className="font-medium">{userDetails.userDetails.phoneNumber}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Customer ID</p>
                        <p>User #{order.userId}</p>
                      </div>

                      {userDetails.userDetails?.addresses && userDetails.userDetails.addresses.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Addresses</p>
                          <div className="space-y-2">
                            {userDetails.userDetails.addresses.map((address, index) => (
                              <div key={index} className="p-2 bg-muted/10 rounded border">
                                <p className="text-sm text-foreground">
                                  {typeof address === "string" ? address : JSON.stringify(address)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )
                } else {
                  return (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Customer ID</p>
                        <p>User #{order.userId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                        <p>-</p>
                      </div>
                    </>
                  )
                }
              })()}
            </div>
          </div>

          <Separator />

          {/* Product Details */}
          <div>
            <h3 className="text-lg font-medium">Product Details</h3>
            <div className="mt-2 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Customization</TableHead>
                    <TableHead>Business Page</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.product.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {item.customization ? (
                          <span className="text-xs">{item.customization}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono">{truncate(item.product.businessPageId, 10)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Detailed Cost Breakdown */}
          <div>
            <h3 className="text-lg font-medium">Cost Breakdown</h3>
            <div className="mt-2 space-y-6">
              {order.orderItems.map((item, index) => (
                <div key={index} className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">
                    {item.product.name} - Item #{index + 1}
                  </h4>

                  {item.details ? (
                    <div className="space-y-3">
                      {/* Base Price */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base Price</span>
                        <span>
                          $
                          {item.details.price ? (item.details.price - (item.recieveBy?.charge || 0)).toFixed(2) : "N/A"}
                        </span>
                      </div>

                      {/* Fields (Extras) */}
                      {item.details.fields &&
                        Object.entries(item.details.fields).map(([category, field]) => (
                          <div key={category} className="space-y-1">
                            <p className="text-xs font-medium">{category}</p>
                            <div className="flex justify-between text-sm pl-2">
                              <span className="text-muted-foreground">{field.key}</span>
                              <span>${field.value.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}

                      {/* Counter Items */}
                      {item.details.counterItems && Object.entries(item.details.counterItems).length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium">Counter Items</p>
                          {Object.entries(item.details.counterItems).map(([name, counter]) => (
                            <div key={name} className="flex justify-between text-sm pl-2">
                              <span className="text-muted-foreground">
                                {name} (${counter.cost.toFixed(2)} × {counter.count})
                              </span>
                              <span>${(counter.cost * counter.count).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Delivery Charge */}
                      {item.recieveBy && item.recieveBy.charge && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.recieveBy.type === "DELIVERY" ? "Delivery Charge" : "Takeaway Fee"}
                          </span>
                          <span>${item.recieveBy.charge.toFixed(2)}</span>
                        </div>
                      )}

                      <Separator />

                      {/* Item Total */}
                      <div className="flex justify-between font-medium">
                        <span>Item Total</span>
                        <span>${item.details.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Simple breakdown for items without details */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Item Price</span>
                        <span>
                          $
                          {(
                            item.quantity * (order.totalCost / order.orderItems.length) -
                            (item.recieveBy?.charge || 0)
                          ).toFixed(2)}
                        </span>
                      </div>

                      {/* Delivery Charge */}
                      {item.recieveBy && (item.recieveBy.charge || item.recieveBy.takeaway) && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.recieveBy.type === "DELIVERY" ? "Delivery Charge" : "Takeaway Fee"}
                          </span>
                          <span>${(item.recieveBy.charge || item.recieveBy.takeaway).toFixed(2)}</span>
                        </div>
                      )}

                      <Separator />

                      {/* Item Total */}
                      <div className="flex justify-between font-medium">
                        <span>Item Total</span>
                        <span>${(item.quantity * (order.totalCost / order.orderItems.length)).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <Separator />

              {/* Order Total */}
              <div className="flex justify-between font-bold text-lg">
                <span>Order Total</span>
                <span>
                  $
                  {order.orderItems
                    .reduce((sum, item) => {
                      // Use the price from details if available
                      const productPrice = item.details?.price || 0
                      return sum + productPrice * item.quantity
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>

              {/* Receive Method */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Receive Method</span>
                <span>
                  {order.orderItems.some((item) => item.recieveBy && item.recieveBy.type === "DELIVERY")
                    ? "Delivery"
                    : order.orderItems.some((item) => item.recieveBy && item.recieveBy.takeaway)
                      ? "Takeaway"
                      : "Standard"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
