'use client'

import { useEffect, useState } from 'react'
import OrdersDashboard from './order-dashboard'
import { getOrdersByBusinessPage } from '@/app/api/business/order/order'
// import { fetchOrdersServer } from '@/app/actions/get-orders' // adjust path accordingly

interface OrdersPageProps {
  params: {
    businessId: string
    pageid: string
  }
}

export default function OrdersPage({ params }: OrdersPageProps) {
  const { businessId, pageid } = params
  const [ordersData, setOrdersData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const data = await getOrdersByBusinessPage(pageid)
      setOrdersData(data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching orders:", err)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)

    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>Loading orders...</div>

  return (
    <OrdersDashboard
      ordersData={ordersData}
      pageId={pageid}
      businessId={businessId}
    />
  )
}