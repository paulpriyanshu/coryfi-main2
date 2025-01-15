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
  const [Email, setEmail] = useState("");
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const data = useAppSelector(selectResponseData);
  const structuredData = {
    nodes: data?.nodes || [],
    links: data?.links || [],
  };

  // Set email when session is available
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  // Handle query parameters and initial state
  useEffect(() => {
    const initialTab = searchParams.get('tab') as FilterType;
    const shouldExpand = searchParams.get('expand') === 'true';
    const id = searchParams.get('id'); // Extract the `id` parameter
    
    if (id) {
      // console.log('ID from query:', id);
    }

    if (initialTab) {
      setActiveFilter(initialTab);
    }
    setIsExpanded(shouldExpand);
  }, [searchParams]);

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

  // Fetch user and chat data
  useEffect(() => {
    const id = searchParams.get('id'); // Extract the `id` parameter

    async function getUser() {
      if (activeFilter === 'chats' && id && Email) {
        // console.log("receiver id ", id);
        
        // Fetch receiver user data
        const receiverData = await fetchUserData(Number(id));
        // console.log("receiver", receiverData);

        // Get receiver chat data
        const receiverChatData = await axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${receiverData.email}`);
        const userChatData = await axios.get(`https://chat.coryfi.com/api/v1/users/getOneUser/${Email}`);

        // console.log("receiver chat data", receiverChatData.data.data._id);
        // console.log("user chat data", userChatData.data.data._id);

        // Create a chat between the two users
        const chat = await axios.post(`https://chat.coryfi.com/api/v1/chat-app/chats/c/${receiverChatData?.data?.data?._id}/${userChatData?.data?.data?._id}`);
        // console.log("chat created", chat);

        setReceiverId(id); // Update the receiver ID
      }
    }

    if (session?.user?.email) {
      getUser();
    }
  }, [activeFilter, searchParams, Email]); 

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="h-screen w-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0">
          <PersonalNetwork data={structuredData} />
        </div>


        <div
          className={`absolute left-0 top-0 h-full bg-background/95 backdrop-blur-sm transition-all duration-300 shadow-lg z-10 flex ${
            isExpanded ? (isMobile ? 'w-[300px]' : 'w-[400px]') : 'w-16'
          }`}
        >
          <Tabs
            value={activeFilter}
            onValueChange={(value) => handleTabChange(value as FilterType)}
            orientation="vertical"
            className="flex h-full w-full"
          >
            <TabsList className="h-full w-16 flex flex-col items-center py-4 space-y-4 bg-muted/50">
              <TabsTrigger value="results" className="w-10 h-10 p-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Search className="w-5 h-5" />
              </TabsTrigger>
              <TabsTrigger value="collab" className="w-10 h-10 p-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="w-5 h-5" />
              </TabsTrigger>
              <TabsTrigger value="recents" className="w-10 h-10 p-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Clock className="w-5 h-5" />
              </TabsTrigger>
              <TabsTrigger value="chats" className="w-10 h-10 p-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ChatBubbleIcon className="w-5 h-5" />
              </TabsTrigger>
              {/* Add collapse/expand button for mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 p-0 md:hidden"
                onClick={toggleSidebar}
              >
                {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
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

          {!isMobile && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute -right-6 top-1/2 transform -translate-y-1/2 h-24 w-6 rounded-l-none rounded-r-lg shadow-lg border-l-0 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={toggleSidebar}
            >
              {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
        </div>

        <SignInDialog
          isOpen={isSignInDialogOpen}
          onClose={() => setIsSignInDialogOpen(false)}
        />
      </div>
    </Suspense>
  );
}

export default function Page(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  )
}

