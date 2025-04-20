import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Format date to a more readable format
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

export default function OrderDetail({ order, businessId, pageId }) {
  if (!order) return <div>Order not found</div>

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/${businessId}/${pageId}/orders`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Order {order.order_id}</h1>
        <Badge variant="outline" className="ml-2">
          Completed
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                <p>{order.order_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date Placed</p>
                <p>{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                <p>User ID: {order.userId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p>${order.totalCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customer ID</p>
              <p>{order.userId}</p>
            </div>
            {/* You would add more customer details here if available */}
            <Button variant="outline" size="sm">
              View Customer Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Business Page</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.orderItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.product.name}</TableCell>
                  <TableCell>{item.product.businessPageId}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${(order.totalCost / order.orderItems.length).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {/* <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-medium">${order.totalCost.toFixed(2)}</TableCell>
              </TableRow> */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Print Invoice</Button>
        <Button>Mark as Shipped</Button>
      </div>
    </div>
  )
}

