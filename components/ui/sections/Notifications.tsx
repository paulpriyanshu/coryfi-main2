'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { get_new_requests, approve_request, reject_request } from "@/app/api/actions/network"
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
import { Bell, Check, X } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'

// Define interfaces for type safety
interface Requester {
  id: number
  name: string
  email: string
  bio: string
  connections: number
  banner: string
  location: string
  currentPosition: string
  company: string
  website: string
  image?: string
  userdp?: string
}

interface ConnectionRequest {
  StrengthLevel: number
  id: number
  requester: Requester
  requesterId: number
  recipientId: number
  status: string
  createdAt: Date
  updatedAt: Date
  blockedAt: Date
}

export default function ConnectionRequestsDropdown() {
  // Initialize state and session
  const { data: session } = useSession()
  const [requests, setRequests] = useState([])
  const [showTooltip, setShowTooltip] = useState(false)

  // Fetch connection requests when component mounts or session changes
  useEffect(() => {
    const fetchRequests = async () => {
      if (session?.user?.email) {
        const result = await get_new_requests(session.user.email)
        if (result?.success) {
          setRequests(result.requests)
        }
      }
    }

    fetchRequests()
    // Refresh requests every 5 minutes
    const intervalId = setInterval(fetchRequests, 5 * 60 * 1000)
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [session])

  // Handle accepting a connection request
  const handleAccept = async (request: ConnectionRequest) => {
    if (session?.user?.email) {
      // Approve the request through your API
      const result = await approve_request(request.requester.email, session.user.email)
      
      // Update connection strength in the backend
      await axios.post('https://neo.coryfi.com/api/v1/connect', {
        email1: session.user.email,
        email2: request.requester.email,
        strength: request.StrengthLevel
      })

      if (result.success) {
        // Remove the request from the list
        setRequests(requests.filter(req => req.id !== request.id))
        toast.success(`You are now connected with ${request.requester.name}.`)
      } else {
        toast.error(result.error || "Failed to accept the request. Please try again.")
      }
    }
  }

  // Handle rejecting a connection request
  const handleReject = async (request) => {
    const result = await reject_request(request.requester.email, session.user.email)
      
    setRequests(requests.filter(req => req.id !== request.id))
    toast.success("Request rejected successfully.")
  }

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {/* Show badge with request count if there are any requests */}
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
        <div className="absolute left-2 top-2 transform -translate-x-10 z-100 bg-gray-800 text-white p-2 rounded shadow-lg max-w-screen-2xl text-sm">
          This number represents the quality of the bond you share with each other on a scale of 1-10
        </div>
      )}
          
          {/* Show message if no requests */}
          {requests.length === 0 ? (
            <DropdownMenuItem disabled className="text-center py-8 text-gray-500">
              No new notifications
            </DropdownMenuItem>
          ) : (
            // List of connection requests
            <div className="max-h-[400px] overflow-y-auto">
              {requests.map((request) => (
                <DropdownMenuItem 
                  key={request.id} 
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150 ease-in-out focus:bg-gray-100"
                >
                  {/* User information section */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.requester.userdp || request.requester.image} />
                      <AvatarFallback className="text-lg">
                        {request.requester.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{request.requester.name}</p>
                      <p className="text-xs text-gray-500">{request.requester.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {request.requester.currentPosition} at {request.requester.company}
                      </p>
                    </div>
                  </div>

                  {/* Actions section */}
                  <div className="flex flex-col items-end space-y-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-1 rounded-full bg-black text-black cursor-help"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                     {request.StrengthLevel}
                    </Badge>
                    
                    {/* Accept/Reject buttons */}
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

      {/* Tooltip that appears above the notification bell */}
      

      {/* Toast notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    
    </div>
  )
}