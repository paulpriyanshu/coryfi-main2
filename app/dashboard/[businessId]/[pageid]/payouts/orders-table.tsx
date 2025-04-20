"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, MoreHorizontal } from "lucide-react"

export function OrdersTable({ orders, isLoading }) {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(orders.length / pageSize)

  const paginatedOrders = orders.slice((page - 1) * pageSize, page * pageSize)

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[50px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[80px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-[40px] ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No orders found for the selected period.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => {
              // Group order items by product ID and sum quantities
              const productGroups = {}

              order.orderItems.forEach((item) => {
                const productId = item.product.id
                if (!productGroups[productId]) {
                  productGroups[productId] = {
                    quantity: 0,
                    price: item.details.price || 0, // Only use the price from the product
                    product: item.product,
                  }
                }
                productGroups[productId].quantity += item.quantity
              })
              console.log("product group",productGroups)

              // Calculate the total for this business's items in the order
              const businessItemsTotal = Object.values(productGroups).reduce((sum, group: any) => {
                return sum + group.quantity * group.price // Only multiply quantity by price
              }, 0)

              // Count unique products after grouping
              const uniqueItemCount = Object.keys(productGroups).length
              const totalItemCount = Object.values(productGroups).reduce((sum, group: any) => sum + group.quantity, 0)

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_id}</TableCell>
                  <TableCell>{format(new Date(order.createdAt), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    {uniqueItemCount} {uniqueItemCount !== totalItemCount && `(${totalItemCount} items)`}
                  </TableCell>
                  <TableCell>${businessItemsTotal.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={order.fulfillmentStatus === "completed" ? "success" : "outline"}>
                      {order.fulfillmentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Download invoice</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" onClick={() => setPage(page > 1 ? page - 1 : 1)} disabled={page === 1}>
            Previous
          </Button>
          <div className="text-sm">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
