'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { approve_request, reject_request, get_new_requests } from "@/app/api/actions/network"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, X } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

export default function ConnectionRequestsDropdown() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const fetchRequests = async () => {
      if (!session?.user?.email) return
      try {
        const result = await get_new_requests(session.user.email)
        if (result.success) {
          setRequests(result.requests)
        } else {
          throw new Error('Failed to fetch requests')
        }
      } catch (error) {
        toast.error('Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [session?.user?.email])

  const handleAccept = async (request) => {
    if (!session?.user?.email) return

    try {
      setRequests(requests.filter(req => req.id !== request.id))

      const result = await approve_request(request.requester.email, session.user.email, session.user.name)

      await axios.post('https://neo.coryfi.com/api/v1/connect', {
        email1: session.user.email,
        email2: request.requester.email,
        strength: request.StrengthLevel
      })

      if (result.success) {
        toast.success(`Connected with ${request.requester.name}`)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error("Failed to accept request")
    }
  }

  const handleReject = async (request) => {
    if (!session?.user?.email) return

    try {
      setRequests(requests.filter(req => req.id !== request.id))

      const result = await reject_request(request.requester.email, session.user.email)

      if (result.success) {
        toast.success("Request rejected")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error("Failed to reject request")
    }
  }

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {requests.length > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">
                {requests.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-96 p-2 shadow-lg rounded-xl border border-gray-200">
          <DropdownMenuLabel className="text-lg font-semibold px-4 py-2">
            Notifications
          </DropdownMenuLabel>
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
              No new notifications
            </DropdownMenuItem>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {requests.map((request) => (
                <DropdownMenuItem 
                  key={request.id} 
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150 ease-in-out focus:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.requester.userdp || request.requester.name.slice(0,2)} />
                      <AvatarFallback className="text-lg">
                        {request.requester.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{request.requester.name}</p>
                      <p className="text-xs text-gray-500">{request.requester.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-1 rounded-full bg-white text-black cursor-help"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      {request.StrengthLevel}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 rounded-full bg-green-100 hover:bg-green-200 transition-colors duration-150"
                        onClick={() => handleAccept(request)}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 transition-colors duration-150"
                        onClick={() => handleReject(request)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Toaster position="bottom-center" toastOptions={{ duration: 1000, style: { background: '#333', color: '#fff' } }} />
    </div>
  )
}