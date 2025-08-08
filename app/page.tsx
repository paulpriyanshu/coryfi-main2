"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Clock, ChevronLeft, ChevronRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import PersonalNetwork from "@/components/ui/sections/PersonalNetwork"
import { useAppSelector } from "./libs/store/hooks"
import { selectResponseData } from "./libs/features/pathdata/pathSlice"
import ResultsList from "@/components/ui/sections/ResultsList"
import CollabContent from "@/components/ui/sections/CollabContent"
import RecentsContent from "@/components/ui/sections/RecentsContent"
import Chat from "@/components/ui/sections/Chat"
import { useIsMobile } from "../hooks/use-mobile"
import { useSession } from "next-auth/react"
import { SignInDialog } from "@/components/ui/sections/SigninDialog"
import { MessageCircleIcon as ChatBubbleIcon } from "lucide-react"
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/outline"
import { Badge } from "@/components/ui/badge"
import { fetchReachableNodes, fetchRequestsForIntermediary, getOngoingEvaluations } from "@/app/api/actions/network"
import SignupComponent from "./signup/SignupComponent"

type FilterType = "results" | "collab" | "recents" | "chats"

type PathNode = {
  id: string
  name: string
  avatar: string
}

type ConnectionPath = {
  id: string
  nodes: PathNode[]
}

function Component() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterType>("results")
  const [sidebarWidth, setSidebarWidth] = useState(400)
  const isMobile = useIsMobile()
  const [receiverId, setReceiverId] = useState(null)
  const { data: session, status } = useSession()
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [collabCount, setCollabCount] = useState(0)
  const [evaluationCount, setEvaluationCount] = useState(0)
  const [chatRecieverId, setchatRecieverId] = useState(null)
  const [suggestionCount, setSuggestionCount] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()
  const data = useAppSelector(selectResponseData)

  const structuredData = {
    nodes: data?.nodes || [],
    links: data?.links || [],
  }

  useEffect(() => {
    const initialTab = searchParams.get("tab") as FilterType
    const shouldExpand = searchParams.get("expand") === "true"
    const id = searchParams.get("rid")

    if (id) {
      setchatRecieverId(id)
    }

    if (initialTab) {
      setActiveFilter(initialTab)
    }

    setIsExpanded(shouldExpand)
  }, [searchParams])

  useEffect(() => {
    async function fetchCollabCount() {
      if (session?.user?.email) {
        const collabData = await fetchRequestsForIntermediary(session.user.email)
        // console.log("collab data", collabData)
        if (collabData?.success && collabData?.data) {
          setCollabCount(collabData.data.length)
        }
      }
    }

    async function EvaluationCount() {
      if (session?.user?.email) {
        const collabData = await getOngoingEvaluations(session.user.email)
        if (collabData?.ongoingEvaluations?.length > 0) {
          setEvaluationCount(collabData?.ongoingEvaluations?.length)
        }
      }
    }

    async function suggestionsCount() {
      if (session?.user?.email) {
        const result = await fetchReachableNodes(session.user.email)
        if (result.data.length > 0) {
          setSuggestionCount(result.data.length)
        }
      }
    }

    EvaluationCount()
    fetchCollabCount()
    suggestionsCount()
  }, [session])

  const toggleSidebar = () => {
    const newExpandState = !isExpanded
    setIsExpanded(newExpandState)
    router.replace(`/?tab=${activeFilter}&expand=${newExpandState}`)
  }

  const handleTabChange = (value: FilterType) => {
    if (!session) {
      setIsSignInDialogOpen(true)
      return
    }

    setActiveFilter(value)
    setIsExpanded(true)
    router.replace(`/?tab=${value}&expand=true`)
  }

  const handleResize = (event: any, { size }: { size: { width: number } }) => {
    setSidebarWidth(size.width)
  }

  if (!session) {
    return <SignupComponent />
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="h-screen w-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0">
          <PersonalNetwork data={structuredData} />
        </div>

        <div
          className={`absolute left-0 top-0 h-full bg-slate-50 dark:bg-black rounded-xl backdrop-blur-sm transition-all duration-300 shadow-lg z-10 flex ${
            isExpanded ? (isMobile ? "w-full" : "w-[480px]") : "w-10 md:w-16"
          }`}
        >
          <Tabs
            value={activeFilter}
            onValueChange={(value) => handleTabChange(value as FilterType)}
            orientation="vertical"
            className="flex h-full w-full"
          >
            <TabsList className="h-full w-10 md:w-16 flex flex-col items-center py-4 space-y-4 bg-muted/50">
              <TabsTrigger
                value="results"
                className="relative w-7 h-7 md:w-8 md:h-8 p-1 data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-black"
              >
                <Search className="w-4 h-4 md:w-8 md:h-8 text-gray-400 data-[state=active]:text-white dark:text-white dark:data-[state=active]:text-black" />
                {suggestionCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center text-[10px] font-semibold min-w-[16px] md:min-w-[20px] px-1"
                    variant="destructive"
                  >
                    {suggestionCount > 10 ? "9+" : suggestionCount}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="collab"
                className="relative w-7 h-7 md:w-8 md:h-8 p-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-black"
              >
                <User className="w-4 h-4 md:w-8 md:h-8 text-gray-400 dark:text-white dark:data-[state=active]:text-black" />
                {collabCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center text-[10px] font-semibold min-w-[16px] md:min-w-[20px] px-1"
                    variant="destructive"
                  >
                    {collabCount > 99 ? "99+" : collabCount}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="recents"
                className="relative w-7 h-7 md:w-8 md:h-8 p-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-black"
              >
                <Clock className="w-4 h-4 md:w-8 md:h-8 text-gray-400 dark:text-white dark:data-[state=active]:text-black" />
                {evaluationCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center text-[10px] font-semibold min-w-[16px] md:min-w-[20px] px-1"
                    variant="destructive"
                  >
                    {evaluationCount > 99 ? "99+" : evaluationCount}
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="chats"
                className="w-7 h-7 md:w-8 md:h-8 p-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-slate-600 dark:data-[state=active]:text-black"
              >
                <ChatBubbleIcon className="w-4 h-4 md:w-8 md:h-8 text-gray-400 dark:text-white dark:data-[state=active]:text-black" />
              </TabsTrigger>

              <Button variant="ghost" size="icon" className="w-5 h-5 p-0 md:hidden" onClick={toggleSidebar}>
                {isExpanded ? (
                  <ChevronDoubleLeftIcon className="h-5 w-5 text-red-400 animate-bounce-horizontal" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Button>
            </TabsList>

            {isExpanded && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <TabsContent value="results" className="flex-1 overflow-auto">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <ResultsList />
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="collab" className="flex-1 overflow-auto">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <CollabContent />
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="recents" className="flex-1 overflow-auto">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      <RecentsContent />
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="chats" className="flex-1 overflow-hidden">
                  <Chat chatRecieverId={chatRecieverId} />
                </TabsContent>
              </div>
            )}
          </Tabs>

        <Button
            variant="secondary"
            size="icon"
            className={`absolute -right-6 top-1/2 transform -translate-y-1/2 h-24 w-6 rounded-l-none rounded-r-lg shadow-lg border-l-0 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors ${
              isExpanded ? "hidden sm:flex" : ""
            }`}
            onClick={toggleSidebar}
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronDoubleRightIcon className="h-4 w-4 animate-bounce-horizontal text-black dark:text-blue-500 font-semibold" />
            )}
          </Button>
        </div>

        <SignInDialog isOpen={isSignInDialogOpen} onClose={() => setIsSignInDialogOpen(false)} />
      </div>
    </Suspense>
  )
}

export default function Page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Component />
      </Suspense>
    </>
  )
}
