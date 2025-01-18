'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { MessageCircleIcon as ChatBubbleIcon } from 'lucide-react';
import { ChevronDoubleLeftIcon } from '@heroicons/react/24/outline';
import { Badge } from "@/components/ui/badge";
import ResultsList from './ResultsList';
import CollabContent from './CollabContent';
import RecentsContent from './RecentsContent';
import Chat from './Chat';

interface SidebarProps {
  isExpanded: boolean;
  activeFilter: string;
  onTabChange: (value: string) => void;
  onToggle: () => void;
  collabCount: number;
  isMobile: boolean;
  userData: any;
}

export function Sidebar({
  isExpanded,
  activeFilter,
  onTabChange,
  onToggle,
  collabCount,
  isMobile,
  userData
}: SidebarProps) {
  return (
    <div
      className={`absolute left-0 top-0 h-full bg-slate-50 rounded-xl backdrop-blur-sm transition-all duration-300 shadow-lg z-10 flex ${
        isExpanded ? (isMobile ? 'w-[340px]' : 'w-[400px]') : 'w-16'
      }`}
    >
      <Tabs
        value={activeFilter}
        onValueChange={onTabChange}
        orientation="vertical"
        className="flex h-full w-full"
      >
        <TabsList className="h-full w-10 md:w-16 flex flex-col items-center py-4 space-y-4 bg-muted/50">
          <TabsTrigger value="results" className="w-7 h-7 p-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Search className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="collab" className="w-7 h-7 p-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative">
            <Users className="w-4 h-4" />
            {collabCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]" variant="destructive">
                {collabCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recents" className="w-7 h-7 p-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="chats" className="w-7 h-7 p-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ChatBubbleIcon className="w-4 h-4" />
          </TabsTrigger>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="w-5 h-5 p-0"
              onClick={onToggle}
            >
              {isExpanded ? 
                <ChevronDoubleLeftIcon className="h-5 w-5 text-red-400" /> : 
                <ChevronRight className="h-5 w-5" />
              }
            </Button>
          )}
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
              <Chat/>
            </TabsContent>
          </div>
        )}

        <Button
          variant="secondary"
          size="icon"
          className="absolute -right-6 top-1/2 transform -translate-y-1/2 h-24 w-6 rounded-l-none rounded-r-lg shadow-lg border-l-0"
          onClick={onToggle}
        >
          {isExpanded ? 
            <ChevronLeft className="h-4 w-4" /> : 
            <ChevronRight className="h-4 w-4" />
          }
        </Button>
      </Tabs>
    </div>
  );
}