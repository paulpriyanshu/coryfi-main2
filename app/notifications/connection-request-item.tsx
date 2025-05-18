"use client"

import { useState } from "react"
import type { Request } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { handleAccept, handleReject } from "./action"
import toast from "react-hot-toast"

interface ConnectionRequestItemProps {
  request: Request
  userEmail: string
  userName: string
}

export default function ConnectionRequestItem({ request, userEmail, userName }: ConnectionRequestItemProps) {
  const [status, setStatus] = useState(request.status)

  const onAccept = async () => {
    try {
      setStatus("accepted")
      await handleAccept(request, userEmail, userName)
      toast.success(`Connected with ${request.senderName}`)
    } catch (error) {
      setStatus("pending")
      toast.error("Failed to accept request")
    }
  }

  const onReject = async () => {
    try {
      setStatus("rejected")
      await handleReject(request, userEmail)
      toast.success("Request rejected")
    } catch (error) {
      setStatus("pending")
      toast.error("Failed to reject request")
    }
  }

  const isPending = status === "pending" || status === null || status === undefined

  return (
    <li className="bg-white rounded-md p-3 flex items-center justify-between  dark:bg-black">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={request.senderName.slice(0, 2)} />
          <AvatarFallback>{request.senderName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{request.senderName}</p>
          <p className="font-medium text-sm">sent you a request</p>
          {!isPending && (
            <Badge
              variant="secondary"
              className={`mt-1 text-xs ${
                status === "accepted" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {status === "accepted" ? "Connected" : "Rejected"}
            </Badge>
          )}
        </div>
      </div>

      {isPending ? (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800">
            {Number.parseInt(request.content.split(" ").pop(), 10)}
          </Badge>
          <Button size="sm" className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white" onClick={onAccept}>
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 border-red-500 text-red-500 hover:bg-red-50"
            onClick={onReject}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleString()}</div>
      )}
    </li>
  )
}

