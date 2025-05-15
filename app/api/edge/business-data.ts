// app/lib/edge/business-data.ts
import db from "@/db" // make sure this import is also edge-safe

export const getEdgeBusinessPageData = async (pageId: string) => {
  try {
    const pageData = await db.businessPageLayout.findFirst({
      where: { pageId },
      include: {
        categories: true,
        categoryCarousel: {
          select: {
            categories: true,
            products: true,
          }
        },
        products: true
      }
    })
    if (pageData) return { success: true, pageData }
    return { success: false, message: "Page not found" }
  } catch (error) {
    console.error("Edge DB Error:", error)
    return { success: false, error }
  }
}