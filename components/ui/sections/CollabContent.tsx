"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, Loader2 } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fetchRequestsForIntermediary, handleApproval, handleRejection } from "@/app/api/actions/network"

interface User {
  id: number
  email: string
  name: string
}

interface CollaborationRequest {
  evaluationId: number
  requester: User
  recipient: User
  status: string
  createdAt: Date | string
}

interface EvaluationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  request: CollaborationRequest
}

interface CollabRequestCardProps {
  request: CollaborationRequest
  onApprove: () => void
  onDeny: () => void
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

function EvaluationModal({ isOpen, onClose, onConfirm, request }: EvaluationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Approve Path Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve the connection between {request.requester.name} and{" "}
            {request.recipient.name}?
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between py-4">
          <div className="text-center">
            <p className="font-semibold">{request.requester.name}</p>
            <p className="text-sm text-muted-foreground">Requester</p>
          </div>
          <ArrowRight className="w-4 h-4" />
          <div className="text-center">
            <p className="font-semibold">You</p>
            <p className="text-sm text-muted-foreground">Intermediary</p>
          </div>
          <ArrowRight className="w-4 h-4" />
          <div className="text-center">
            <p className="font-semibold">{request.nextnode[0].intermediary.name}</p>
            <p className="text-sm text-muted-foreground">Recipient</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm Approval</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CollabRequestCard({ request, onApprove, onDeny }: CollabRequestCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleApproveClick = () => {
    setIsModalOpen(true)
  }

  const handleConfirmApproval = () => {
    onApprove()
    setIsModalOpen(false)
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-2">Path Request</h3>
        <div className="flex items-center justify-between mb-4">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.requester.name}`}
              alt={request.requester.name}
            />
            <AvatarFallback>{request.requester.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <Avatar className="w-8 h-8">
            <AvatarImage src="/your-avatar.png" alt="You" />
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.nextnode[0].intermediary.name}`}
              alt={request.nextnode[0].intermediary.name}
            />
            <AvatarFallback>{request.nextnode[0].intermediary.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        <p className="text-xs text-muted-foreground mb-4 text-center">
          {request.requester.name} → You → {request.nextnode[0].intermediary.name}
        </p>
        <div className="flex justify-between space-x-2">
          <Button variant="outline" size="sm" className="w-full" onClick={onDeny}>
            Deny
          </Button>
          <Button size="sm" className="w-full" onClick={handleApproveClick}>
            Approve
          </Button>
        </div>
      </CardContent>
      <EvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmApproval}
        request={request}
      />
    </Card>
  )
}

// import { useSession } from "next-auth/react"
// import { useState, useEffect } from "react"
// import type { CollaborationRequest } from "@/types/collaboration"
// import { fetchRequestsForIntermediary, handleApproval, handleRejection } from "@/services/collaboration"
// import { Toaster, toast } from "react-hot-toast"
// import Loader2 from "@/components/Loader2"
// import CollabRequestCard from "@/components/CollabRequestCard"

export default function CollabContent() {
  const { data: session, status } = useSession()
  const [collab, setCollab] = useState<CollaborationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      if (session?.user?.email) {
        setIsLoading(true)

        try {
          const result = await fetchRequestsForIntermediary(session.user.email)
          if (result.success && result.data) {
            console.log("results",result.data)
            setCollab(result.data)
          }
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchRequests()
    const intervalId = setInterval(fetchRequests, 5 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [session])

  const handleApprove = async (request: CollaborationRequest) => {
    if (!session?.user?.email) {
      toast.error("You must be logged in to approve requests.")
      return
    }

    try {
      const result = await handleApproval(request.evaluationId, session.user.email)
      if (result.success) {
        toast.success("Request approved successfully.")
        setCollab((prevCollab) => prevCollab.filter((item) => item.evaluationId !== request.evaluationId))
      } else {
        throw new Error(result.error || "Failed to approve request")
      }
    } catch (error: any) {
      console.error("Error approving request:", error)
      toast.error(error.message || "An error occurred while approving the request.")
    }
  }

  const handleReject = async (request: CollaborationRequest) => {
    if (!session?.user?.email) {
      toast.error("You must be logged in to reject requests.")
      return
    }

    try {
      const result = await handleRejection(request.evaluationId, session.user.email)
      if (result.success) {
        toast.success("Request rejected successfully.")
        setCollab((prevCollab) => prevCollab.filter((item) => item.evaluationId !== request.evaluationId))
      } else {
        throw new Error(result.error || "Failed to reject request")
      }
    } catch (error: any) {
      console.error("Error rejecting request:", error)
      toast.error(error.message || "An error occurred while rejecting the request.")
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Loader2 className="w-10 h-10 animate-spin text-primary" aria-label="Loading" />
      </div>
    )
  }

  if (!session) {
    return <div className="text-center p-4">Please sign in to view oncoming paths</div>
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-4 p-4">
        <h2 className="text-lg font-semibold mb-4">Oncoming Path</h2>
        {collab.length === 0 ? (
          <div className="text-center p-4 text-sm">No oncoming paths at the moment.</div>
        ) : (
          collab.map((request) => (
            <CollabRequestCard
              key={request.id}
              request={request}
              onApprove={() => handleApprove(request)}
              onDeny={() => handleReject(request)}
            />
          ))
        )}
      </div>
    </>
  )
}

