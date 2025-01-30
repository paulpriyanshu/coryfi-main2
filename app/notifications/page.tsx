import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { get_new_requests, get_requests } from "@/app/api/actions/network"
import ConnectionRequestsList from "./connection-request-list"
import Header from "./header"

export default async function ConnectionRequestsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return <div>Please sign in to view your connection requests.</div>
  }

  try {
    await get_new_requests(session.user.email)
    const notifications = await get_requests(session.user.email)
    const sortedNotifications = notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-4">
          <ConnectionRequestsList
            initialRequests={sortedNotifications}
            userEmail={session.user.email}
            userName={session.user.name}
          />
        </main>
      </div>
    )
  } catch (error) {
    return <div>Failed to load notifications. Please try again later.</div>
  }
}

