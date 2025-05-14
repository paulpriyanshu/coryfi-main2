"use client"

import { useState } from "react"
import { approve_request, reject_request } from "@/app/api/actions/network"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, X, ArrowLeft } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import axios from "axios"
import Link from "next/link"

interface Request {
  id: number
  senderName: string
  senderMail: string
  senderId: number
  type: string
  content: string
  isRead: boolean
  status?: "pending" | "accepted" | "rejected" | null
  createdAt: string
}

interface ConnectionRequestsClientProps {
  initialRequests: Request[]
  userEmail: string
  userName: string
}

export default function ConnectionRequestsClient({
  initialRequests,
  userEmail,
  userName,
}) {
  const [requests, setRequests] = useState(initialRequests)

  const handleAccept = async (request) => {
    try {
      const updatedRequests = requests.map((req) =>
        req.id === request.id ? { ...req, status: "accepted", createdAt: new Date().toISOString() } : req,
      )
      const sortedRequests = updatedRequests.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      setRequests(sortedRequests)

      const result = await approve_request(request.senderMail, userEmail, userName, request.id)

      await axios.post("https://neo.coryfi.com/api/v1/connect", {
        email1: userEmail,
        email2: request.senderMail,
        strength: Number.parseInt(request.content.split(" ").pop(), 10),
      })

      if (result.success) {
        toast.success(`Connected with ${request.senderName}`)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      setRequests(requests.map((req) => (req.id === request.id ? { ...req, status: "pending" } : req)))
      toast.error("Failed to accept request")
    }
  }

  const handleReject = async (request) => {
    try {
      const updatedRequests = requests.map((req) =>
        req.id === request.id ? { ...req, status: "rejected", createdAt: new Date().toISOString() } : req,
      )
      const sortedRequests = updatedRequests.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      setRequests(sortedRequests)

      const result = await reject_request(request.senderMail, userEmail, request.id)

      if (result.success) {
        toast.success("Request rejected")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      setRequests(requests.map((req) => (req.id === request.id ? { ...req, status: "pending" } : req)))
      toast.error("Failed to reject request")
    }
  }

  const isPending = (status?: string | null) => status === "pending" || status === null || status === undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
          <div className="w-5"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {requests.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No notifications</div>
        ) : (
          <ul className="space-y-2">
            {requests.map((request) => (
              <li key={request.id} className="bg-white rounded-md p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.senderName.slice(0, 2)} />
                    <AvatarFallback>{request.senderName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{request.senderName}</p>
                    {/* <p className="font-medium text-sm">sent you a request</p> */}
                    {!isPending(request.status) && (
                      <Badge
                        variant="secondary"
                        className={`mt-1 text-xs ${
                          request.status === "accepted" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {request.status === "accepted" ? "Connected" : "Rejected"}
                      </Badge>
                    )}
                  </div>
                </div>

                {isPending(request.status) ? (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800">
                      {Number.parseInt(request.content.split(" ").pop(), 10)}
                    </Badge>
                    <Button
                      size="sm"
                      className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => handleAccept(request)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-red-500 text-red-500 hover:bg-red-50"
                      onClick={() => handleReject(request)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleString()}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      <Toaster
        position="bottom-center"
        toastOptions={{ duration: 2000, style: { background: "#333", color: "#fff" } }}
      />
    </div>
  )
}

