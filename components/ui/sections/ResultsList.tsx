'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { useAppSelector } from '@/app/libs/store/hooks'
import { selectResponseData } from '@/app/libs/features/pathdata/pathSlice'
import { Toaster, toast } from 'react-hot-toast'
import { getPathRanking } from '@/app/api/actions/pathActions'
import ResultCard from './ResultCard'

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

export default function ResultsList() {
  const [paths, setPaths] = useState<ConnectionPath[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null); // Keep track of the currently loading path
  const data = useAppSelector(selectResponseData);
  const structuredData = {
    nodes: data?.nodes || [],
    links: data?.links || [],
  };

  useEffect(() => {
    let isMounted = true;

    const fetchPaths = async () => {
      setIsLoading(true);
      let index = 0;

      while (index < 4) {
        try {
          if (!isMounted) break;
          setLoadingIndex(index); // Set the current loading path index
          const path = await getPathRanking(index, structuredData.nodes[0]?.email, structuredData.nodes[1]?.email);

          if (!path) {
            console.log("path not found");
            break;
          }

          // Push the fetched path into the state
          setPaths((prevPaths) => [...prevPaths, path]);
        } catch (error) {
          console.error(error.message);
          break;
        }
        index++;
      }

      if (isMounted) {
        setIsLoading(false);
        setLoadingIndex(null); // Reset the loading index
        if (paths.length === 0) {
          toast.error('No paths found', {
            duration: 3000,
            position: 'top-center',
            icon: '🚫',
          });
        }
      }
    };

    if (structuredData.nodes.length >= 2) {
      fetchPaths();
    }

    return () => {
      isMounted = false;
    };
  }, [structuredData.nodes[0]?.email, structuredData.nodes[1]?.email]);

  if (paths.length === 0 && !isLoading) {
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
    <>
      <Toaster position="top-center" />
      <div className="space-y-4">
        {paths.map((path, index) => (
          <ResultCard key={index} index={index} path={path} />
        ))}

        {/* Show loader for the currently loading path */}
        {loadingIndex !== null && (
          <Card className="bg-background/50 hover:bg-background/80 transition-colors duration-200">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Loading paths ...
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}