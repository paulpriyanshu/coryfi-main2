'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Users, Clock, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import PersonalNetwork from '@/components/ui/sections/PersonalNetwork';
import { useAppSelector } from './libs/store/hooks';
import { selectResponseData } from './libs/features/pathdata/pathSlice';
import ResultsList from '@/components/ui/sections/ResultsList';
import CollabContent from '@/components/ui/sections/CollabContent';
import RecentsContent from '@/components/ui/sections/RecentsContent';
import Chat from '@/components/ui/sections/Chat';
import { useIsMobile } from './hooks/use-mobile';
import { fetchUserData } from './api/actions/media';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { SignInDialog } from '@/components/ui/sections/SigninDialog';
import { MessageCircleIcon as ChatBubbleIcon } from 'lucide-react';
import { ChevronDoubleLeftIcon } from '@heroicons/react/24/outline';
import { Badge } from "@/components/ui/badge";
import { fetchRequestsForIntermediary } from '@/app/api/actions/network';

type FilterType = 'results' | 'collab' | 'recents' | 'chats';

type PathNode = {
  id: string;
  name: string;
  avatar: string;
};

type ConnectionPath = {
  id: string;
  nodes: PathNode[];
};

function Component() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('results');
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const isMobile = useIsMobile();
  const [receiverId, setReceiverId] = useState(null);
  const { data: session, status } = useSession();
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [collabCount, setCollabCount] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = useAppSelector(selectResponseData);
  const structuredData = {
    nodes: data?.nodes || [],
    links: data?.links || [],
  };

  useEffect(() => {
    const initialTab = searchParams.get('tab') as FilterType;
    const shouldExpand = searchParams.get('expand') === 'true';
    const id = searchParams.get('id');
    
    if (id) {
      // console.log('ID from query:', id);
    }

    if (initialTab) {
      setActiveFilter(initialTab);
    }
    setIsExpanded(shouldExpand);
  }, [searchParams]);

  useEffect(() => {
    async function fetchCollabCount() {
      if (session?.user?.email) {
        const collabData = await fetchRequestsForIntermediary(session.user.email);
        if (collabData.success && collabData.data) {
          setCollabCount(collabData.data.length);
        }
      }
    }

    fetchCollabCount();
    const intervalId = setInterval(fetchCollabCount, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(intervalId);
  }, [session]);

  const toggleSidebar = () => {
    const newExpandState = !isExpanded;
    setIsExpanded(newExpandState);
    router.replace(`/?tab=${activeFilter}&expand=${newExpandState}`);
  };

  const handleTabChange = (value: FilterType) => {
    if (!session) {
      setIsSignInDialogOpen(true);
      return;
    }
    setActiveFilter(value);
    setIsExpanded(true);
    router.replace(`/?tab=${value}&expand=true`);
  };

  const handleResize = (event: any, { size }: { size: { width: number } }) => {
    setSidebarWidth(size.width);
  };

  useEffect(() => {
    const id = searchParams.get('id');

    async function getUser() {
      if (activeFilter === 'chats' && id && session?.user?.email) {
        const receiverData = await fetchUserData(Number(id));
        const receiverChatData = await axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${receiverData.email}`);
        const userChatData = await axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${session?.user?.email}`);
        const chat = await axios.post(`https://chat.coryfi.com/api/v1/chat-app/chats/c/${receiverChatData?.data?.data?._id}/${userChatData?.data?.data?._id}`);
        setReceiverId(id);
      }
    }

    if (session?.user?.email) {
      getUser();
    }
  }, [activeFilter, searchParams, session?.user?.email]); 

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="h-screen w-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0">
          <PersonalNetwork data={structuredData} />
        </div>

        <div
          className={`absolute left-0 top-0 h-full bg-slate-50 md:w-16 rounded-xl backdrop-blur-sm transition-all duration-300 shadow-lg z-10 flex ${
            isExpanded ? (isMobile ? 'w-[340px]' : 'w-[400px]') : 'w-10'
          }`}
        >
          <Tabs
            value={activeFilter}
            onValueChange={(value) => handleTabChange(value as FilterType)}
            orientation="vertical"
            className="flex h-full w-full"
          >
            <TabsList className="h-full w-10 md:w-16 flex flex-col items-center py-4 space-y-4 bg-muted/50">
              <TabsTrigger value="results" className="w-7 h-7 md:w-8 md:h-8 p-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Search className="md:w-8 md:h-8 w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="collab" className="w-7 h-7 md:w-8 md:h-8 p-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative">
                <Users className="w-4 h-4 md:w-8 md:h-8" />
                {collabCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 md:w-8 md:h-8 p-1flex items-center justify-center text-[10px]" variant="destructive">
                    {collabCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="recents" className="w-7 h-7 md:w-8 md:h-8 p-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Clock className="w-4 h-4 md:w-8 md:h-8" />
              </TabsTrigger>
              <TabsTrigger value="chats" className="w-7 h-7 md:w-8 md:h-8 p-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ChatBubbleIcon className="w-4 h-4 md:w-8 md:h-8" />
              </TabsTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="w-5 h-5 p-0 md:hidden"
                onClick={toggleSidebar}
              >
                {isExpanded ? <ChevronDoubleLeftIcon className="h-5 w-5 text-red-400" /> : <ChevronRight className="h-5 w-5" />}
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
            {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        <SignInDialog
          isOpen={isSignInDialogOpen}
          onClose={() => setIsSignInDialogOpen(false)}
        />
      </div>
    </Suspense>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
}

