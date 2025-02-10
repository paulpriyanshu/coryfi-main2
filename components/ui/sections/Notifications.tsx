"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { approve_request, reject_request, get_new_requests, get_requests } from "@/app/api/actions/network"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, X } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import axios from "axios"
import { useRouter } from "next/navigation"

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

export default function ConnectionRequestsDropdown() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)
  const [open, setOpen] = useState(false)
  const router=useRouter()

  useEffect(() => {
    const fetchRequests = async () => {
      if (!session?.user?.email) return
      try {
        const result = await get_new_requests(session.user.email)
        const notify = await get_requests(session.user.email)

        if (result.success) {
          // Sort notifications by createdAt in descending order (latest first)
          const sortedNotifications = notify.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          setRequests(sortedNotifications)
          console.log("notify", sortedNotifications)
        } else {
          throw new Error("Failed to fetch requests")
        }
      } catch (error) {
        toast.error("Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [session?.user?.email])

  const handleAccept = async (e: React.MouseEvent, request: Request) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user?.email) return

    try {
      const updatedRequests = requests.map((req) =>
        req.id === request.id ? { ...req, status: "accepted", createdAt: new Date().toISOString() } : req,
      )
      // Sort again to ensure the newly accepted request moves to the top
      const sortedRequests = updatedRequests.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      setRequests(sortedRequests)

      const result = await approve_request(request.senderMail, session.user.email, session.user.name, request.id)

      await axios.post("https://neo.coryfi.com/api/v1/connect", {
        email1: session.user.email,
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

  const handleReject = async (e: React.MouseEvent, request: Request) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user?.email || !request.senderMail) return

    try {
      const updatedRequests = requests.map((req) =>
        req.id === request.id ? { ...req, status: "rejected", createdAt: new Date().toISOString() } : req,
      )
      // Sort again to ensure the newly rejected request moves to the top
      const sortedRequests = updatedRequests.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      setRequests(sortedRequests)

      const result = await reject_request(request.senderMail, session.user.email, request.id)

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
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && open) {
        setOpen(false);
        router.push("/notifications"); // Redirect to the Notifications page
      }
    };

    window.addEventListener("resize", handleResize);
    
    // Check on mount
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [open, router]);

  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {requests.filter((req) => isPending(req.status)).length > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">
                {requests.filter((req) => isPending(req.status)).length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-96 p-2 shadow-lg rounded-xl border border-gray-200"
          onClick={(e) => e.stopPropagation()} // Prevent closing on content click
        >
          <DropdownMenuLabel className="text-lg font-semibold px-4 py-2">Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />
          {showTooltip && (
            <div className="absolute left-2 top-2 transform -translate-x-10 z-100 bg-slate-800 text-white p-2 rounded shadow-lg max-w-screen-2xl text-sm">
              Bond strength scale: 1-10
            </div>
          )}

          {loading ? (
            <DropdownMenuItem disabled className="text-center py-8 text-gray-500">
              Loading...
            </DropdownMenuItem>
          ) : requests.length === 0 ? (
            <DropdownMenuItem disabled className="text-center py-8 text-gray-500">
              No notifications
            </DropdownMenuItem>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {requests.map((request) => (
                <DropdownMenuItem
                  key={request.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150 ease-in-out focus:bg-gray-100"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.senderName.slice(0, 2)} />
                      <AvatarFallback className="text-lg">{request.senderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{request.senderName}</p>
                      <p className="text-xs text-gray-500">{request.senderMail}</p>
                      {!isPending(request.status) && (
                        <Badge
                          variant="secondary"
                          className={`mt-1 ${
                            request.status === "accepted" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.status === "accepted" ? "Connected" : "Rejected"}
                        </Badge>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{new Date(request.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    {isPending(request.status) ? (
                      <>
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-1 rounded-full bg-white text-black cursor-help"
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                        >
                          {Number.parseInt(request.content.split(" ").pop(), 10)}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 rounded-full bg-green-100 hover:bg-green-200 transition-colors duration-150"
                            onClick={(e) => handleAccept(e, request)}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 transition-colors duration-150"
                            onClick={(e) => handleReject(e, request)}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-500">
                        {request.status === "accepted" ? "Accepted" : "Rejected"}
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Toaster
        position="bottom-center"
        toastOptions={{ duration: 1000, style: { background: "#333", color: "#fff" } }}
      />
    </div>
  )
}

