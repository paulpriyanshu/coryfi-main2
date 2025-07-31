"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Loader2, Users, ArrowRight, Star, Loader2Icon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppDispatch, useAppSelector } from "@/app/libs/store/hooks"
import { selectResponseData } from "@/app/libs/features/pathdata/pathSlice"
import { Toaster, toast } from "react-hot-toast"
import { getPathRanking } from "@/app/api/actions/pathActions"
import ResultCard from "./ResultCard"
import { useSession } from "next-auth/react"
import { fetchReachableNodes } from "@/app/api/actions/network"
import { setResponseData } from "@/app/libs/features/pathdata/pathSlice"
import { useRouter } from "next/navigation"


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

type SuggestedProfile = {
  id: number
  email: string
  name: string
  userdp?: string
  userDetails?: any
}

type ReachableNodesResponse = {
  success: string
  data: SuggestedProfile[]
  error?: any
}

const fetcher = async (index: number, startEmail: string, endEmail: string) => {
  if (!startEmail || !endEmail) return null
  return await getPathRanking(index, startEmail, endEmail)
}



export default function ResultsList() {
  const [pathCount] = useState(10)
  const [showAllSuggested, setShowAllSuggested] = useState(false)

  // State for paths data
  const [pathsData, setPathsData] = useState<any[] | null>(null)
  const [pathsError, setPathsError] = useState<any>(null)
  const [pathsLoading, setPathsLoading] = useState(false)
   const [currentPage, setCurrentPage] = useState(0);
  const resultsPerPage = 4;

 

  

  // State for suggested profiles
  const [suggestedData, setSuggestedData] = useState<ReachableNodesResponse | null>(null)
  const [suggestedError, setSuggestedError] = useState<any>(null)
  const [suggestedLoading, setSuggestedLoading] = useState(false)

  const data = useAppSelector(selectResponseData)
  const structuredData = {
    nodes: data?.nodes || [],
    links: data?.links || [],
  }

  const startEmail = structuredData.nodes[0]?.email
  const endEmail = structuredData.nodes[1]?.email

  const pathRequests = Array.from({ length: pathCount }, (_, index) => ({
    index,
    key: `pathRanking-${index}`,
  }))

  // Get current user session
  const { data: session } = useSession()
  const currentUserEmail = session?.user?.email

  // Fetch paths data with useEffect
  useEffect(() => {
    if (!startEmail || !endEmail) return

    const fetchPaths = async () => {
      setPathsLoading(true)
      setPathsError(null)

      try {
        const results = await Promise.all(pathRequests.map((req) => fetcher(req.index, startEmail, endEmail)))
        setPathsData(results)
      } catch (error) {
        setPathsError(error)
      } finally {
        setPathsLoading(false)
      }
    }

    fetchPaths()
  }, [startEmail, endEmail]) // Only run when emails change

  // Fetch suggested profiles with useEffect
  useEffect(() => {
    if (!currentUserEmail) return

    const fetchSuggested = async () => {
      setSuggestedLoading(true)
      setSuggestedError(null)

      try {
        const result = await fetchReachableNodes(currentUserEmail)
        // console.log("suggestion result",result)
        setSuggestedData(result)

        // Console.log the data from reachable nodes function
        console.log("Reachable nodes data:", result)
        console.log("Suggested profiles:", result.data)
      } catch (error) {
        setSuggestedError(error)
        console.error("Error fetching suggested profiles:", error)
      } finally {
        setSuggestedLoading(false)
      }
    }

    fetchSuggested()
  }, [session]) // Only run when currentUserEmail changes

  const suggestedProfiles = suggestedData?.data || []
  const displayedSuggestions = showAllSuggested ? suggestedProfiles : suggestedProfiles.slice(0, 3)
  const dispatch=useAppDispatch()
  const [loading,setIsLoading]=useState(false)
  const router=useRouter()

  // Check if all requests are complete and no paths found
  const isComplete = !pathsLoading
  const noPathsFound = isComplete && (!pathsData || pathsData.every((path) => !path))

  const handleConnectProfile = (profile: SuggestedProfile) => {
    toast.success(`Connection request sent to ${profile.name}`)
  }

  const handleFindPath = async (profile: SuggestedProfile) => {
      if (!session?.user?.email) {
        toast.error('Please sign in to find a path.');
        return;
      }
      
      setIsLoading(true);
      if(session.user.email){
        try {
          console.log("entered the function")
          const response = await getPathRanking(0, session.user.email, profile.email);
          console.log("response of user",response)
          if (!response || response.nodes.length === 0) {
            // More specific error handling
            toast.error('No connection path found. Please verify the user email or try again.');
            return;
          }
          router.push('/?tab=results&expand=true');
          dispatch(setResponseData(response));
          toast.success('Path data loaded successfully!');
          
        } catch (error) {
          console.error('Error finding path:', error);
          
          // Provide more informative error messages
          if (error) {
            toast.error('User not found. Please check the email address.');
          } else {
            toast.error('Error finding path. Please try again or check your connection.');
          }
        } finally {
          setIsLoading(false);
        }
      }
     
    }

  const SuggestionsSection = () => {
    // Don't show suggestions if user is not logged in
    if (!session?.user?.email) {
      return null
    }

    return (
      <div className="mt-12 space-y-6 block ">
        {" "}
        {/* Only show on small screens */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-900 dark:text-blue-100">Suggested Connections</CardTitle>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  People you might want to connect with based on your network
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedLoading ? (
              <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-900">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-white" />
                <span className="ml-2 text-sm text-blue-700 dark:text-white">Loading suggestions...</span>
              </div>
            ) : suggestedError ? (
              <div className="flex items-center justify-center p-8 text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">Failed to load suggestions</span>
              </div>
            ) : displayedSuggestions.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-gray-500">
                <Users className="h-5 w-5 mr-2" />
                <span className="text-sm">No suggestions available</span>
              </div>
            ) : (
              displayedSuggestions.map((profile) => (
                <Card
                  key={profile.id}
                  className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 border-gray-200 dark:border-gray-700 dark:bg-slate-950"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={profile.userdp || "/placeholder.svg"} alt={profile.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {profile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{profile.name}</h4>
                          {profile.userDetails?.isVerified && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {profile.userDetails?.bio || profile.email}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <span>{profile.totalConnections || 0} connections</span>
                          {profile.userDetails?.location && (
                            <>
                              <span>•</span>
                              <span>{profile.userDetails.location}</span>
                            </>
                          )}
                          <span>{profile.userDetails?.bio}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          {profile.userDetails?.industry && (
                            <Badge variant="secondary" className="text-xs">
                              {profile.userDetails.industry}
                            </Badge>
                          )}
                       <Button
                            size="sm"
                            onClick={() => handleFindPath(profile)}
                            className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader2Icon className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                Find Path
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {suggestedProfiles.length > 3 && !suggestedLoading && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllSuggested(!showAllSuggested)}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950"
                >
                  {showAllSuggested ? "Show Less" : `Show ${suggestedProfiles.length - 3} More Suggestions`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (noPathsFound) {
    return (
      <>
        <Card className="bg-background/50 hover:bg-background/80 transition-colors duration-200 dark:bg-gray-900">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Paths Found</h3>
            <p className="text-sm text-muted-foreground">Unable to find connection paths between the selected nodes.</p>
          </CardContent>
        </Card>
        {suggestedProfiles.length > 0 && <SuggestionsSection />}
      </>
    )
  }

   const paginatedRequests = pathRequests.slice(
    currentPage * resultsPerPage,
    (currentPage + 1) * resultsPerPage
  );
  const totalPages = Math.ceil(pathRequests.length / resultsPerPage);
  return (
    <>
      <Toaster position="top-center" />
      {/* Main Results Section */}
       <div className="space-y-4">
      {paginatedRequests.map(({ index, key }) => {
        const pathData = pathsData ? pathsData[index] : null;
        const isLoading = pathsLoading;

        return isLoading ? (
          <Card
            key={key}
            className="bg-background/50 hover:bg-background/80 transition-colors duration-200 dark:bg-slate-900"
          >
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Loading paths ...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : pathData ? (
          <div key={key}>
            <ResultCard index={index} path={pathData} />
          </div>
        ) : null;
      })}

      {/* Pagination Controls */}
      {pathRequests.length > resultsPerPage && (
       <div className="pb-24"> {/* Adjust padding as per footer height */}
          {/* ... your content, including the pagination */}
          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
              }
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
      {/* Suggested Profiles Section - Only on small screens */}
      {/* <SuggestionsSection /> */}
    </>
  )
}
