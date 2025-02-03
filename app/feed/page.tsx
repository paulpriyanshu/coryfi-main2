import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import EnhancedInfiniteScrollNetwork from "./EnhancedInfiniteScrollNetwork"
import { fetchImages, fetchUserId } from "@/app/api/actions/media"
import LeftSidebar from "@/components/ui/sections/LeftSideBar"
import RightSidebar from "@/components/RightSidebar"
import SearchBar from "@/components/ui/sections/SearchBar"

export default async function Page() {
  const session = await getServerSession(authOptions)

  // Redirect to /signup if user is not logged in
  if (!session) {
    redirect("/signup")
  }

  const initialPosts = await fetchImages()
  const userId = session.user.email ? await fetchUserId(session.user.email) : null

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-[1440px] mx-auto py-4 px-3 sm:px-4 lg:px-5">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-4">
              <LeftSidebar userEmail={session.user.email} />
            </div>
          </div>
          <div className="lg:col-span-3 space-y-5">
            <SearchBar />
            <EnhancedInfiniteScrollNetwork initialPosts={initialPosts} session={session} userId={userId} />
          </div>
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-4">
              <RightSidebar session={session} user={session.user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}