'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import PersonalNetwork from '@/components/ui/sections/PersonalNetwork';
import ResultsList from '@/components/ui/sections/ResultsList';
import CollabContent from '@/components/ui/sections/CollabContent';
import RecentsContent from '@/components/ui/sections/RecentsContent';
import Chat from '@/components/ui/sections/Chat';
import { useIsMobile } from '@/hooks/use-mobile';
import { SignInDialog } from '@/components/ui/sections/SigninDialog';
import { MessageCircleIcon as ChatBubbleIcon } from 'lucide-react';
import { ChevronDoubleLeftIcon } from '@heroicons/react/24/outline';
import { Badge } from "@/components/ui/badge";
import Sidetabs from './Sidetabs';

type FilterType = 'results' | 'collab' | 'recents' | 'chats';



export default function ClientComponent({
  initialPathData,
  initialTab,
  initialExpanded,
  userEmail
}) {

  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  
 



  return (
    <div className="h-screen w-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0">
        <PersonalNetwork data={initialPathData} />
      </div>

        <Sidetabs initialExpanded={initialExpanded} initialTab={initialTab} userEmail={userEmail}/>

    
    </div>
  );
}