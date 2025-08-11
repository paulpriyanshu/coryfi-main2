import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { ExportButton } from "@/components/export-button" 
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"

export default async function AnalyticsPage() {
    const session=await getServerSession(authOptions)
    const authorized_mails=["priyanshu.paul003@gmail.com","sgarvit22@gmail.com"]
    if(!authorized_mails.includes(session?.user?.email)){
        return (
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center font-medium">
            🚫 You are not authorized to view this page.
        </div>
        )
    }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">FindPaths Analytics</h1>
          <p className="text-muted-foreground">
            Track user engagement and findPaths usage across your platform
          </p>
        </div>
        <ExportButton />
      </div>

      <Suspense fallback={<AnalyticsLoading />}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  )
}

function AnalyticsLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px] mb-2" />
            <Skeleton className="h-3 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
