"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowDown, Loader2, CheckCircle, XCircle, Clock, Check, X, ArrowRight, Users } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
  handleApproval,
  handleRejection,
  handleFinalApproval,
  fetchApprovedPaths,
  fetchRejectedPaths,
} from "@/app/api/actions/network"

interface User {
  id: number
  email: string
  name: string
  userdp?: string
}

interface Intermediary {
  email: string
  name: string
  userdp?: string
}

interface CollaborationRequest {
  evaluationId: number
  requester: User
  recipient: User
  nextNode?: Intermediary | null
  status: string
  createdAt: Date | string
}

interface ProcessedRequest extends CollaborationRequest {
  processedAt: Date
  isFinalPath?: boolean
}

interface ApprovedPathRequest {
  evaluationId: number
  requester: User
  recipient: User
  nextNode?: Intermediary | null
  status: string
  createdAt: Date | string
}

interface RejectedPathRequest {
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
  isApproving: boolean
}

function ApprovedPathCard({ request }: { request: ApprovedPathRequest }) {
  return (
    <Card className="w-full dark:bg-gray-700">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Approved Path</h3>
          <Badge
            className={`text-xs ${
              request.status === "COMPLETED"
                ? "bg-green-100 text-green-800"
                : request.status === "REJECTED"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
            }`}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            {request.status}
          </Badge>
        </div>
        <div className="mb-4">
          <div className="flex justify-center space-x-3 items-center">
            <div className="flex flex-col items-center">
              <Avatar className="w-10 h-10">
                {request.requester.userdp ? (
                  <AvatarImage src={request.requester.userdp || "/placeholder.svg"} alt={request.requester.name} />
                ) : (
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.requester.name}`}
                    alt={request.requester.name}
                  />
                )}
                <AvatarFallback>{request.requester.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground mt-1">Requester</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="You" />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground mt-1">You</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <Avatar className="w-10 h-10">
                {request.recipient.userdp ? (
                  <AvatarImage src={request.recipient.userdp || "/placeholder.svg"} alt={request.recipient.name} />
                ) : (
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.recipient.name}`}
                    alt={request.recipient.name}
                  />
                )}
                <AvatarFallback>{request.recipient.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground mt-1">Recipient</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-2 text-center">
          {request.requester.name} → You → {request.recipient.name}
        </p>
        <div className="mt-2 p-2 bg-green-50 rounded-md">
          <p className="text-xs text-green-800 text-center">
            Path {request.status.toLowerCase()} on {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function RejectedPathCard({ request }: { request: RejectedPathRequest }) {
  return (
    <Card className="w-full dark:bg-gray-700">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Rejected Path</h3>
          <Badge className="text-xs bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            REJECTED
          </Badge>
        </div>
        <div className="mb-4">
          <div className="flex justify-center space-x-3 items-center">
            <div className="flex flex-col items-center">
              <Avatar className="w-10 h-10">
                {request.requester.userdp ? (
                  <AvatarImage src={request.requester.userdp || "/placeholder.svg"} alt={request.requester.name} />
                ) : (
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.requester.name}`}
                    alt={request.requester.name}
                  />
                )}
                <AvatarFallback>{request.requester.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground mt-1">Requester</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="You" />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground mt-1">You</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <Avatar className="w-10 h-10">
                {request.recipient.userdp ? (
                  <AvatarImage src={request.recipient.userdp || "/placeholder.svg"} alt={request.recipient.name} />
                ) : (
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.recipient.name}`}
                    alt={request.recipient.name}
                  />
                )}
                <AvatarFallback>{request.recipient.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground mt-1">Recipient</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-2 text-center">
          {request.requester.name} → You → {request.recipient.name}
        </p>
        <div className="mt-2 p-2 bg-red-50 rounded-md">
          <p className="text-xs text-red-800 text-center">
            Path rejected on {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function EvaluationModal({ isOpen, onClose, onConfirm, request }: EvaluationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mx-4 max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Approve Path Request</DialogTitle>
          <DialogDescription className="text-sm">
            Are you sure you want to approve the connection between {request.requester.name} and{" "}
            {request.recipient.name}?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex flex-col space-y-4 items-center">
            <div className="text-center flex flex-col items-center">
              <Avatar className="w-12 h-12 mb-2">
                {request.requester.userdp ? (
                  <AvatarImage src={request.requester.userdp || "/placeholder.svg"} alt={request.requester.name} />
                ) : (
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.requester.name}`}
                    alt={request.requester.name}
                  />
                )}
                <AvatarFallback>{request.requester.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="font-semibold text-sm">{request.requester.name}</p>
              <p className="text-xs text-muted-foreground">Requester</p>
            </div>
            <ArrowDown className="w-4 h-4 text-muted-foreground" />
            <div className="text-center flex flex-col items-center">
              <Avatar className="w-12 h-12 mb-2">
                <AvatarImage src="/placeholder.svg?height=48&width=48" alt="You" />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <p className="font-semibold text-sm">You</p>
              <p className="text-xs text-muted-foreground">Intermediary</p>
            </div>
            {request.nextNode && (
              <>
                <ArrowDown className="w-4 h-4 text-muted-foreground" />
                <div className="text-center flex flex-col items-center">
                  <Avatar className="w-12 h-12 mb-2">
                    {request.nextNode.userdp ? (
                      <AvatarImage src={request.nextNode.userdp || "/placeholder.svg"} alt={request.nextNode.name} />
                    ) : (
                      <AvatarImage
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.nextNode.name}`}
                        alt={request.nextNode.name}
                      />
                    )}
                    <AvatarFallback>{request.nextNode.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-sm">{request.nextNode.name}</p>
                  <p className="text-xs text-muted-foreground">Next</p>
                </div>
              </>
            )}
          </div>
        </div>
        <DialogFooter className="flex flex-col space-y-2">
          <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="w-full">
            Confirm Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CollabRequestCard({ request, onApprove, onDeny, isApproving }: CollabRequestCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleApproveClick = () => {
    setIsModalOpen(true)
  }

  const handleConfirmApproval = () => {
    onApprove()
    setIsModalOpen(false)
  }

  return (
    <Card className="w-full dark:bg-gray-700">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Path Request</h3>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        </div>
        <div className="mb-4">
          <div className="flex justify-center space-x-3 items-center">
            <Avatar className="w-10 h-10">
              {request.requester.userdp ? (
                <AvatarImage src={request.requester.userdp || "/placeholder.svg"} alt={request.requester.name} />
              ) : (
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.requester.name}`}
                  alt={request.requester.name}
                />
              )}
              <AvatarFallback>{request.requester.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <Avatar className="w-10 h-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="You" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            {request.nextNode && (
              <>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Avatar className="w-10 h-10">
                  {request.nextNode.userdp ? (
                    <AvatarImage src={request.nextNode.userdp || "/placeholder.svg"} alt={request.nextNode.name} />
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
        </div>
        <p className="text-xs text-muted-foreground mb-4 text-center">
          {request.requester.name} → You {request.nextNode ? `→ ${request.nextNode.name}` : ""}
        </p>
        <div className="flex flex-col space-y-2">
          <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={onDeny}>
            <X className="w-4 h-4 mr-2" />
            Deny
          </Button>
          <Button size="sm" className="w-full" onClick={handleApproveClick} disabled={isApproving}>
            {isApproving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Approve
              </>
            )}
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

// Modified FinalPathCard to accept CollaborationRequest
function FinalPathCard({
  request,
  onApprove,
  onDeny,
}: {
  request: CollaborationRequest
  onApprove: () => void
  onDeny: () => void
}) {
  const { data: session } = useSession()
  const currentUserEmail = session?.user?.email
  const isYouTheRecipient = currentUserEmail === request.recipient.email
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmingApproval, setIsConfirmingApproval] = useState(false)

  const handleApproveClick = () => {
    setIsModalOpen(true)
  }

  const handleConfirmApproval = async () => {
    if (!session?.user?.email) {
      toast.error("You must be logged in to approve requests.")
      return
    }
    try {
      setIsConfirmingApproval(true)
      const result = await handleFinalApproval(session.user.email, request.evaluationId, request)
      if (!result.success) {
        // console.log("Failed to approve final path")
      }
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
    <Card className="w-full dark:bg-slate-900 dark:text-white border-2 border-green-500">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Final Path Approval</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Final Step
          </Badge>
        </div>
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-3">Complete Path Chain:</p>
          <div className="space-y-3">
            {/* Display Requester */}
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  {request.requester.userdp ? (
                    <AvatarImage src={request.requester.userdp || "/placeholder.svg"} alt={request.requester.name} />
                  ) : (
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.requester.name}`}
                      alt={request.requester.name}
                    />
                  )}
                  <AvatarFallback>{request.requester.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-medium block">{request.requester.name}</span>
                  <span className="text-xs text-muted-foreground">Requester</span>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 text-xs">Approved</Badge>
            </div>
            {/* Display You (Current Intermediary) */}
            {!isYouTheRecipient && (
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="You" />
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-sm block">You</span>
                    <span className="text-xs text-muted-foreground">Intermediary</span>
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-800 text-xs">Pending</Badge>
              </div>
            )}
            {/* Display Recipient */}
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  {isYouTheRecipient ? (
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="You" />
                  ) : request.recipient.userdp ? (
                    <AvatarImage src={request.recipient.userdp || "/placeholder.svg"} alt={request.recipient.name} />
                  ) : (
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${request.recipient.name}`}
                      alt={request.recipient.name}
                    />
                  )}
                  <AvatarFallback>{isYouTheRecipient ? "You" : request.recipient.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm block">{isYouTheRecipient ? "You" : request.recipient.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {isYouTheRecipient ? "Recipient (You)" : "Recipient"}
                  </span>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-800 text-xs">Pending</Badge>
            </div>
          </div>
        </div>
        <div className="p-3 bg-muted rounded-md mb-4">
          <p className="text-xs">
            As the final intermediary in this path, your approval will complete the path between{" "}
            {request.requester.name} and {request.recipient.name}.
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-transparent"
            onClick={onDeny}
            disabled={isConfirmingApproval}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Deny Path
          </Button>
          <Button size="sm" className="w-full" onClick={handleApproveClick} disabled={isConfirmingApproval}>
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="mx-4 max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Confirm Final Path Approval</DialogTitle>
            <DialogDescription className="text-sm">
              You are about to approve the final connection between {request.requester.name} and{" "}
              {isYouTheRecipient ? "yourself" : request.recipient.name}. This action will complete the path and cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mb-4">
              <p className="text-sm text-amber-800 mb-2">As the final intermediary, your approval will:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-amber-800">
                <li>
                  Allow {request.requester.name} to communicate directly with{" "}
                  {isYouTheRecipient ? "you" : request.recipient.name}
                </li>
                <li>Notify all intermediaries in the path</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="flex flex-col space-y-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isConfirmingApproval}
              className="w-full"
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmApproval} disabled={isConfirmingApproval} className="w-full">
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

export default function CollabContent() {
  const { data: session, status } = useSession()
  const [collab, setCollab] = useState<CollaborationRequest[]>([]) // Regular intermediary requests
  const [finalPaths, setFinalPaths] = useState<{ [key: number]: CollaborationRequest }>({}) // Final intermediary requests
  const [approvedPathsData, setApprovedPathsData] = useState<ApprovedPathRequest[]>([])
  const [rejectedPathsData, setRejectedPathsData] = useState<RejectedPathRequest[]>([])
  const [isLoadingPending, setIsLoadingPending] = useState(true)
  const [isLoadingApproved, setIsLoadingApproved] = useState(true) // Set to true for initial fetch
  const [isLoadingRejected, setIsLoadingRejected] = useState(true) // Set to true for initial fetch
  const [approvingEvaluationId, setApprovingEvaluationId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("pending")

  // Helper function for sorting by createdAt
  const sortByCreatedAtDesc = (a: { createdAt: Date | string }, b: { createdAt: Date | string }) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

  // Effect for fetching all data on initial load
  useEffect(() => {
    const fetchAllRequests = async () => {
      if (status === "authenticated" && session?.user?.email) {
        setIsLoadingPending(true)
        setIsLoadingApproved(true)
        setIsLoadingRejected(true)

        try {
          const [pendingResult, approvedResult, rejectedResult] = await Promise.all([
            fetchRequestsForIntermediary(session.user.email),
            fetchApprovedPaths(session.user.email),
            fetchRejectedPaths(session.user.email),
          ])

          if (pendingResult.success && pendingResult.data) {
            const regular: CollaborationRequest[] = []
            const final: { [key: number]: CollaborationRequest } = {}
            pendingResult.data.forEach((request) => {
              if (request.nextNode === null && request.recipient.email === session.user?.email) {
                final[request.evaluationId] = request
              } else {
                regular.push(request)
              }
            })
            setCollab(regular)
            setFinalPaths(final)
          }

          if (approvedResult.success && approvedResult.data) {
            setApprovedPathsData(approvedResult.data)
          }

          if (rejectedResult.success && rejectedResult.data) {
            setRejectedPathsData(rejectedResult.data)
          }
        } catch (error) {
          console.error("Error fetching all requests:", error)
          toast.error("Failed to load all path data.")
        } finally {
          setIsLoadingPending(false)
          setIsLoadingApproved(false)
          setIsLoadingRejected(false)
        }
      }
    }

    fetchAllRequests()
  }, [session?.user?.email, status]) // Depend on session status and email

  const handleApprove = async (request: CollaborationRequest) => {
    if (!session?.user?.email) {
      toast.error("You must be logged in to approve requests.")
      return
    }
    setApprovingEvaluationId(request.evaluationId)
    try {
      // console.log("approving final request", request)
      const isFinalPath = request.nextNode === null
      // console.log("is Final Path", isFinalPath)
      let result
      if (isFinalPath) {
        result = await handleFinalApproval(session.user.email, request.evaluationId, request)
        if (result.success) {
          toast.success("Final path approved successfully. Connection completed!")
        } else {
          throw new Error(result.error || "Failed to approve final path")
        }
      } else {
        result = await handleApproval(request.evaluationId, session.user.email, request)
        if (result.success) {
          toast.success("Request approved successfully.")
        } else {
          throw new Error(result.error || "Failed to approve request")
        }
      }

      // Update pending requests immediately
      setCollab((prevCollab) => prevCollab.filter((item) => item.evaluationId !== request.evaluationId))
      setFinalPaths((prev) => {
        const newPaths = { ...prev }
        delete newPaths[request.evaluationId]
        return newPaths
      })

      // Add the approved request to approvedPathsData
      setApprovedPathsData((prev) =>
        [...prev, { ...request, status: "COMPLETED", createdAt: new Date().toISOString() }].sort(sortByCreatedAtDesc),
      )
    } catch (error: any) {
      console.error("Error approving request:", error)
      toast.error(error.message || "An error occurred while approving the request.")
    } finally {
      setApprovingEvaluationId(null)
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
        // Update pending requests immediately
        setCollab((prevCollab) => prevCollab.filter((item) => item.evaluationId !== request.evaluationId))
        setFinalPaths((prev) => {
          const newPaths = { ...prev }
          delete newPaths[request.evaluationId]
          return newPaths
        })

        // Add the rejected request to rejectedPathsData
        setRejectedPathsData((prev) =>
          [...prev, { ...request, status: "REJECTED", createdAt: new Date().toISOString() }].sort(sortByCreatedAtDesc),
        )
      } else {
        throw new Error(result.error || "Failed to reject request")
      }
    } catch (error: any) {
      console.error("Error rejecting request:", error)
      toast.error(error.message || "An error occurred while rejecting the request.")
    }
  }

  if (status === "loading" || isLoadingPending || isLoadingApproved || isLoadingRejected) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Loader2 className="w-10 h-10 animate-spin text-primary" aria-label="Loading" />
      </div>
    )
  }

  if (!session) {
    return <div className="text-center p-4">Please sign in to view collaboration requests</div>
  }

  const regularRequests = collab.filter((request) => !finalPaths[request.evaluationId])
  const hasFinalPaths = Object.keys(finalPaths).length > 0
  const pendingCount = regularRequests.length + Object.keys(finalPaths).length
  const approvedPathsCount = approvedPathsData.length
  const rejectedPathsCount = rejectedPathsData.length

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-background">
        <div className="space-y-4 p-3">
          <div className="space-y-3">
            <h1 className="text-lg font-bold">Incoming Paths</h1>
          </div>
          <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="pending" className="flex flex-col items-center gap-1 py-2 text-xs">
                <Clock className="w-4 h-4" />
                <span>Pending</span>
                <span className="text-xs text-muted-foreground">({pendingCount})</span>
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex flex-col items-center gap-1 py-2 text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>Approved</span>
                <span className="text-xs text-muted-foreground">({approvedPathsCount})</span>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex flex-col items-center gap-1 py-2 text-xs">
                <XCircle className="w-4 h-4" />
                <span>Rejected</span>
                <span className="text-xs text-muted-foreground">({rejectedPathsCount})</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="space-y-6 mt-4">
              {hasFinalPaths && (
                <div className="space-y-4 mt-8">
                  <h2 className="text-base font-semibold">Final Path Approvals</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    You are the final intermediary for these paths. Your approval will complete the connection.
                  </p>
                  <div className="space-y-4">
                    {Object.entries(finalPaths)
                      .sort(([, a], [, b]) => sortByCreatedAtDesc(a, b)) // Sort final paths
                      .map(([evaluationId, pathData]) => {
                        return (
                          <FinalPathCard
                            key={evaluationId}
                            request={pathData} // Pass CollaborationRequest directly
                            onApprove={() => handleApprove(pathData)}
                            onDeny={() => handleReject(pathData)}
                          />
                        )
                      })}
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <h2 className="text-base font-semibold">Oncoming Paths</h2>
                {regularRequests.length === 0 ? (
                  <div className="text-center p-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                    <Clock className="w-8 h-8 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No oncoming paths at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4 pb-24">
                    {regularRequests
                      .sort(sortByCreatedAtDesc) // Sort regular requests
                      .map((request) => (
                        <CollabRequestCard
                          key={request.evaluationId}
                          request={request}
                          onApprove={() => handleApprove(request)}
                          onDeny={() => handleReject(request)}
                          isApproving={approvingEvaluationId === request.evaluationId}
                        />
                      ))}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="approved" className="space-y-4 mt-4">
              <h2 className="text-base font-semibold">Approved Paths You Started</h2>
              <p className="text-sm text-muted-foreground mb-4">
                These are paths where you were the first intermediary and the path has been completed.
              </p>
              {isLoadingApproved ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Loading approved paths" />
                </div>
              ) : approvedPathsData.length === 0 ? (
                <div className="text-center p-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No completed paths yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedPathsData.sort(sortByCreatedAtDesc).map((request) => (
                    <ApprovedPathCard key={`approved-path-${request.evaluationId}`} request={request} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="rejected" className="space-y-4 mt-4">
              <h2 className="text-base font-semibold">Rejected Paths</h2>
              <p className="text-sm text-muted-foreground mb-4">
                These are paths where you were the first intermediary and the path was rejected.
              </p>
              {isLoadingRejected ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" aria-label="Loading rejected paths" />
                </div>
              ) : rejectedPathsData.length === 0 ? (
                <div className="text-center p-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                  <XCircle className="w-8 h-8 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No rejected paths yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rejectedPathsData.sort(sortByCreatedAtDesc).map((request) => (
                    <RejectedPathCard key={`rejected-path-${request.evaluationId}`} request={request} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
