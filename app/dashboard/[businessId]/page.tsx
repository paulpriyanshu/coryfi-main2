import { Suspense } from "react"
import { BusinessPageList, BusinessPageGrid } from "./BusinessPageViews"
import { BusinessPageViewSelector } from "./BusinessPageViewSelector"
import { getAllBusinessPage } from "@/app/api/business/business"

export default async function AdminDashboard({params}) {
  const businessPages = await getAllBusinessPage(params.businessId)
  console.log(params)
//   console.log("business pages",businessPages)

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Business Pages</h1>
        <p className="text-muted-foreground">Manage and monitor all your business pages in one place</p>
      </header>

      <Suspense fallback={<p>Loading...</p>}>
        <BusinessPageViewSelector businessPages={businessPages.pageData} businessId={params.businessId} />
      </Suspense>
    </div>
  )
}