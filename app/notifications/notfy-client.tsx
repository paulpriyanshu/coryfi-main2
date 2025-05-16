"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Request } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ConnectionRequestItemProps {
  request: Request
  userEmail: string
  userName: string
}

export default function NotifyClient({ request, userEmail, userName }) {
  const [status, setStatus] = useState(request.status)
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  const isPending = status === "pending" || status === null || status === undefined
  const content = request.post?.content || ""

  const handleClick = () => {
    if (request.type === "Like Post" && request.post?.id) {
      router.push(`https://connect.coryfi.com/p/${request.post.id}`)
    }
  }

  return (
    <li
      className={`bg-white rounded-md p-3 flex items-center justify-between cursor-pointer ${
        request.type === "Like Post" ? "hover:bg-gray-100" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={request?.senderUser?.userdp ||request.senderName.slice(0, 2)} />
          <AvatarFallback>{request.senderName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          {request.type === "Connection" && (
            <p className="font-medium text-sm">{request.senderName}</p>
          )}
          {request.type === "Like Post" && (
            <p className="font-medium text-sm">{request.content}</p>
          )}
        </div>
      </div>

      <div className="max-w-xs ml-5">
        {request.post?.imageUrl?.length > 0 ? (
          <img
            src={request.post.imageUrl[0]}
            alt="post"
            className="w-12 h-12 object-cover rounded-md"
          />
        ) : (
          <div
            className={`prose prose-sm text-sm transition-all duration-300 ${
              expanded ? "" : "line-clamp-3 overflow-hidden"
            }`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
        {!expanded && content.length > 150 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(true)
            }}
            className="text-blue-500 text-xs mt-1 underline"
          >
            Show more
          </button>
        )}
        {expanded && content.length > 150 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(false)
            }}
            className="text-blue-500 text-xs mt-1 underline"
          >
            Show less
          </button>
        )}
      </div>
    </li>
  )
}