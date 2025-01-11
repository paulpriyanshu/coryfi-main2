'use client'

import { useEffect, useState } from 'react'
import { Search, Users, Clock, ChevronLeft, ChevronRight, ArrowUp, AlertCircle, CheckCircle, UserPlus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import PersonalNetwork from '@/components/ui/sections/PersonalNetwork'
import { useAppDispatch, useAppSelector } from '@/app/libs/store/hooks'
import { selectResponseData, setResponseData } from '@/app/libs/features/pathdata/pathSlice'
import axios from 'axios'
import CollaborativeEvaluationModal from './CollaborativeEvaluationModal'

type FilterType = 'results' | 'collab' | 'recents'

type PathNode = {
  id: number
  email: string
  name: string
  bio: string
  connections: number
  group: number
  visible: boolean
}

type ConnectionPath = {
  nodes: PathNode[]
  links: { source: number; target: number; value: number }[]
}

async function getPathRanking(index: number, userEmail: string, targetEmail: string): Promise<ConnectionPath | null> {
  try {
    const response = await axios.post('https://neo.coryfi.com/api/v1/getpathranking', {
      sourceEmail: userEmail,
      targetEmail: targetEmail,
      pathIndex: index
    });

    const data = response.data;
    // console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching path ranking:", error);
    return null;
  }
}

export default function ResultsList() {
  const [paths, setPaths] = useState<ConnectionPath[]>([]);
  const data = useAppSelector(selectResponseData)
  const structuredData = {
    nodes: data?.nodes || [],
    links: data?.links || [],
  }

  useEffect(() => {
    let isMounted = true;
  
    const fetchPaths = async () => {
      const fetchedPaths: ConnectionPath[] = [];
      let index = 0;
  
      while (index < 5) {
        try {
          if (!isMounted) break;
          const path = await getPathRanking(index, structuredData.nodes[0]?.email, structuredData.nodes[1]?.email);
          if (!path) break;
          fetchedPaths.push(path);
        } catch (error) {
          // console.error(error.message);
          break;
        }
        index++;
      }
  
      if (isMounted) {
        setPaths(fetchedPaths);
      }
    };
  
    if (structuredData.nodes.length >= 2) {
      fetchPaths();
    }
  
    return () => {
      isMounted = false;
    };
  }, [structuredData.nodes[0]?.email, structuredData.nodes[1]?.email]);
  if (paths.length === 0) {
    return (
      <Card className="bg-background/50 hover:bg-background/80 transition-colors duration-200">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Path Selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a connection or search for someone to view potential paths.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {paths.map((path, index) => (
        <ResultCard key={index} index={index} path={path} />
      ))}
    </div>
  );
}

function ResultCard({ index, path }: { index: number; path: ConnectionPath }) {
  const dispatch = useAppDispatch()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePathClick = () => {
    // console.log("Dispatching path:", path)
    dispatch(setResponseData(path))
  }

  const handleCollaborativeEvaluation = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click event
    setIsModalOpen(true)
  }

  const lastNode = path.nodes[path?.nodes?.length - 1];
  return (
    <>
      <Card 
        className="bg-background/50 hover:bg-background/80 transition-colors duration-200 hover:cursor-pointer hover:bg-slate-100"
        onClick={handlePathClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${lastNode.name}`} alt={lastNode.name} />
              <AvatarFallback>{lastNode.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <h3 className="font-semibold text-sm">{lastNode.name}</h3>
              <p className="text-xs text-muted-foreground">Connected through {path.nodes.length - 2} mutual contacts</p>
            </div>
            <Button 
              onClick={handleCollaborativeEvaluation}
              className="ml-auto"
              variant="outline"
              size="sm"
            >
              <img src='/icon.png' className="w-5 h-5" />
              <div className='font-sans text-extrabold text-slate-700'>Start</div>
            </Button>
          </div>
          <ConnectionPathCard path={path} />
        </CardContent>
      </Card>
      <CollaborativeEvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        path={path}
      />
    </>
  )
}

function ConnectionPathCard({ path }: { path: ConnectionPath }) {
  return (
    <TooltipProvider>
      <div className="relative py-6">
        <div className="flex items-center justify-between">
          {path.nodes.slice(2).map((node, index) => (
            <Tooltip key={node.id}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center relative">
                  <Avatar className={`w-12 h-12 relative z-10 ${index === 1 ? 'ring-4 ring-blue-500/50 ring-offset-2' : ''}`}>
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${node.name}`} alt={node.name} />
                    <AvatarFallback>{node.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {index === 1 && (
                    <div className="absolute -bottom-7">
                      <ArrowUp className="w-5 h-5 text-blue-500" />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{node.name}</p>
                <p className="text-xs text-muted-foreground">{node.email}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500/50 -translate-y-1/2 z-0"></div>
      </div>
    </TooltipProvider>
  )
}
