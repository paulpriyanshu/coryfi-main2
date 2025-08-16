"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import TaskComponent from "./task-component"
import { fetchUserId } from "@/app/api/actions/media"
// import { getAllBusinessTasksForEmployee } from "@/lib/get-all-business-tasks-for-employee"
import { getAllBusinessTasksForEmployee } from "@/app/api/actions/employees"
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
  isCurrentAssignment?: boolean
  order: {
    id: string
    order_id: string
    userId: string
    username: string
    userPhone: string
    userAddress: any
    totalCost: number
    status: string
    fulfillmentStatus: string
    address: string
    createdAt: string
    updatedAt: string
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
      recieveBy: string
    }>
  }
}

interface TaskData {
  data: Task[]
}

export default function TaskPageWithTabs() {
  const { data: session, status } = useSession()
  const [allTasks, setAllTasks] = useState<TaskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("assigned")
  const [userId, setUserId] = useState<number | null>(null)

  const fetchAllTasks = useCallback(async (userId: number) => {
    try {
      console.log("Fetching all business tasks for user:", userId)

      const result = await getAllBusinessTasksForEmployee(userId)
      console.log("all tasks",result)

      if (result.success) {
        // Transform the data to match the expected Task interface
        const transformedTasks: Task[] = result.data.map((task: any) => ({
          id: task.id.toString(),
          task_id: task.task_id,
          name: task.name,
          status: task.status,
          employeeId: task.employeeId?.toString() || null,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          employee: task.employee,
          businessId: task.businessId,
          isCurrentAssignment: task.isCurrentAssignment,
          order: {
            id: task.order.id.toString(),
            order_id: task.order.order_id,
            userId: task.order.userId.toString(),
            username: task.order.username,
            userPhone: task.order.userPhone,
            userAddress: task.order.userAddress,
            totalCost: task.order.totalCost,
            status: task.order.status,
            fulfillmentStatus: task.order.fulfillmentStatus,
            address: task.order.address,
            createdAt: task.order.createdAt,
            updatedAt: task.order.updatedAt,
            orderItems: task.order.orderItems.map((item: any) => ({
              id: item.id.toString(),
              quantity: item.quantity,
              customization: item.customization,
              details: item.details,
              otp: item.otp,
              productFulfillmentStatus: item.productFulfillmentStatus,
              outForDelivery: item.outForDelivery,
              productId: item.product?.id?.toString() || "",
              productName: item.product?.name || "",
              businessName: item.businessName,
              businessImage: item.businessImage,
              recieveBy: item.recieveBy,
            })),
          },
        }))

        setAllTasks({ data: transformedTasks })
        console.log("Successfully fetched and transformed tasks:", transformedTasks.length)
      } else {
        console.error("Failed to fetch tasks:", result.message)
        setError(result.message)
        setAllTasks({ data: [] })
      }
    } catch (error) {
      console.error("Error fetching all business tasks:", error)
      setError("Failed to fetch tasks")
      setAllTasks({ data: [] })
    }
  }, [])

  const initializeTasks = useCallback(async () => {
    try {
      if (!session?.user?.email) return

      const userData = await fetchUserId(session.user.email)
      setUserId(userData.id)
      await fetchAllTasks(userData.id)
    } catch (error) {
      console.error("Error initializing tasks:", error)
      setError("Failed to initialize tasks")
    }
  }, [session?.user?.email, fetchAllTasks])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await initializeTasks()
    } catch (error) {
      setError("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }, [initializeTasks])

  useEffect(() => {
    if (status === "authenticated") {
      console.log("Authentication status:", status)
      fetchTasks()
    }
  }, [status, fetchTasks])

  const getAssignedTasks = (): Task[] => {
    if (!allTasks?.data || !userId) return []

    return allTasks.data.filter((task) => task.employeeId === userId.toString() && task.isCurrentAssignment)
  }

  const getAllOrderTasks = (): Task[] => {
    return allTasks?.data || []
  }

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

  const assignedTasks = getAssignedTasks()
  const allOrderTasks = getAllOrderTasks()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <div className="flex gap-2">
          <Badge variant="outline">Assigned: {assignedTasks.length}</Badge>
          <Badge variant="outline">All Orders: {allOrderTasks.length}</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            Your Tasks
            {assignedTasks.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {assignedTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            All Orders
            {allOrderTasks.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {allOrderTasks.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Assigned Tasks</h2>
              <Badge variant="outline">{assignedTasks.length} tasks</Badge>
            </div>
            {assignedTasks.length > 0 ? (
              <TaskComponent sampleData={{ data: assignedTasks }} />
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
              <h2 className="text-lg font-semibold">All Orders</h2>
              <Badge variant="outline">{allOrderTasks.length} orders</Badge>
            </div>
            {allOrderTasks.length > 0 ? (
              <AllOrdersComponent orders={allOrderTasks} />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <h3 className="text-xl font-medium">No orders available</h3>
                  <p className="text-muted-foreground mt-2">There are currently no orders in the system.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
