"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ResultsList from "@/components/ui/sections/ResultsList";
import CollabContent from "@/components/ui/sections/CollabContent";
import RecentsContent from "@/components/ui/sections/RecentsContent";
import Chat from "@/components/ui/sections/Chat";
import { useIsMobile } from "@/hooks/use-mobile";
import { SignInDialog } from "@/components/ui/sections/SigninDialog";
import { MessageCircleIcon as ChatBubbleIcon } from "lucide-react";
import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { fetchRequestsForIntermediary } from "@/app/api/actions/network";

type FilterType = "results" | "collab" | "recents" | "chats";

function Sidetabs({ initialExpanded, initialTab, userEmail }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>(
    (initialTab as FilterType) || "results"
  );
  const [collabCount, setCollabCount] = useState<number | null>(null);

  useEffect(() => {
    if (!userEmail) return;
    console.log("email",userEmail)
    const intervalId = setInterval(async () => {
      const response = await fetchRequestsForIntermediary(userEmail)
      console.log("response")
      if (response.data.length>0) {
        setCollabCount(response.data.length);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(intervalId);
  }, [userEmail]);

  const toggleSidebar = () => {
    const newExpandState = !isExpanded;
    setIsExpanded(newExpandState);
    router.replace(`/?tab=${activeFilter}&expand=${newExpandState}`);
  };

  const handleTabChange = (value: FilterType) => {
    if (!userEmail) {
      setIsSignInDialogOpen(true);
      return;
    }
    setActiveFilter(value);
    setIsExpanded(true);
    router.replace(`/?tab=${value}&expand=true`);
  };

  return (
    <div
      className={`absolute left-0 top-0 h-full bg-slate-50 rounded-xl backdrop-blur-sm transition-all duration-300 shadow-lg z-10 flex ${
        isExpanded ? (isMobile ? "w-[340px]" : "w-[450px]") : "w-10 md:w-16"
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
            className="w-7 h-7 md:w-8 md:h-8 p-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Search className="md:w-8 md:h-8 w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger
            value="collab"
            className="w-7 h-7 md:w-8 md:h-8 p-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative"
          >
            <Users className="w-4 h-4 md:w-8 md:h-8" />
            {collabCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-4 w-4 md:w-8 md:h-8 p-1 flex items-center justify-center text-[10px]"
                variant="destructive"
              >
                {collabCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="recents"
            className="w-7 h-7 md:w-8 md:h-8 p-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Clock className="w-4 h-4 md:w-8 md:h-8" />
          </TabsTrigger>
          <TabsTrigger
            value="chats"
            className="w-7 h-7 md:w-8 md:h-8 p-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <ChatBubbleIcon className="w-4 h-4 md:w-8 md:h-8" />
          </TabsTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="w-5 h-5 p-0 md:hidden"
            onClick={toggleSidebar}
          >
            {isExpanded ? (
              <ChevronDoubleLeftIcon className="h-5 w-5 text-red-400" />
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
              <Chat />
            </TabsContent>
          </div>
        )}
      </Tabs>

      <Button
        variant="secondary"
        size="icon"
        className="absolute -right-6 top-1/2 transform -translate-y-1/2 h-24 w-6 rounded-l-none rounded-r-lg shadow-lg border-l-0 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={toggleSidebar}
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* SignIn Dialog */}
      <SignInDialog
        isOpen={isSignInDialogOpen}
        onClose={() => setIsSignInDialogOpen(false)}
      />
    </div>
  );
}

export default Sidetabs;