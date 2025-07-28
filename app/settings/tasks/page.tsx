"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import TaskComponent from "./task-component"
import { getAssignedTasksForEmployee } from "@/app/api/actions/employees"
import { fetchUserId } from "@/app/api/actions/media"
import { getLatestOrdersByBusinessPage } from "@/app/api/business/order/order"
import AllOrdersComponent from "./all-orders-component"

interface Task {
  id: string
  task_id: string
  name: string
  status: string
  employeeId: string | null
  createdAt: string
  updatedAt: string
  employee: any
  businessId: string
  order: {
    id: string
    order_id: string
    userId: string
    totalCost: number
    fulfillmentStatus: string
    orderDate: string
    orderItems: Array<{
      id: string
      quantity: number
      customization: string
      details: any
      otp: string
      productFulfillmentStatus: string
      outForDelivery: boolean
      productId: string
      productName: string
      businessName: string
      businessImage: string
    }>
  }
}

interface TaskData {
  data: Task[]
}

export default function TaskPageWithTabs() {
  const { data: session, status } = useSession()
  const [assignedTasks, setAssignedTasks] = useState<TaskData | null>(null)
  const [allTasks, setAllTasks] = useState<TaskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("assigned")
  const [businessIds, setBusinessIds] = useState<string[]>([])

  const fetchAllTasks = async (businessIds: string[]) => {
    try {
      console.log("fetchAllTasks called with businessIds:", businessIds)

      if (!businessIds || businessIds.length === 0) {
        console.log("No business IDs available")
        setAllTasks({ data: [] })
        return
      }

      const allTasksData: any[] = []

      // Use Promise.allSettled for better error handling
      const results = await Promise.allSettled(
        businessIds.map((businessId) => getLatestOrdersByBusinessPage(businessId)),
      )

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value?.data?.length > 0) {
          console.log(`Fetched tasks for ${businessIds[index]}:`, result.value.data)
          allTasksData.push(...result.value.data)
        } else if (result.status === "rejected") {
          console.error(`Error fetching for business ${businessIds[index]}:`, result.reason)
        }
      })

      console.log("Final All Tasks Data:", allTasksData)

      // Set raw order data instead of transforming
      setAllTasks({ data: allTasksData })
    } catch (error) {
      console.error("Error in fetchAllTasks:", error)
      setError("Failed to fetch all tasks")
    }
  }

  const fetchAssignedTasks = useCallback(async () => {
    try {
      if (!session?.user?.email) return

      const userData = await fetchUserId(session.user.email)
      const taskData = await getAssignedTasksForEmployee(userData.id)
      const businessIds = [...new Set(taskData.data.map((task: any) => task.businessId))]

      console.log("businessIds", businessIds)
      setBusinessIds(businessIds)
      setAssignedTasks(taskData)

      // Call fetchAllTasks with the businessIds
      await fetchAllTasks(businessIds)
    } catch (error) {
      console.error("Error fetching assigned tasks:", error)
      setError("Failed to fetch assigned tasks")
    }
  }, [session?.user?.email])

  // Transform the all tasks data structure to match TaskComponent expectations
  const transformAllTasksData = (allTasksResponse: any): Task[] => {
    if (!allTasksResponse?.data) return []

    const transformedTasks: Task[] = []
    const processedOrders = new Set<string>()

    allTasksResponse.data.forEach((order: any) => {
      // Skip duplicate orders
      if (processedOrders.has(order.id)) {
        return
      }
      processedOrders.add(order.id)

      // If order has tasks, process each task
      if (order.tasks && order.tasks.length > 0) {
        order.tasks.forEach((task: any) => {
          const transformedTask: Task = {
            id: task.id,
            task_id: task.task_id || task.name,
            name: task.name,
            status: task.status,
            employeeId: task.employeeId,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            employee: task.employee,
            businessId: task.employee?.businessId,
            order: {
              id: order.id,
              order_id: order.order_id,
              userId: order.userId,
              totalCost: order.totalCost,
              fulfillmentStatus: order.fulfillmentStatus,
              orderDate: order.createdAt,
              orderItems:
                order.orderItems?.map((item: any) => ({
                  id: item.id,
                  quantity: item.quantity,
                  customization: item.customization,
                  details: item.details,
                  otp: item.OTP,
                  productFulfillmentStatus: item.productFulfillmentStatus,
                  outForDelivery: item.outForDelivery,
                  productId: item.product?.id,
                  productName: item.product?.name,
                  businessName: item.product?.businessPageId,
                  businessImage: item.details?.images?.[0] || "/placeholder.svg",
                })) || [],
            },
          }
          transformedTasks.push(transformedTask)
        })
      } else {
        // Create placeholder task for orders without assigned tasks
        const placeholderTask: Task = {
          id: `order-${order.id}`,
          task_id: order.order_id,
          name: `Order ${order.order_id}`,
          status: "unassigned",
          employeeId: null,
          createdAt: order.createdAt,
          updatedAt: order.createdAt,
          employee: null,
          businessId: order.orderItems?.[0]?.product?.businessPageId || null,
          order: {
            id: order.id,
            order_id: order.order_id,
            userId: order.userId,
            totalCost: order.totalCost,
            fulfillmentStatus: order.fulfillmentStatus,
            orderDate: order.createdAt,
            orderItems:
              order.orderItems?.map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                customization: item.customization,
                details: item.details,
                otp: item.OTP,
                productFulfillmentStatus: item.productFulfillmentStatus,
                outForDelivery: item.outForDelivery,
                productId: item.product?.id,
                productName: item.product?.name,
                businessName: item.product?.businessPageId,
                businessImage: item.details?.images?.[0] || "/placeholder.svg",
              })) || [],
          },
        }
        transformedTasks.push(placeholderTask)
      }
    })

    return transformedTasks
  }

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await fetchAssignedTasks()
    } catch (error) {
      setError("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }, [fetchAssignedTasks])

  useEffect(() => {
    if (status === "authenticated") {
      console.log("status", status)
      fetchTasks()
    }
  }, [status, fetchTasks])

  if (status === "loading") {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertDescription>Please sign in to view your tasks.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <div className="flex gap-2">
          <Badge variant="outline">Assigned: {assignedTasks?.data?.length || 0}</Badge>
          <Badge variant="outline">All Tasks: {allTasks?.data?.length || 0}</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            Tasks Assigned to Me
            {assignedTasks?.data?.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {assignedTasks.data.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            All Tasks
            {allTasks?.data?.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {allTasks.data.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Assigned Tasks</h2>
              <Badge variant="outline">{assignedTasks?.data?.length || 0} tasks</Badge>
            </div>
            {assignedTasks?.data?.length > 0 ? (
              <TaskComponent sampleData={assignedTasks} />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <h3 className="text-xl font-medium">No tasks assigned</h3>
                  <p className="text-muted-foreground mt-2">You currently have no delivery tasks assigned to you.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Tasks</h2>
              <Badge variant="outline">{allTasks?.data?.length || 0} tasks</Badge>
            </div>
            {allTasks?.data?.length > 0 ? (
              <AllOrdersComponent orders={allTasks.data} />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <h3 className="text-xl font-medium">No tasks available</h3>
                  <p className="text-muted-foreground mt-2">There are currently no tasks in the system.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
