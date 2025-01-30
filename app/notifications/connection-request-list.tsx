import type { Request } from "./types"
import ConnectionRequestItem from "./connection-request-item"

interface ConnectionRequestsListProps {
  initialRequests: Request[]
  userEmail: string
  userName: string
}

export default function ConnectionRequestsList({ initialRequests, userEmail, userName }: ConnectionRequestsListProps) {
  if (initialRequests.length === 0) {
    return <div className="text-center py-4 text-gray-500">No notifications</div>
  }

  return (
    <ul className="space-y-2">
      {initialRequests.map((request) => (
        <ConnectionRequestItem key={request.id} request={request} userEmail={userEmail} userName={userName} />
      ))}
    </ul>
  )
}

