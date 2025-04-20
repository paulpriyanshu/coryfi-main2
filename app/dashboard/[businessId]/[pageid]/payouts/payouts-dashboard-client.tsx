"use client"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { CalendarIcon, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  userEmail
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Handle date input changes
  const handleDateChange = (type, value) => {
    const params = new URLSearchParams(searchParams)
    params.set(type, value)

    // When manually changing dates, reset the filter type
    if (params.get("filter")) {
      params.delete("filter")
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  // Handle filter type changes
  const handleFilterChange = (type) => {
    const params = new URLSearchParams(searchParams)
    params.set("filter", type)

    // When using a filter, remove specific date params
    if (params.get("from")) params.delete("from")
    if (params.get("to")) params.delete("to")

    router.push(`${pathname}?${params.toString()}`)
  }

  // Calculate metrics for cards
  const dailyAverage = daysWithPayouts ? totalPayoutAmount / daysWithPayouts : 0
  const avgOrdersPerDay = daysWithPayouts ? totalOrderCount / daysWithPayouts : 0
  const avgOrderValue = totalOrderCount ? totalPayoutAmount / totalOrderCount : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">From:</span>
            </div>
            <Input
              type="date"
              className="w-full sm:w-auto"
              value={dateRange.from}
              onChange={(e) => handleDateChange("from", e.target.value)}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">To:</span>
            </div>
            <Input
              type="date"
              className="w-full sm:w-auto"
              value={dateRange.to}
              onChange={(e) => handleDateChange("to", e.target.value)}
            />
          </div>

          <Select value={filterType} onValueChange={handleFilterChange}>
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

        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
            <Badge variant="outline">Selected period</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPayoutAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">For {totalOrderCount} orders in selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <Badge variant="outline">Per day</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dailyAverage.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Avg {avgOrdersPerDay.toFixed(1)} orders per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Badge variant="outline">Selected period</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrderCount}</div>
            <p className="text-xs text-muted-foreground">{daysWithPayouts} days with payouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <Badge variant="outline">Per order</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">For completed orders</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payouts" className="w-full">
        <TabsList>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="payouts" className="space-y-4">
          <PayoutsTable payouts={payouts} isLoading={false} userEmail={userEmail} businessPageId={businessPageId} businessId={businessId}/>
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <OrdersTable orders={orders} isLoading={false} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
