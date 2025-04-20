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
import { Download, MoreHorizontal } from "lucide-react"
import { markPayoutAsPaid } from "@/app/api/business/payouts"
import { toast } from 'react-hot-toast'  // Importing react-hot-toast

export function PayoutsTable({ payouts, isLoading, userEmail, businessId, businessPageId }) {
  const [page, setPage] = useState(1)
  const [loadingPayout, setLoadingPayout] = useState<string | null>(null)  // Track which payout is being processed
  const pageSize = 10
  const totalPages = Math.ceil(payouts.length / pageSize)

  const sortedPayouts = [...payouts].sort((a, b) => {
    try {
      const dateA = new Date(a.payoutForDate || a.createdAt)
      const dateB = new Date(b.payoutForDate || b.createdAt)
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0
      if (isNaN(dateA.getTime())) return 1
      if (isNaN(dateB.getTime())) return -1
      return dateB.getTime() - dateA.getTime()
    } catch (error) {
      return 0
    }
  })

  const paginatedPayouts = sortedPayouts.slice((page - 1) * pageSize, page * pageSize)

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Payout ID</TableHead>
              <TableHead>Amount</TableHead>
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
                    <Skeleton className="h-5 w-[150px]" />
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

  if (!payouts || payouts.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No payouts found for the selected period.</p>
      </div>
    )
  }

  const handlePayoutClick = async (id: string) => {
    try {
      setLoadingPayout(id)  // Set the loading state for the specific payout
      await markPayoutAsPaid(id, businessPageId, businessId)
      toast.success(`Payout ${id} marked as paid!`)  // Show success toast
      console.log(`✅ Payout ${id} marked as paid.`)
      setLoadingPayout(null)  // Reset the loading state
    } catch (error) {
      console.error("❌ Failed to mark payout as paid:", error)
      toast.error("Failed to mark payout as paid.")  // Show error toast
      setLoadingPayout(null)  // Reset the loading state
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Payout ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPayouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell className="font-medium">
                  {(() => {
                    const dateValue = payout.payoutForDate || payout.createdAt
                    if (!dateValue) return "N/A"
                    const date = new Date(dateValue)
                    if (isNaN(date.getTime())) return "Invalid date"
                    return format(date, "MMM dd, yyyy")
                  })()}
                </TableCell>
                <TableCell className="font-mono text-xs">{payout.payout_id}</TableCell>
                <TableCell>
                  {payout.payoutAmount === undefined || payout.payoutAmount === null
                    ? "$0.00"
                    : `$${Number(payout.payoutAmount).toFixed(2)}`}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payout.status === "PAID"
                        ? "success"
                        : payout.status === "PENDING"
                        ? "outline"
                        : "secondary"
                    }
                  >
                    {payout.status}
                  </Badge>
                  {userEmail === "priyanshu.paul003@gmail.com" && (
                    <Button
                      className="ml-5"
                      disabled={payout.status === "PAID" || loadingPayout === payout.payout_id}  // Disable if already processing or paid
                      onClick={() => handlePayoutClick(payout.payout_id)}
                    >
                      {loadingPayout === payout.payout_id ? (
                        <span className="animate-spin">...</span>  // Show loading spinner
                      ) : (
                        "Mark Paid"
                      )}
                    </Button>
                  )}
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
                        <Download className="mr-2 h-4 w-4" />
                        Download statement
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View details</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
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