import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { get_new_requests, get_requests } from "@/app/api/actions/network"
import ConnectionRequestsList from "./connection-request-list"
import Header from "./header"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

// Custom Loader Component
function Loader() {
  return (
    <div className="flex justify-center items-center h-40">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )
}

// Fetch connection requests separately
async function FetchRequests({ userEmail, userName }: { userEmail: string; userName: string }) {
  await get_new_requests(userEmail)
  const notifications = await get_requests(userEmail)
  const sortedNotifications = notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return <ConnectionRequestsList initialRequests={sortedNotifications} userEmail={userEmail} userName={userName} />
}

export default async function ConnectionRequestsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return <div className="text-center text-gray-700 text-lg">Please sign in to view your connection requests.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-4">
        <Suspense fallback={<Loader />}>
          <FetchRequests userEmail={session.user.email} userName={session.user.name} />
        </Suspense>
      </main>
    </div>
  )
}