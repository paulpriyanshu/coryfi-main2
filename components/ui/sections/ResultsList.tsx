"use client"
import { useState, useEffect, useMemo } from "react"
import { AlertCircle, Loader2, Users, ArrowRight, Star, Loader2Icon, Crown, Lock } from "lucide-react"
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
  totalConnections: number
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

// Function to check if user is premium
const checkUserPremiumStatus = async (userEmail: string): Promise<boolean> => {
  try {
    // Replace this with your actual premium check API call
    const response = await fetch(`/api/user/premium-status?email=${userEmail}`)
    const data = await response.json()
    return data.isPremium || false
  } catch (error) {
    console.error("Error checking premium status:", error)
    return false
  }
}

export default function ResultsList() {
  const [pathCount] = useState(20) // Fetch more paths to show total count
  const [showAllSuggested, setShowAllSuggested] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  // State for paths data
  const [pathsData, setPathsData] = useState<any[] | null>(null)
  const [pathsError, setPathsError] = useState<any>(null)
  const [pathsLoading, setPathsLoading] = useState(false)

  // State for suggested profiles
  const [suggestedData, setSuggestedData] = useState<ReachableNodesResponse | null>(null)
  const [suggestedError, setSuggestedError] = useState<any>(null)
  const [suggestedLoading, setSuggestedLoading] = useState(false)

  const data = useAppSelector(selectResponseData)
  const structuredData = {
    nodes: data?.nodes || [],
    links: data?.links || [],
  }

  console.log("redux data", data)

  const startEmail = useMemo(() => structuredData.nodes[0]?.email, [structuredData.nodes[0]?.email])
  const endEmail = useMemo(() => structuredData.nodes[1]?.email, [structuredData.nodes[1]?.email])

  const pathRequests = Array.from({ length: pathCount }, (_, index) => ({
    index,
    key: `pathRanking-${index}`,
  }))

  // Get current user session
  const { data: session } = useSession()
  const currentUserEmail = session?.user?.email

  // Check premium status
  useEffect(() => {
    if (currentUserEmail) {
      checkUserPremiumStatus(currentUserEmail).then(setIsPremium)
    }
  }, [currentUserEmail])

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
  }, [startEmail, endEmail])

  // Fetch suggested profiles with useEffect
  useEffect(() => {
    if (!currentUserEmail) return

    const fetchSuggested = async () => {
      setSuggestedLoading(true)
      setSuggestedError(null)
      try {
        const result = await fetchReachableNodes(currentUserEmail)
        setSuggestedData(result)
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
  }, [session])

  const sortedSuggestions = [...(suggestedData?.data || [])].sort(
    (a, b) => (b.totalConnections || 0) - (a.totalConnections || 0),
  )

  const displayedSuggestions = showAllSuggested ? sortedSuggestions : sortedSuggestions.slice(0, 3)

  const dispatch = useAppDispatch()
  const [loading, setIsLoading] = useState(false)
  const router = useRouter()

  // Check if all requests are complete and no paths found
  const isComplete = !pathsLoading
  const validPaths = pathsData?.filter((path) => path && path.nodes && path.nodes.length > 0) || []
  const noPathsFound = isComplete && validPaths.length === 0

  // Calculate unique users from remaining paths (excluding first 3)
  const getUniqueUsersFromRemainingPaths = () => {
    if (!pathsData || pathsData.length <= 3) return 0

    // Get all intermediate nodes from the first 3 displayed paths
    const displayedIntermediateNodes = new Set<string>()
    const displayedPaths = validPaths.slice(0, 3)

    displayedPaths.forEach((path) => {
      if (path.nodes && path.nodes.length > 2) {
        // Get intermediate nodes (exclude start and end nodes)
        const middleNodes = path.nodes.slice(1, -1)
        middleNodes.forEach((node) => {
          if (node.email) {
            displayedIntermediateNodes.add(node.email)
          }
        })
      }
    })

    // Now count unique users in remaining paths, excluding those already displayed
    const remainingPaths = pathsData.slice(3).filter((path) => path && path.nodes)
    const uniqueUsers = new Set<string>()

    console.log("Displayed intermediate nodes:", displayedIntermediateNodes)

    remainingPaths.forEach((path) => {
      if (path.nodes && path.nodes.length > 2) {
        // Exclude start and end nodes (first and last)
        const middleNodes = path.nodes.slice(1, -1)
        middleNodes.forEach((node) => {
          if (node.email && !displayedIntermediateNodes.has(node.email)) {
            uniqueUsers.add(node.email)
          }
        })
      }
    })

    console.log("Unique users in remaining paths:", uniqueUsers)
    return uniqueUsers.size
  }

  const handleConnectProfile = (profile: SuggestedProfile) => {
    toast.success(`Connection request sent to ${profile.name}`)
  }

  const handleFindPath = async (profile: SuggestedProfile) => {
    if (!session?.user?.email) {
      toast.error("Please sign in to find a path.")
      return
    }

    setIsLoading(true)
    if (session.user.email) {
      try {
        console.log("entered the function")
        const response = await getPathRanking(0, session.user.email, profile.email)
        console.log("response of user", response)

        if (!response || response.nodes.length === 0) {
          toast.error("No connection path found. Please verify the user email or try again.")
          return
        }

        router.push("/?tab=results&expand=true")
        dispatch(setResponseData(response))
        toast.success("Path data loaded successfully!")
      } catch (error) {
        console.error("Error finding path:", error)
        if (error) {
          toast.error("User not found. Please check the email address.")
        } else {
          toast.error("Error finding path. Please try again or check your connection.")
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSeeMore = () => {
    if (isPremium) {
      // Show more paths for premium users
      toast.success("Loading more paths...")
    } else {
      setShowPremiumModal(true)
    }
  }

  const PremiumModal = () =>
    showPremiumModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 dark:bg-black dark:text-white">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Upgrade to Premium</CardTitle>
            <p className="text-muted-foreground">Unlock unlimited path searches and advanced networking features</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Unlimited path searches</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Advanced filtering options</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Priority customer support</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowPremiumModal(false)}>
                Maybe Later
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                onClick={() => {
                  setShowPremiumModal(false)
                  toast.success("Redirecting to premium upgrade...")
                }}
              >
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )

  const handleClickOnProfile = async (id: number) => {
    router.push(`/userProfile/${id}`)
  }

  const SuggestionsSection = () => {
    if (!session?.user?.email) {
      return null
    }

    return (
      <div className="mt-12 space-y-6 block">
        <Card className="bg-gradient-to-r dark:bg-black border-blue-200 dark:border-blue-800">
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
                  className="bg-white/80 m-2 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 border-gray-200 dark:border-gray-700 dark:bg-slate-900"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={profile.userdp || "/placeholder.svg"}
                          onClick={() => handleClickOnProfile(profile.id)}
                          alt={profile.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {profile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div
                          className="flex items-center gap-2 mb-1 hover:cursor-pointer"
                          onClick={() => handleClickOnProfile(profile.id)}
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{profile.name}</h4>
                          {profile.userDetails?.isVerified && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {profile.userDetails?.bio.slice(0, 50)}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <span>{profile.totalConnections || 0} connections</span>
                          {profile.userDetails?.location && (
                            <>
                              <span>•</span>
                              <span>{profile.userDetails.location}</span>
                            </>
                          )}
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
            {sortedSuggestions.length > 3 && !suggestedLoading && (
              <div className="flex justify-center pt-4 pb-24">
                <Button
                  variant="outline"
                  onClick={() => setShowAllSuggested(!showAllSuggested)}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950"
                >
                  {showAllSuggested ? "Show Less" : `Show ${sortedSuggestions.length - 3} More Suggestions`}
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
        {suggestedLoading ? (
          <div className="flex items-center justify-center p-8 bg-white dark:bg-black">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-white" />
            <span className="ml-2 text-sm text-blue-700 dark:text-white">Loading suggestions...</span>
          </div>
        ) : (
          displayedSuggestions.length > 0 && <SuggestionsSection />
        )}
      </>
    )
  }

  // Show only first 3 paths
  const displayedPaths = validPaths.slice(0, 3)
  const remainingPathsCount = Math.max(0, validPaths.length - 3)
  const uniqueUsersInRemaining = getUniqueUsersFromRemainingPaths()

  return (
    <>
      <Toaster position="top-center" />
      <PremiumModal />

      {/* Main Results Section - Show only 3 paths */}
      <div className="space-y-4">
        {pathsLoading
          ? // Show 3 loading cards
            Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={`loading-${index}`}
                className="bg-background/50 hover:bg-background/80 transition-colors duration-200 dark:bg-slate-900"
              >
                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground animate-pulse">Loading paths...</p>
                  </div>
                </CardContent>
              </Card>
            ))
          : displayedPaths.map((pathData, index) => (
              <div key={`path-${index}`}>
                <ResultCard index={index} path={pathData} />
              </div>
            ))}

        {/* Path Statistics */}
        {!pathsLoading && validPaths.length > 0 && (
          <Card className="bg-gradient-to-r pb-24 dark:bg-black">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Total Paths Found:{" "}
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{validPaths.length}</span>
                  </p>
                  {remainingPathsCount > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {uniqueUsersInRemaining} unique users in {remainingPathsCount} additional paths
                    </p>
                  )}
                </div>
                {remainingPathsCount > 0 && (
                  <Button
                    onClick={handleSeeMore}
                    variant="outline"
                    className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950 bg-transparent"
                  >
                    {!isPremium && <Lock className="w-4 h-4" />}
                    See More ({remainingPathsCount}){!isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Suggested Profiles Section */}
      {/* <SuggestionsSection /> */}
    </>
  )
}
