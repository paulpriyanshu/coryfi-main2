"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Users, Clock, ChevronLeft, ChevronRight, MessageCircleIcon as ChatBubbleIcon } from "lucide-react"
import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import ResultsList from "@/components/ui/sections/ResultsList"
import CollabContent from "@/components/ui/sections/CollabContent"
import RecentsContent from "@/components/ui/sections/RecentsContent"
import Chat from "@/components/ui/sections/Chat"
import { useIsMobile } from "@/hooks/use-mobile"
import { SignInDialog } from "@/components/ui/sections/SigninDialog"
import { Badge } from "@/components/ui/badge"
import { fetchRequestsForIntermediary } from "@/app/api/actions/network"

type FilterType = "results" | "collab" | "recents" | "chats"

function Sidetabs({ initialExpanded, initialTab, userEmail }) {
  const isMobile = useIsMobile()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(initialExpanded)
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>((initialTab as FilterType) || "results")
  const [collabCount, setCollabCount] = useState<number | null>(null)

  useEffect(() => {
    if (!userEmail) return

    const intervalId = setInterval(
      async () => {
        const response = await fetchRequestsForIntermediary(userEmail)
        if (response.data.length > 0) {
          setCollabCount(response.data.length)
        }
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes

    return () => clearInterval(intervalId)
  }, [userEmail])

  const toggleSidebar = () => {
    const newExpandState = !isExpanded
    setIsExpanded(newExpandState)
    router.replace(`/?tab=${activeFilter}&expand=${newExpandState}`)
  }

  const handleTabChange = (value: FilterType) => {
    if (!userEmail) {
      setIsSignInDialogOpen(true)
      return
    }
    setActiveFilter(value)
    setIsExpanded(true)
    router.replace(`/?tab=${value}&expand=true`)
  }

  const tabTriggerBase =
    "w-7 h-7 md:w-8 md:h-8 p-1 rounded-md transition-all duration-200 " +
    "hover:bg-muted hover:text-foreground " +
    "dark:hover:bg-slate-700/70 dark:hover:text-slate-200 " +
    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground " +
    "dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 " +
    "data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-primary/20 " +
    "dark:data-[state=active]:ring-slate-200/20 " +
    "dark:[&[data-state=active]]:text-slate-900 dark:[&[data-state=active]>*]:text-slate-900"

  return (
    <div
      className={`absolute left-0 top-0 h-full bg-slate-50 dark:bg-slate-900 rounded-xl backdrop-blur-sm transition-all duration-300 shadow-lg z-10 flex ${
        isExpanded ? (isMobile ? "w-[340px]" : "w-[450px]") : "w-10 md:w-16"
      }`}
    >
      <Tabs
        value={activeFilter}
        onValueChange={(value) => handleTabChange(value as FilterType)}
        orientation="vertical"
        className="flex h-full w-full"
      >
        <TabsList className="h-full w-10 md:w-16 flex flex-col items-center py-4 space-y-4 bg-muted/50 dark:bg-slate-800/70">
          <TabsTrigger value="results" className={tabTriggerBase}>
            <Search className="md:w-5 md:h-5 w-4 h-4" />
          </TabsTrigger>

          <TabsTrigger value="collab" className={`${tabTriggerBase} relative`}>
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            {collabCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-4 w-4 md:w-5 md:h-5 p-1 flex items-center justify-center text-[10px]"
                variant="destructive"
              >
                {collabCount}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger value="recents" className={tabTriggerBase}>
            <Clock className="w-4 h-4 md:w-5 md:h-5" />
          </TabsTrigger>

          <TabsTrigger value="chats" className={tabTriggerBase}>
            <ChatBubbleIcon className="w-4 h-4 md:w-5 md:h-5" />
          </TabsTrigger>

          <Button
            variant="ghost"
            size="icon"
            className="w-5 h-5 p-0 md:hidden hover:bg-slate-200 dark:hover:bg-slate-700"
            onClick={toggleSidebar}
          >
            {isExpanded ? (
              <ChevronDoubleLeftIcon className="h-4 w-4 text-red-400" />
            ) : (
              <ChevronRight className="h-4 w-4" />
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
              <Chat />
            </TabsContent>
          </div>
        )}
      </Tabs>

      <Button
        variant="secondary"
        size="icon"
        className="absolute -right-6 top-1/2 transform -translate-y-1/2 h-24 w-6 rounded-l-none rounded-r-lg shadow-lg border-l-0 flex items-center justify-center hover:bg-accent hover:text-accent-foreground dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
        onClick={toggleSidebar}
      >
        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      <SignInDialog isOpen={isSignInDialogOpen} onClose={() => setIsSignInDialogOpen(false)} />
    </div>
  )
}

export default Sidetabs