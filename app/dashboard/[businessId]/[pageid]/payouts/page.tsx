import { Suspense } from "react"
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns"
import PayoutsDashboardClient from "./payouts-dashboard-client"
import { PayoutsPageSkeleton } from "./payouts-skeleton"
import { getOrdersByBusinessPage } from "@/app/api/business/order/order"
import { getPayoutsForBusinessPage } from "@/app/api/business/payouts"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// This is the server component that fetches data
export default async function PayoutsPage({
  searchParams,
  params
}: {
  searchParams: {
    from?: string
    to?: string
    filter?: string
    businessPageId?: string
  },
  params:{
    pageid:string,
    businessId:string
  }
}) {
  const businessId=params.businessId

  const session=await getServerSession(authOptions)
  // Get query parameters with defaults
  const filterType = searchParams.filter || "week"
  const businessPageId = params.pageid

  // Calculate date range based on filter type or provided dates
  const today = new Date()
  let fromDate: Date
  let toDate: Date

  if (searchParams.from && searchParams.to) {
    fromDate = new Date(searchParams.from)
    toDate = new Date(searchParams.to)
  } else {
    // Default date ranges based on filter type
    switch (filterType) {
      case "today":
        fromDate = today
        toDate = today
        break
      case "yesterday":
        fromDate = subDays(today, 1)
        toDate = subDays(today, 1)
        break
      case "week":
        fromDate = subDays(today, 7)
        toDate = today
        break
      case "month":
        fromDate = startOfMonth(today)
        toDate = endOfMonth(today)
        break
      case "last-month":
        const lastMonth = subMonths(today, 1)
        fromDate = startOfMonth(lastMonth)
        toDate = endOfMonth(lastMonth)
        break
      default:
        fromDate = subDays(today, 7)
        toDate = today
        break
    }
  }

  // Server-side data fetching
  const [ordersResult, payoutsResult] = await Promise.all([
    getOrdersByBusinessPage(businessPageId),
    getPayoutsForBusinessPage(businessPageId),
  ])

  console.log("Payouts API result:", payoutsResult)
  // console.log("Orders API result:", ordersResult)

  let orders = []
  let payouts = []
  let daysWithPayouts = 0

  // Process orders data
  if (ordersResult && ordersResult.success) {
    // Filter orders based on date range
    orders = ordersResult.data.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startOfDay(fromDate) && orderDate <= endOfDay(toDate)
    })

    console.log(`Found ${orders.length} orders after date filtering`)
  }

  // Process payouts data - prioritize actual payouts from API
  if (payoutsResult && Array.isArray(payoutsResult)) {
    // Filter payouts based on date range
    payouts = payoutsResult.filter((payout) => {
      const payoutDate = new Date(payout.payoutForDate || payout.createdAt)
      return payoutDate >= startOfDay(fromDate) && payoutDate <= endOfDay(toDate)
    })

    console.log(`Found ${payouts.length} payouts after date filtering`)
  }
  // If no payouts from API or empty array, generate from orders
  else if (orders.length > 0) {
    // Generate payouts based on orders (grouped by day)
    const payoutsByDay = {}
    orders.forEach((order) => {
      const day = format(new Date(order.createdAt), "yyyy-MM-dd")
      if (!payoutsByDay[day]) {
        payoutsByDay[day] = {
          id: `generated-${day}`,
          payout_id: `payout-${day}-${Math.random().toString(36).substring(2, 10)}`,
          businessPageId: businessPageId,
          payoutForDate: new Date(day).toISOString(),
          payoutAmount: 0,
          orderCount: 0,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        }
      }

      // Group order items by product ID and sum quantities
      const productGroups = {}
      order.orderItems.forEach((item) => {
        const productId = item.product.id
        if (!productGroups[productId]) {
          productGroups[productId] = {
            quantity: 0,
            price: item.product.price || 0,
            product: item.product,
          }
        }
        productGroups[productId].quantity += item.quantity
      })

      // Calculate the total for this business's items in the order
      const businessItemsTotal = Object.values(productGroups).reduce((sum, group: any) => {
        return sum + group.quantity * group.price
      }, 0)

      payoutsByDay[day].payoutAmount += businessItemsTotal
      payoutsByDay[day].orderCount += 1
    })

    payouts = Object.values(payoutsByDay)
  }

  // Calculate summary metrics
  const totalPayoutAmount = payouts.reduce((sum, payout: any) => {
    return sum + (typeof payout.payoutAmount === "number" ? payout.payoutAmount : 0)
  }, 0)
  // console.log("this is orders",orders)
  const totalOrderCount = orders.length

  // Count days with payouts
  const uniqueDays = new Set()
  payouts.forEach((payout) => {
    const date = payout.payoutForDate || payout.createdAt
    if (date) {
      uniqueDays.add(format(new Date(date), "yyyy-MM-dd"))
    }
  })
  daysWithPayouts = uniqueDays.size

  // Format dates for the client component
  const dateRange = {
    from: format(fromDate, "yyyy-MM-dd"),
    to: format(toDate, "yyyy-MM-dd"),
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Payouts Dashboard</h1>
      <Suspense fallback={<PayoutsPageSkeleton />}>
        <PayoutsDashboardClient
          orders={ordersResult}
          payouts={payoutsResult}
          dateRange={dateRange}
          filterType={filterType}
          totalPayoutAmount={totalPayoutAmount}
          totalOrderCount={totalOrderCount}
          daysWithPayouts={daysWithPayouts}
          businessPageId={businessPageId}
          businessId={businessId}
          userEmail={session.user.email}
        />
      </Suspense>
    </div>
  )
}
