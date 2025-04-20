import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Calendar, MapPin, Phone, Printer, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function OrderDetailsPage({ params}) {
  // console.log("order params",params)
  const businessId=params.businessId
  const pageId=params.pageid
  // This would normally be fetched from your database
  const order = {
    id: params.id,
    status: "Processing",
    date: "March 31, 2025",
    customer: {
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, Apt 4B, New York, NY 10001",
    },
    items: [
      {
        id: "1",
        name: "Custom Birthday Cake",
        image: "/placeholder.svg?height=80&width=80",
        price: 45.99,
        quantity: 1,
        customizations: [
          { name: "Flavor", value: "Chocolate", price: 0 },
          { name: "Size", value: 'Medium (8")', price: 5.0 },
          { name: "Frosting", value: "Buttercream", price: 2.5 },
          { name: "Message", value: "Happy Birthday Sarah!", price: 3.0 },
        ],
      },
      {
        id: "2",
        name: "Cupcake Box",
        image: "/placeholder.svg?height=80&width=80",
        price: 18.99,
        quantity: 2,
        customizations: [
          { name: "Flavors", value: "Assorted (6 pcs)", price: 0 },
          { name: "Toppings", value: "Sprinkles", price: 1.5 },
        ],
      },
    ],
    subtotal: 89.97,
    tax: 7.2,
    shipping: 5.99,
    total: 103.16,
  }

  // Calculate totals for each item including customizations
  const getItemTotal = (item: any) => {
    const customizationTotal = item.customizations.reduce((sum: number, custom: any) => sum + custom.price, 0)
    return (item.price + customizationTotal) * item.quantity
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href={`/dashboard/${businessId}/${pageId}/orders/`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <Badge
            variant={order.status === "Completed" ? "success" : order.status === "Processing" ? "default" : "secondary"}
          >
            {order.status}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Select defaultValue={order.status}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center text-sm text-muted-foreground">
        <Calendar className="mr-1 h-4 w-4" />
        Order placed on {order.date}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Products ordered with customizations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Customizations</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {item.customizations.map((custom: any, index: number) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{custom.name}:</span> {custom.value}
                              {custom.price > 0 && (
                                <span className="text-muted-foreground ml-1">(+${custom.price.toFixed(2)})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${getItemTotal(item).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="font-medium">Contact Details</div>
                  </div>
                  <div className="pl-6 space-y-1">
                    <div>{order.customer.name}</div>
                    <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="mr-1 h-3 w-3" />
                      {order.customer.phone}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="font-medium">Shipping Address</div>
                  </div>
                  <div className="pl-6 text-sm">
                    {order.customer.address.split(", ").map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Mark as Completed</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span>Credit Card</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Card</span>
                  <span>•••• •••• •••• 4242</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="success">Paid</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

