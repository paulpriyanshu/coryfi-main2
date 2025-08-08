"use client"

import { useEffect, useState } from "react"
import { ArrowUp, CheckCircle, XCircle, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getOngoingEvaluations } from "@/app/api/actions/network"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function EvaluationPaths() {
  const [evaluationsData, setEvaluationsData] = useState(null)
  const { data: session, status } = useSession()

  useEffect(() => {
    async function loadData() {
      const data = await getOngoingEvaluations(session?.user?.email)
      if (data) {
        console.log("new data", data)
        setEvaluationsData(data)
      }
    }
    loadData()
  }, [session])

  if (!evaluationsData) return <EvaluationPathsSkeleton />

  // Process the data to categorize evaluations properly
  const ongoingEvaluations =
    evaluationsData.ongoingEvaluations?.filter((evaluation) => evaluation.status === "ONGOING") || []
  const completedEvaluations = evaluationsData.completeEvaluations || []
  const rejectedEvaluations =
    evaluationsData.incompleteEvaluations?.filter((evaluation) => evaluation.status === "REJECTED") || []

  const getTabCount = (evaluations) => evaluations?.length || 0

  return (
    <div className="w-full">
      <Tabs defaultValue="ongoing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ongoing" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Ongoing
            <Badge variant="secondary" className="ml-1">
              {getTabCount(ongoingEvaluations)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed
            <Badge variant="secondary" className="ml-1">
              {getTabCount(completedEvaluations)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Rejected
            <Badge variant="secondary" className="ml-1">
              {getTabCount(rejectedEvaluations)}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing" className="mt-6">
          <EvaluationSection
            evaluations={ongoingEvaluations}
            userData={evaluationsData.userData}
            status="ongoing"
            emptyMessage="No ongoing evaluations"
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <EvaluationSection
            evaluations={completedEvaluations}
            userData={evaluationsData.userData}
            status="completed"
            emptyMessage="No completed evaluations"
          />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <EvaluationSection
            evaluations={rejectedEvaluations}
            userData={evaluationsData.userData}
            status="rejected"
            emptyMessage="No rejected evaluations"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EvaluationSection({ evaluations, userData, status, emptyMessage }) {
  if (!evaluations || evaluations.length === 0) {
    return (
      <Card className="w-full dark:bg-gray-700">
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-lg text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {evaluations.map((evaluation) => (
        <EvaluationPathCard
          key={evaluation.id}
          userData={userData}
          intermediaries={evaluation.paths}
          status={status}
          evaluation={evaluation}
        />
      ))}
    </div>
  )
}

function EvaluationPathCard({ userData, intermediaries, status, evaluation }) {
  if (!intermediaries || intermediaries.length === 0 || !userData) return null

  const allNodes = [{ ...userData, approved: "SELF" }, ...intermediaries]
  const nodesToShow = allNodes.length > 5 ? [...allNodes.slice(0, 2), "...", ...allNodes.slice(-2)] : allNodes

  // Only show arrow for ongoing evaluations
  const firstUnapprovedIndex = status === "ongoing" ? intermediaries.findIndex((node) => node.approved === "FALSE") : -1
  const arrowIndex = firstUnapprovedIndex === -1 ? -1 : firstUnapprovedIndex + 1

  // Get the end node name - handle both direct recipient and intermediary path
  const endNode = intermediaries[intermediaries.length - 1]
  const endNodeName = endNode?.name || endNode?.intermediary?.name || "Unknown"

  // Determine card styling based on status
  const getCardClassName = () => {
    switch (status) {
      case "completed":
        return "w-full dark:bg-slate-900 border-green-200 dark:border-green-800 text-sm"
      case "rejected":
        return "w-full dark:bg-slate-900 border-red-200 dark:border-red-800 text-sm"
      default:
        return "w-full dark:bg-slate-900 text-sm"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-orange-500" />
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Completed
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            In Progress
          </Badge>
        )
    }
  }

  return (
    <Card className={getCardClassName()}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            {getStatusIcon()}
            Path to {endNodeName}
          </CardTitle>
          {getStatusBadge()}
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>
              {status === "completed" && "Completed"}
              {status === "rejected" && "Rejected"}
              {status === "ongoing" && "Started"} on{" "}
              {new Date(status === "ongoing" ? evaluation.createdAt : evaluation.updatedAt).toLocaleDateString()}
            </span>
            <span className="text-xs">Last updated: {new Date(evaluation.updatedAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Evaluation ID: #{evaluation.id}</span>
            <span>
              {intermediaries.length} step{intermediaries.length !== 1 ? "s" : ""} in path
            </span>
          </div>
          {status === "ongoing" && (
            <div className="text-xs">
              Progress: {intermediaries.filter((node) => node.approved === "TRUE").length}/{intermediaries.length}{" "}
              approvals
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <TooltipProvider>
          <div className="relative py-8">
            {/* Container for nodes with proper spacing */}
            <div className="flex items-center justify-between px-6">
              {nodesToShow.map((node, index) =>
                node === "..." ? (
                  <div key={`ellipsis-${index}`} className="flex flex-col items-center">
                    <div className="text-gray-500 text-2xl font-bold mb-2">•••</div>
                    <div className="h-4"></div>
                  </div>
                ) : (
                  <Tooltip key={node.id || node.intermediary?.id}>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center relative max-w-[80px]">
                        <Avatar
                          className={`w-12 h-12 relative z-10 ring-4 ${
                            node.approved === "TRUE"
                              ? "ring-green-500"
                              : node.approved === "SELF"
                                ? "ring-blue-500"
                                : node.approved === "REJECTED"
                                  ? "ring-red-500"
                                  : "ring-orange-500"
                          } ring-offset-2 transition-all duration-300 hover:scale-110`}
                        >
                          <AvatarImage
                            src={node.userdp || node.intermediary?.userdp}
                            alt={node.name || node.intermediary?.name}
                          />
                          <AvatarFallback>{(node.name || node.intermediary?.name)?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="mt-2 text-center">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate w-full">
                            {(node.name || node.intermediary?.name)?.split(" ")[0]}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate w-full">
                            {node.approved === "SELF"
                              ? "You"
                              : node.approved === "TRUE"
                                ? "Approved"
                                : node.approved === "REJECTED"
                                  ? "Rejected"
                                  : "Pending"}
                          </p>
                        </div>
                        {index === arrowIndex && status === "ongoing" && (
                          <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2">
                            <ArrowUp className="w-6 h-6 text-primary animate-bounce" />
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">{node.name || node.intermediary?.name}</p>
                        <p className="text-xs text-muted-foreground">{node.email || node.intermediary?.email}</p>
                        <p className="text-xs font-medium">
                          Status:{" "}
                          <span
                            className={
                              node.approved === "TRUE"
                                ? "text-green-500"
                                : node.approved === "SELF"
                                  ? "text-blue-500"
                                  : node.approved === "REJECTED"
                                    ? "text-red-500"
                                    : "text-orange-500"
                            }
                          >
                            {node.approved === "SELF"
                              ? "Self (You)"
                              : node.approved === "TRUE"
                                ? "Approved"
                                : node.approved === "REJECTED"
                                  ? "Rejected"
                                  : "Pending Approval"}
                          </span>
                        </p>
                        {node.intermediary?.introductoryFlow !== undefined && (
                          <p className="text-xs">
                            Flow: {node.intermediary.introductoryFlow ? "Introductory" : "Standard"}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ),
              )}
            </div>

            {/* Connecting line - properly aligned with avatar centers */}
            <div
              className={`absolute left-6 right-6 h-0.5 z-0 ${
                status === "completed"
                  ? "bg-gradient-to-r from-blue-500 to-green-500"
                  : status === "rejected"
                    ? "bg-gradient-to-r from-blue-500 to-red-500"
                    : "bg-gradient-to-r from-blue-500 via-orange-500 to-green-500"
              }`}
              style={{
                top: "56px", // Adjusted to align with avatar centers (py-8 + w-12/2 = 32px + 24px = 56px from container top, but we want line at avatar center)
              }}
            />
          </div>

          {/* Additional details section */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                {/* <span className="text-muted-foreground">Duration:</span>
                <span className="ml-2 font-medium">
                  {Math.ceil((new Date(evaluation.updatedAt) - new Date(evaluation.createdAt)) / (1000 * 60 * 60 * 24))}{" "}
                  days
                </span> */}
              </div>
              <div>
                <span className="text-muted-foreground">Recipient:</span>
                <span className="ml-2 font-medium">{endNodeName}</span>
              </div>
              {status === "ongoing" && (
                <>
                  <div>
                    <span className="text-muted-foreground">Next Action:</span>
                    <span className="ml-2 font-medium text-orange-600">
                      {firstUnapprovedIndex !== -1
                        ? `Waiting for ${intermediaries[firstUnapprovedIndex]?.intermediary?.name || "approval"}`
                        : "All approved"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pending Since:</span>
                    <span className="ml-2 font-medium">
                      {Math.ceil((new Date() - new Date(evaluation.createdAt)) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}

function EvaluationPathsSkeleton() {
  return (
    <div className="w-full ">
      <div className="flex space-x-1 mb-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 flex-1" />
        ))}
      </div>
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <Card key={i} className="w-full  dark:bg-slate-900 dark:text-white">
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between space-x-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="w-12 h-12 rounded-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
