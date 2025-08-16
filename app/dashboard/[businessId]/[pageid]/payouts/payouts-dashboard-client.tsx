"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { CalendarIcon, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/Input"
import { OrdersTable } from "./orders-table"
import { PayoutsTable } from "./payouts-table"

export default function PayoutsDashboardClient({
  orders,
  payouts,
  dateRange,
  filterType,
  totalPayoutAmount,
  totalOrderCount,
  daysWithPayouts,
  businessPageId,
  businessId,
  userEmail,
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleDateChange = (type, value) => {
    const params = new URLSearchParams(searchParams)

    // Set the date value
    params.set(type, value)

    // Clear filter when custom dates are selected
    if (params.get("filter")) {
      params.delete("filter")
    }

    // Ensure both dates are present for proper filtering
    if (type === "from" && !params.get("to")) {
      // If setting 'from' date and no 'to' date exists, set 'to' to today
      const today = new Date().toISOString().split("T")[0]
      params.set("to", today)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleFilterChange = (type) => {
    const params = new URLSearchParams(searchParams)
    params.set("filter", type)

    // Clear custom date range when using preset filters
    if (params.get("from")) params.delete("from")
    if (params.get("to")) params.delete("to")

    router.push(`${pathname}?${params.toString()}`)
  }

  // Format date for input (ensure it's in YYYY-MM-DD format)
  // const formatDateForInput = (dateString) => {
  //   if (!dateString) return ""

  //   // If it's already in the correct format, return as is
  //   if (typeof dateString === "string" && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
  //     return dateString
  //   }
    

  //   // Try to parse and format the date
  //   try {
  //     const date = new Date(dateString)
  //     if (isNaN(date.getTime())) return ""
  //     return date.toISOString().split("T")[0]
  //   } catch {
  //     return ""
  //   }
  // }
  const formatDateForInput = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

  const dailyAverage = daysWithPayouts ? totalPayoutAmount / daysWithPayouts : 0
  const avgOrdersPerDay = daysWithPayouts ? totalOrderCount / daysWithPayouts : 0
  const avgOrderValue = totalOrderCount ? totalPayoutAmount / totalOrderCount : 0

  // Calculate pending and completed payouts with correct field names
  const completedPayouts = payouts.filter((payout) => payout.status === "PAID")

  const pendingPayouts = payouts.filter((payout) => payout.status === "PENDING" || payout.status !== "PAID")

  // Calculate total amounts using the correct field name 'payoutAmount'
  const completedPayoutAmount = completedPayouts.reduce((sum, payout) => {
    const amount = Number.parseFloat(payout.payoutAmount || 0)
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  const pendingPayoutAmount = pendingPayouts.reduce((sum, payout) => {
    const amount = Number.parseFloat(payout.payoutAmount || 0)
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  // Verify totals match
  const calculatedTotal = completedPayoutAmount + pendingPayoutAmount

  return (
    <div className="space-y-6 bg-background dark:bg-zinc-950 p-4 rounded-md">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground dark:text-zinc-400" />
              <span className="text-sm text-muted-foreground dark:text-zinc-300">From:</span>
            </div>
            <Input
              type="date"
              className="w-full sm:w-auto"
              value={formatDateForInput(dateRange.from)}
              onChange={(e) => handleDateChange("from", e.target.value)}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground dark:text-zinc-300">To:</span>
            </div>
            <Input
              type="date"
              className="w-full sm:w-auto"
              value={formatDateForInput(dateRange.to)}
              onChange={(e) => handleDateChange("to", e.target.value)}
            />
          </div>
          <Select value={filterType || ""} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="last-month">Last month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="bg-muted/50 dark:bg-zinc-800/50 rounded-lg p-4 border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground dark:text-white">Payout Summary</h3>
            <p className="text-sm text-muted-foreground dark:text-zinc-400">
              Overview of all payouts in selected period
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-muted-foreground dark:text-zinc-400">Pending:</span>
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                ${pendingPayoutAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground dark:text-zinc-400">Completed:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                ${completedPayoutAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-border dark:border-zinc-700">
              <span className="text-muted-foreground dark:text-zinc-400">Total:</span>
              <span className="font-bold text-foreground dark:text-white">
                ${(pendingPayoutAmount + completedPayoutAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground dark:text-white">Pending Payouts</CardTitle>
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            >
              {pendingPayouts.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              ${pendingPayoutAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground dark:text-zinc-400">
              {pendingPayouts.length} pending • Awaiting payment
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-1">Total pending amount</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground dark:text-white">Completed Payouts</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {completedPayouts.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${completedPayoutAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground dark:text-zinc-400">
              {completedPayouts.length} completed • Already paid
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">Total paid amount</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground dark:text-white">Total Payout</CardTitle>
            <Badge variant="outline">Selected period</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground dark:text-white">${totalPayoutAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground dark:text-zinc-400">
              For {totalOrderCount} orders in selected period
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground dark:text-white">Daily Average</CardTitle>
            <Badge variant="outline">Per day</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground dark:text-white">${dailyAverage.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground dark:text-zinc-400">
              Avg {avgOrdersPerDay.toFixed(1)} orders per day
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground dark:text-white">Total Orders</CardTitle>
            <Badge variant="outline">Selected period</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground dark:text-white">{totalOrderCount}</div>
            <p className="text-xs text-muted-foreground dark:text-zinc-400">{daysWithPayouts} days with payouts</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground dark:text-white">Average Order Value</CardTitle>
            <Badge variant="outline">Per order</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground dark:text-white">${avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground dark:text-zinc-400">For completed orders</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payouts" className="w-full">
        <TabsList>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="payouts" className="space-y-4">
          <PayoutsTable
            payouts={payouts}
            isLoading={false}
            userEmail={userEmail}
            businessPageId={businessPageId}
            businessId={businessId}
          />
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <OrdersTable orders={orders} isLoading={false} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
