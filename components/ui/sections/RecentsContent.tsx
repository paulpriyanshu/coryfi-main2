"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
        console.log("new data",data)
        setEvaluationsData(data)
      }
    }
    loadData()
  }, [session])

  if (!evaluationsData) return <EvaluationPathsSkeleton />

  if (evaluationsData.ongoingEvaluations.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-lg text-muted-foreground">No paths started yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {evaluationsData.ongoingEvaluations.map((evaluation) => (
        <EvaluationPathCard key={evaluation.id} userData={evaluationsData.userData} intermediaries={evaluation.paths} />
      ))}
    </div>
  )
}

function EvaluationPathCard({ userData, intermediaries }) {
  if (!intermediaries || intermediaries.length === 0 || !userData) return null

  const allNodes = [{ ...userData, approved: "SELF" }, ...intermediaries]
  const nodesToShow = allNodes.length > 5 ? [...allNodes.slice(0, 2), "...", ...allNodes.slice(-2)] : allNodes

  const firstUnapprovedIndex = intermediaries.findIndex((node) => node.approved === "FALSE")
  const arrowIndex = firstUnapprovedIndex === -1 ? -1 : firstUnapprovedIndex + 1 // +1 because of the user node

  // Get the end node name
  const endNode = intermediaries[intermediaries.length - 1]
  const endNodeName = endNode?.name || endNode?.intermediary?.name || "Unknown"

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Path to {endNodeName}</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="relative py-6">
            <div className="flex items-center justify-between space-x-4">
              {nodesToShow.map((node, index) =>
                node === "..." ? (
                  <div key={`ellipsis-${index}`} className="text-gray-500 text-2xl font-bold">
                    •••
                  </div>
                ) : (
                  <Tooltip key={node.id || node.intermediary?.id}>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center relative">
                        <Avatar
                          className={`w-12 h-12 relative z-10 ring-4 ${
                            node.approved === "TRUE"
                              ? "ring-green-500"
                              : node.approved === "SELF"
                                ? "ring-blue-500"
                                : "ring-orange-500"
                          } ring-offset-2 transition-all duration-300 hover:scale-110`}
                        >
                          <AvatarImage
                            src={node.userdp || node.intermediary?.userdp}
                            alt={node.name || node.intermediary?.name}
                          />
                          <AvatarFallback>{(node.name || node.intermediary?.name)?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {index === arrowIndex && (
                          <div className="absolute -bottom-8">
                            <ArrowUp className="w-6 h-6 text-primary animate-bounce" />
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{node.name || node.intermediary?.name}</p>
                      <p className="text-xs text-muted-foreground">{node.email || node.intermediary?.email}</p>
                      <p className="text-xs font-medium mt-1">
                        Status:{" "}
                        <span
                          className={
                            node.approved === "TRUE"
                              ? "text-green-500"
                              : node.approved === "SELF"
                                ? "text-blue-500"
                                : "text-orange-500"
                          }
                        >
                          {node.approved === "SELF" ? "Self" : node.approved === "TRUE" ? "Approved" : "Pending"}
                        </span>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ),
              )}
            </div>

            {/* Line connecting nodes */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-orange-500 to-green-500 -translate-y-1/2 z-0"></div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}

function EvaluationPathsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <Card key={i} className="w-full">
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
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
  )
}

