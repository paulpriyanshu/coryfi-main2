"use server"
import db from "@/db"
import { categories } from "./categories"

// ✅ Fetch analytics with user interests
export async function getAnalyticsData() {
  try {
    const allUsers = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        findPaths: true,
        premium: true,
        interestSubcategories: {
          select: {
            subcategory: {
              select: {
                id: true,
                name: true,
                category: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
    })

    const totalUsers = allUsers.length
    const activeUsers = allUsers.filter((user) => user.findPaths > 0).length
    const totalFindPaths = allUsers.reduce((sum, user) => sum + user.findPaths, 0)
    const averagePerUser = activeUsers > 0 ? totalFindPaths / activeUsers : 0

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

    const topUsers = allUsers
      .filter((user) => user.findPaths > 0)
      .sort((a, b) => b.findPaths - a.findPaths)
      .slice(0, 10)
      .map((user) => ({
        name: user.name,
        findPaths: user.findPaths,
        interests: user.interestSubcategories.map((i) => ({
          category: i.subcategory.category.name,
          subcategory: i.subcategory.name
        }))
      }))

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

    const userDetails = allUsers
      .filter((user) => user.findPaths > 0)
      .sort((a, b) => b.findPaths - a.findPaths)
      .map((user) => ({
        ...user,
        interests: user.interestSubcategories.map((i) => ({
          category: i.subcategory.category.name,
          subcategory: i.subcategory.name
        }))
      }))

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

// ✅ Export analytics with interests
export async function exportAnalyticsData(format: "csv" | "json") {
  try {
    const data = await getAnalyticsData()
    const timestamp = new Date().toISOString().split("T")[0]

    if (format === "csv") {
      const csvHeaders = "Name,Email,FindPaths,Premium,Interests,Status\n"
      const csvData = data.userDetails
        .map((user) => {
          const interestsStr = user.interests
            .map((i) => `${i.category} - ${i.subcategory}`)
            .join("; ")
          return `"${user.name}","${user.email}",${user.findPaths},${user.premium ? "Yes" : "No"},"${interestsStr}","Active"`
        })
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

// ✅ Get single user with interests
export async function getPathsData(userEmail: string) {
  try {
    const user = await db.user.findFirst({
      where: { email: userEmail },
      include: {
        interestSubcategories: {
          select: {
            subcategory: {
              select: {
                id: true,
                name: true,
                category: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return {
      ...user,
      interests: user?.interestSubcategories.map((i) => ({
        category: i.subcategory.category.name,
        subcategory: i.subcategory.name
      })) || []
    }
  } catch (error) {
    console.error("Error fetching paths data:", error)
    throw new Error("Failed to fetch paths data")
  }
}


export async function seedInterests() {
  
  // console.log("seeding",JSON.stringify(categories,null,2))

 for (const category of categories) {
  let existingCategory = await db.interestCategory.findFirst({
    where: { name: category.name },
    include: { subcategories: { include: { segments: true } } }
  });

  if (!existingCategory) {
    // Category doesn't exist → create with everything
    existingCategory = await db.interestCategory.create({
      data: {
        name: category.name,
        subcategories: {
          create: category.subcategories.map((sub) => ({
            name: sub.name,
            segments: {
              create: sub.segments.map((seg) => ({ name: seg.name })),
            },
          })),
        },
      },
    });
  } else {
    // Category exists → check subcategories
    for (const sub of category.subcategories) {
      let existingSub = existingCategory.subcategories.find(
        (s) => s.name === sub.name
      );

      if (!existingSub) {
        // Subcategory missing → create it
        await db.interestSubcategory.create({
          data: {
            name: sub.name,
            categoryId: existingCategory.id,
            segments: {
              create: sub.segments.map((seg) => ({ name: seg.name })),
            },
          },
        });
      } else {
        // Subcategory exists → check segments
        for (const seg of sub.segments) {
          const hasSeg = existingSub.segments.some((s) => s.name === seg.name);
          if (!hasSeg) {
            await db.segment.create({
              data: {
                name: seg.name,
                subcategoryId: existingSub.id,
              },
            });
          }
        }
      }
    }
  }
}
  return { message: "Interest categories seeded successfully." };
}

export const getCategories = async () => {
  const interests = await db.interestCategory.findMany({
    select: {
      id: true,
      name: true, // category name
      subcategories: {
        select: {
          id: true,
          name: true, // subcategory name
          segments: {
            select: {
              id: true,
              name: true // segment name
            }
          }
        }
      }
    }
  });

  console.log("Fetched interests:", JSON.stringify(interests, null, 2));
  return interests;
};