"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  fetchRequestsForIntermediary,
  fetchRequestsForFinalIntermediary,
  handleApproval,
  handleRejection,
  handleFinalApproval,
} from "@/app/api/actions/network"

// Update the User interface to include userdp
interface User {
  id: number
  email: string
  name: string
  userdp?: string
}

// Update the Intermediary interface to include userdp
interface Intermediary {
  email: string
  name: string
  userdp?: string
}

// Update the PathChainNode interface to include userdp
interface PathChainNode {
  id: number
  evaluationId: number
  new_order: number
  intermediary: {
    email: string
    name: string
    userdp?: string
  }
}

// Update the FinalPathData interface to include requester and recipient objects
interface FinalPathData {
  requesterId: number
  recipientId: number
  requester: {
    id: number
    email: string
    name: string
    userdp?: string
  }
  recipient: {
    id: number
    email: string
    name: string
    userdp?: string
  }
  nodes: PathChainNode[]
}

interface CollaborationRequest {
  evaluationId: number
  requester: User
  recipient: User
  nextNode?: Intermediary | null
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

// EvaluationModal Component
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
          <div className="text-center flex flex-col items-center">
            <Avatar className="w-10 h-10 mb-2">
              {request.requester.userdp ? (
                <AvatarImage src={request.requester.userdp} alt={request.requester.name} />
              ) : (
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.requester.name}`}
                  alt={request.requester.name}
                />
              )}
              <AvatarFallback>{request.requester.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{request.requester.name}</p>
            <p className="text-sm text-muted-foreground">Requester</p>
          </div>
          <ArrowRight className="w-4 h-4" />
          <div className="text-center flex flex-col items-center">
            <Avatar className="w-10 h-10 mb-2">
              <AvatarImage src="/your-avatar.png" alt="You" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <p className="font-semibold">You</p>
            <p className="text-sm text-muted-foreground">Intermediary</p>
          </div>
          {request.nextNode && (
            <>
              <ArrowRight className="w-4 h-4" />
              <div className="text-center flex flex-col items-center">
                <Avatar className="w-10 h-10 mb-2">
                  {request.nextNode.userdp ? (
                    <AvatarImage src={request.nextNode.userdp} alt={request.nextNode.name} />
                  ) : (
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.nextNode.name}`}
                      alt={request.nextNode.name}
                    />
                  )}
                  <AvatarFallback>{request.nextNode.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{request.nextNode.name}</p>
                <p className="text-sm text-muted-foreground">Next</p>
              </div>
            </>
          )}
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

// CollabRequestCard Component
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
            {request.requester.userdp ? (
              <AvatarImage src={request.requester.userdp} alt={request.requester.name} />
            ) : (
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.requester.name}`}
                alt={request.requester.name}
              />
            )}
            <AvatarFallback>{request.requester.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <Avatar className="w-8 h-8">
            <AvatarImage src="/your-avatar.png" alt="You" />
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          {request.nextNode && (
            <>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <Avatar className="w-8 h-8">
                {request.nextNode.userdp ? (
                  <AvatarImage src={request.nextNode.userdp} alt={request.nextNode.name} />
                ) : (
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.nextNode.name}`}
                    alt={request.nextNode.name}
                  />
                )}
                <AvatarFallback>{request.nextNode.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-4 text-center">
          {request.requester.name} → You {request.nextNode ? `→ ${request.nextNode.name}` : ""}
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

// FinalPathCard Component
function FinalPathCard({
  data,
  evaluationId,
  onApprove,
  onDeny,
  sequence,
}: {
  data: FinalPathData
  evaluationId: number
  onApprove: () => void
  onDeny: () => void
  sequence?: number
}) {
  const { data: session } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmingApproval, setIsConfirmingApproval] = useState(false)
  // const [confirmationText, setConfirmationText] = useState("")

  const handleApproveClick = () => {
    console.log("hey")
    setIsModalOpen(true)
    // setConfirmationText("")
  }

  const handleConfirmApproval = async () => {
    // Validate confirmation text
    const expectedText = `approve ${data.requester.name} to ${data.recipient.name}`
    // if (confirmationText.toLowerCase().trim() !== expectedText.toLowerCase()) {
    //   toast.error("Confirmation text does not match. Please try again.")
    //   return
    // }

    if (!session?.user?.email) {
      toast.error("You must be logged in to approve requests.")
      return
    }

    try {
      setIsConfirmingApproval(true)

      // Call handleFinalApproval with the current user's email and evaluation ID
      const result = await handleFinalApproval(session.user.email, evaluationId)

      if (!result.success) {
        console.log("Failed to approve final path")
      }

      // Call the parent component's onApprove method
      onApprove()

      toast.success("Final path approved successfully. Connection completed!")
      setIsModalOpen(false)
    } catch (error: any) {
      console.error("Error approving final path:", error)
      toast.error(error.message || "An error occurred while approving the request.")
    } finally {
      setIsConfirmingApproval(false)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-4">Final Path Approval</h3>
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Complete Path Chain:</p>
          <div className="flex flex-col space-y-2">
            {/* Requester */}
            <div className="flex items-center">
              <Avatar className="w-6 h-6 mr-2">
                {data.requester.userdp ? (
                  <AvatarImage src={data.requester.userdp} alt={data.requester.name} />
                ) : (
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${data.requester.name}`}
                    alt={data.requester.name}
                  />
                )}
                <AvatarFallback>{data.requester.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{data.requester.name}</span>
              <span className="text-xs ml-2 text-muted-foreground">(Requester)</span>
              <div className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                Approved
              </div>
            </div>

            {/* Intermediaries */}
            {data.nodes.map((node, index) => (
              <div key={node.id} className="flex items-center">
                <Avatar className="w-6 h-6 mr-2">
                  {node.intermediary.userdp ? (
                    <AvatarImage src={node.intermediary.userdp} alt={node.intermediary.name} />
                  ) : (
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${node.intermediary.name}`}
                      alt={node.intermediary.name}
                    />
                  )}
                  <AvatarFallback>{node.intermediary.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {node.intermediary.name}
                  {index === data.nodes.length - 1 ? " (You)" : ""}
                </span>
                {index < data.nodes.length - 1 && (
                  <div className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                    Approved
                  </div>
                )}
                {index === data.nodes.length - 1 && (
                  <div className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                    Pending
                  </div>
                )}
              </div>
            ))}

            {/* Recipient */}
            <div className="flex items-center">
              <ArrowRight className="w-4 h-4 mr-2 text-muted-foreground" />
              <Avatar className="w-6 h-6 mr-2">
                {data.recipient.userdp ? (
                  <AvatarImage src={data.recipient.userdp} alt={data.recipient.name} />
                ) : (
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${data.recipient.name}`}
                    alt={data.recipient.name}
                  />
                )}
                <AvatarFallback>{data.recipient.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{data.recipient.name}</span>
              <span className="text-xs ml-2 text-muted-foreground">(Recipient)</span>
            </div>
          </div>
        </div>

        {/* Explanation text */}
        <div className="p-3 bg-muted rounded-md mb-4">
          <p className="text-xs">
            As the final intermediary in this path, your approval will complete the connection between{" "}
            {data.requester.name} and {data.recipient.name}.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between space-x-2">
          <Button variant="outline" size="sm" className="w-full" onClick={onDeny} disabled={isConfirmingApproval}>
            <XCircle className="w-4 h-4 mr-2" />
            Deny Path
          </Button>
          <Button size="sm" className="w-full" onClick={()=>handleApproveClick()} disabled={isConfirmingApproval}>
            {isConfirmingApproval ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Path
              </>
            )}
          </Button>
        </div>
      </CardContent>

      {/* Final Approval Confirmation Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Final Path Approval</DialogTitle>
            <DialogDescription>
              You are about to approve the final connection between {data.requester.name} and {data.recipient.name}.
              This action will complete the path and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mb-4">
              <p className="text-sm text-amber-800">As the final intermediary, your approval will:</p>
              <ul className="list-disc pl-5 mt-2 text-sm text-amber-800">
                {/* <li>
                  Complete the connection between {data.requester.name} and {data.recipient.name}
                </li> */}
                <li>Allow them to communicate directly</li>
                <li>Notify all intermediaries in the path</li>
              </ul>
            </div>

            {/* Confirmation input */}
            <div>
              {/* <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                To confirm, type:
                <span className="font-bold ml-1">
                  approve {data.requester.name} to {data.recipient.name}
                </span>
              </label> */}
              {/* <input
                type="text"
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter confirmation text"
              /> */}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isConfirmingApproval}>
              Cancel
            </Button>
            <Button onClick={handleConfirmApproval} disabled={isConfirmingApproval}>
              {isConfirmingApproval ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Final Approval"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Main CollabContent Component
export default function CollabContent() {
  const { data: session, status } = useSession()
  const [collab, setCollab] = useState<CollaborationRequest[]>([])
  const [finalPaths, setFinalPaths] = useState<{ [key: number]: FinalPathData }>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      if (session?.user?.email) {
        setIsLoading(true)

        try {
          // Fetch regular intermediary requests
          const result = await fetchRequestsForIntermediary(session.user.email)
          if (result.success && result.data) {
            console.log("Regular intermediary requests:", result.data)
            setCollab(result.data)

            // For each request, check if the user is the final intermediary
            const finalPathsData: { [key: number]: FinalPathData } = {}

            await Promise.all(
              result.data.map(async (request) => {
                // If there's no next node, this might be a final intermediary
                if (!request.nextNode) {
                  const finalResult = await fetchRequestsForFinalIntermediary(session.user.email, request.evaluationId)

                  if (
                    finalResult.success &&
                    finalResult.data &&
                    finalResult.data.nodes &&
                    finalResult.data.nodes.length > 0
                  ) {
                    finalPathsData[request.evaluationId] = finalResult.data
                  }
                }
              }),
            )

            setFinalPaths(finalPathsData)
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

  // Update the handleApprove function to handle loading states
  const handleApprove = async (request: CollaborationRequest) => {
    if (!session?.user?.email) {
      toast.error("You must be logged in to approve requests.")
      return
    }

    try {
      // Check if this is a final path approval
      const isFinalPath = finalPaths[request.evaluationId] !== undefined

      let result
      if (isFinalPath) {
        // Use handleFinalApproval for final path approvals
        result = await handleFinalApproval(session.user.email, request.evaluationId)
        if (result.success) {
          toast.success("Final path approved successfully. Connection completed!")
        } else {
          throw new Error(result.error || "Failed to approve final path")
        }
      } else {
        // Use regular handleApproval for non-final approvals
        result = await handleApproval(request.evaluationId, session.user.email)
        if (result.success) {
          toast.success("Request approved successfully.")
        } else {
          throw new Error(result.error || "Failed to approve request")
        }
      }

      // Remove from both regular and final paths
      setCollab((prevCollab) => prevCollab.filter((item) => item.evaluationId !== request.evaluationId))
      setFinalPaths((prev) => {
        const newPaths = { ...prev }
        delete newPaths[request.evaluationId]
        return newPaths
      })
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
        // Remove from both regular and final paths
        setCollab((prevCollab) => prevCollab.filter((item) => item.evaluationId !== request.evaluationId))
        setFinalPaths((prev) => {
          const newPaths = { ...prev }
          delete newPaths[request.evaluationId]
          return newPaths
        })
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

  // Filter out requests that are in finalPaths to avoid duplication
  const regularRequests = collab.filter((request) => !finalPaths[request.evaluationId])
  const hasFinalPaths = Object.keys(finalPaths).length > 0

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6 p-4">
        {/* Regular intermediary requests */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Oncoming Paths</h2>
          {regularRequests.length === 0 ? (
            <div className="text-center p-4 text-sm text-muted-foreground">No oncoming paths at the moment.</div>
          ) : (
            regularRequests.map((request) => (
              <CollabRequestCard
                key={request.evaluationId}
                request={request}
                onApprove={() => handleApprove(request)}
                onDeny={() => handleReject(request)}
              />
            ))
          )}
        </div>

        {/* Final intermediary requests */}
        {hasFinalPaths && (
          <div className="space-y-4 mt-8">
            <h2 className="text-lg font-semibold">Final Path Approvals</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You are the final intermediary for these paths. Your approval will complete the connection.
            </p>
            {Object.entries(finalPaths).map(([evaluationId, pathData], index) => {
              const request = collab.find((r) => r.evaluationId === Number.parseInt(evaluationId))
              if (!request) return null

              return (
                <FinalPathCard
                  key={evaluationId}
                  data={pathData}
                  evaluationId={Number.parseInt(evaluationId)}
                  onApprove={() => handleApprove(request)}
                  onDeny={() => handleReject(request)}
                  sequence={index}
                />
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

