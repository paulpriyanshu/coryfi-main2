"use server"

// Replace this mock db with your actual Prisma client
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getAnalyticsData() {
  try {
    // Get all users with their findPaths data
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        findPaths: true,
        premium: true,
      },
    })

    const totalUsers = allUsers.length
    const activeUsers = allUsers.filter((user) => user.findPaths > 0).length
    const totalFindPaths = allUsers.reduce((sum, user) => sum + user.findPaths, 0)
    const averagePerUser = activeUsers > 0 ? totalFindPaths / activeUsers : 0

    // Create distribution data
    const distributionRanges = [
      { range: "0", min: 0, max: 0 },
      { range: "1-5", min: 1, max: 5 },
      { range: "6-10", min: 6, max: 10 },
      { range: "11-20", min: 11, max: 20 },
      { range: "21+", min: 21, max: Number.POSITIVE_INFINITY },
    ]

    const distributionData = distributionRanges.map((range) => ({
      range: range.range,
      users: allUsers.filter((user) => user.findPaths >= range.min && user.findPaths <= range.max).length,
    }))

    // Get top users
    const topUsers = allUsers
      .filter((user) => user.findPaths > 0)
      .sort((a, b) => b.findPaths - a.findPaths)
      .slice(0, 10)
      .map((user) => ({
        name: user.name,
        findPaths: user.findPaths,
      }))

    // Create engagement data
    const engagementData = [
      {
        name: "Inactive",
        value: allUsers.filter((user) => user.findPaths === 0).length,
        color: "#ef4444",
        description: "0 findPaths",
      },
      {
        name: "Low",
        value: allUsers.filter((user) => user.findPaths >= 1 && user.findPaths <= 5).length,
        color: "#f97316",
        description: "1-5 findPaths",
      },
      {
        name: "Medium",
        value: allUsers.filter((user) => user.findPaths >= 6 && user.findPaths <= 15).length,
        color: "#eab308",
        description: "6-15 findPaths",
      },
      {
        name: "High",
        value: allUsers.filter((user) => user.findPaths > 15).length,
        color: "#22c55e",
        description: "15+ findPaths",
      },
    ]

    // User details for table
    const userDetails = allUsers.filter((user) => user.findPaths > 0).sort((a, b) => b.findPaths - a.findPaths)

    return {
      totalUsers,
      activeUsers,
      totalFindPaths,
      averagePerUser,
      distributionData,
      topUsers,
      engagementData,
      userDetails,
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    throw new Error("Failed to fetch analytics data")
  }
}

export async function exportAnalyticsData(format: "csv" | "json") {
  try {
    const data = await getAnalyticsData()
    const timestamp = new Date().toISOString().split("T")[0]

    if (format === "csv") {
      const csvHeaders = "Name,Email,FindPaths,Premium,Status\n"
      const csvData = data.userDetails
        .map((user) => `"${user.name}","${user.email}",${user.findPaths},${user.premium ? "Yes" : "No"},"Active"`)
        .join("\n")

      return {
        content: csvHeaders + csvData,
        filename: `findpaths-analytics-${timestamp}.csv`,
        mimeType: "text/csv",
      }
    } else {
      const exportData = {
        exportDate: new Date().toISOString(),
        summary: {
          totalUsers: data.totalUsers,
          activeUsers: data.activeUsers,
          totalFindPaths: data.totalFindPaths,
          averagePerUser: data.averagePerUser,
        },
        users: data.userDetails,
        distribution: data.distributionData,
        engagement: data.engagementData,
      }

      return {
        content: JSON.stringify(exportData, null, 2),
        filename: `findpaths-analytics-${timestamp}.json`,
        mimeType: "application/json",
      }
    }
  } catch (error) {
    console.error("Error exporting analytics data:", error)
    throw new Error("Failed to export analytics data")
  }
}

// Updated function to work with your existing getPathsData
export async function getPathsData(userEmail: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: userEmail },
    })
    return user
  } catch (error) {
    return error
  }
}
