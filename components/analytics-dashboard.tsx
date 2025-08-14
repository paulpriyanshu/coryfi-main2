"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, Activity, TrendingUp, Target, Sparkles, Database } from "lucide-react"
import { seedInterests,getAnalyticsData } from "@/app/pathAnalytics/analytics-actions"

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  totalFindPaths: number
  averagePerUser: number
  distributionData: Array<{ range: string; users: number }>
  topUsers: Array<{ name: string; findPaths: number; interests: Array<{ category: string; subcategory: string }> }>
  engagementData: Array<{ name: string; value: number; color: string; description: string }>
  userDetails: Array<{
    id: string
    name: string
    email: string
    findPaths: number
    premium: boolean
    interests: Array<{ category: string; subcategory: string }>
  }>
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const analyticsData = await getAnalyticsData()
      setData(analyticsData)
    } catch (error) {
      console.error("Failed to fetch analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeedInterests = async () => {
    setSeeding(true)
    try {
      await seedInterests()
      // Refresh data after seeding
      await fetchData()
    } catch (error) {
      console.error("Failed to seed interests:", error)
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>
  }

  if (!data) {
    return <div className="flex items-center justify-center h-64">Failed to load analytics data</div>
  }

  const chartConfig = {
    users: {
      label: "Users",
      color: "hsl(var(--chart-1))",
    },
    findPaths: {
      label: "FindPaths",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="space-y-6">
      {/* Seed Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSeedInterests}
          disabled={seeding}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Database className="w-4 h-4 mr-2" />
          {seeding ? "Seeding..." : "Seed Interest Categories"}
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered platform users</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((data.activeUsers / data.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total FindPaths</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalFindPaths.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Cumulative platform usage</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg per User</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averagePerUser.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">FindPaths per active user</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="engagement" className="text-xs sm:text-sm">
            Engagement
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm">
            Top Users
          </TabsTrigger>
          <TabsTrigger value="interests" className="text-xs sm:text-sm">
            User Interests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usage Distribution</CardTitle>
                <CardDescription>FindPaths usage across user segments</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.distributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="users" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement Levels</CardTitle>
                <CardDescription>Distribution of user activity levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.engagementData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.engagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-background border rounded-lg p-3 shadow-lg">
                                <p className="font-medium">{data.name}</p>
                                <p className="text-sm text-muted-foreground">{data.description}</p>
                                <p className="text-sm font-medium">{data.value} users</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid gap-4">
            {data.engagementData.map((segment, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: segment.color }} />
                      <span className="font-medium">{segment.name} Users</span>
                    </div>
                    <span className="text-2xl font-bold">{segment.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{segment.description}</p>
                  <Progress value={(segment.value / data.totalUsers) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {((segment.value / data.totalUsers) * 100).toFixed(1)}% of total users
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Top Performers
              </CardTitle>
              <CardDescription>Users with highest FindPaths usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.interests.slice(0, 3).map((interest, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {interest.category}
                            </Badge>
                          ))}
                          {user.interests.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.interests.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{user.findPaths}</p>
                      <p className="text-xs text-muted-foreground">FindPaths</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Interest Analysis</CardTitle>
              <CardDescription>Breakdown of user interests by categories and subcategories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* Group interests by category */}
                {Object.entries(
                  data.userDetails.reduce(
                    (acc, user) => {
                      user.interests.forEach((interest) => {
                        if (!acc[interest.category]) {
                          acc[interest.category] = {}
                        }
                        if (!acc[interest.category][interest.subcategory]) {
                          acc[interest.category][interest.subcategory] = 0
                        }
                        acc[interest.category][interest.subcategory]++
                      })
                      return acc
                    },
                    {} as Record<string, Record<string, number>>,
                  ),
                ).map(([category, subcategories]) => (
                  <Card key={category} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{category}</CardTitle>
                      <CardDescription>
                        {Object.values(subcategories).reduce((a, b) => a + b, 0)} users interested
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(subcategories)
                          .sort(([, a], [, b]) => b - a)
                          .map(([subcategory, count]) => (
                            <div key={subcategory} className="flex items-center justify-between">
                              <span className="text-sm font-medium">{subcategory}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
