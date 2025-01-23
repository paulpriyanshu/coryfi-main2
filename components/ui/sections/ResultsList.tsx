'use client'

import { useState } from 'react'
import useSWR from 'swr'
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

const fetcher = async (index: number, startEmail: string, endEmail: string) => {
  if (!startEmail || !endEmail) return null;
  return await getPathRanking(index, startEmail, endEmail);
};

export default function ResultsList() {
  const [pathCount] = useState(4);
  const data = useAppSelector(selectResponseData);
  const structuredData = {
    nodes: data?.nodes || [],
    links: data?.links || [],
  };

  const startEmail = structuredData.nodes[0]?.email;
  const endEmail = structuredData.nodes[1]?.email;

  const pathRequests = Array.from({ length: pathCount }, (_, index) => {
    const { data, error, isLoading } = useSWR(
      startEmail && endEmail ? ['pathRanking', index, startEmail, endEmail] : null,
      () => fetcher(index, startEmail, endEmail),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0,
      }
    );
    return { data, error, isLoading };
  });

  // Check if all requests are complete and no paths found
  const isComplete = pathRequests.every(req => !req.isLoading);
  const noPathsFound = isComplete && pathRequests.every(req => !req.data);

  if (noPathsFound) {
    return (
      <Card className="bg-background/50 hover:bg-background/80 transition-colors duration-200">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Paths Found</h3>
          <p className="text-sm text-muted-foreground">
            Unable to find connection paths between the selected nodes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="space-y-4">
        {pathRequests.map(({ data, isLoading }, index) => (
          isLoading ? (
            <Card key={`loading-${index}`} className="bg-background/50 hover:bg-background/80 transition-colors duration-200">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Loading paths ...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : data ? (
            <div key={index}>
              <ResultCard  index={index} path={data} />
            </div>

            
          ) : null
        ))}
      </div>
    </>
  );
}