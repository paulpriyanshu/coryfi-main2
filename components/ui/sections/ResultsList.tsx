"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { AlertCircle, Loader2, Users, ArrowRight, Star, Loader2Icon, Crown, Lock, Lightbulb, Book } from 'lucide-react'
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
import { checkUserPremiumStatus } from "@/app/api/actions/user"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import TutorialModal from "./tutorial-modal"

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

// Helper function to clean and deduplicate path nodes
const cleanPathNodes = (nodes: PathNode[]): PathNode[] => {
  if (!nodes || nodes.length === 0) return []
  
  const seen = new Set<string>()
  const cleanedNodes: PathNode[] = []
  
  for (const node of nodes) {
    if (node && node.email && !seen.has(node.email)) {
      seen.add(node.email)
      cleanedNodes.push(node)
    }
  }
  
  return cleanedNodes
}

// Helper function to get intermediate node count
const getIntermediateNodeCount = (path: ConnectionPath): number => {
  if (!path || !path.nodes) return 0
  const cleanedNodes = cleanPathNodes(path.nodes)
  // Subtract 2 for start and end nodes to get intermediate count
  return Math.max(0, cleanedNodes.length - 2)
}

export default function ResultsList() {
  const [showAllSuggested, setShowAllSuggested] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [premiumLoading, setPremiumLoading] = useState(false)
  const [showTutorialModal, setShowTutorialModal] = useState(false)

  // State for paths data
  const [pathsData, setPathsData] = useState<any[] | null>(null)
  const [pathsError, setPathsError] = useState<any>(null)
  const [pathsLoading, setPathsLoading] = useState(false)

  // State for suggested profiles
  const [suggestedData, setSuggestedData] = useState<ReachableNodesResponse | null>(null)
  const [suggestedError, setSuggestedError] = useState<any>(null)
  const [suggestedLoading, setSuggestedLoading] = useState(false)

  // Loading state for individual profile path finding
  const [loadingProfileId, setLoadingProfileId] = useState<number | null>(null)

  const data = useAppSelector(selectResponseData)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { data: session } = useSession()

  // Memoize structured data to prevent unnecessary recalculations
  const structuredData = useMemo(
    () => ({
      nodes: data?.nodes || [],
      links: data?.links || [],
    }),
    [data],
  )

  // Memoize email values
  const startEmail = useMemo(() => structuredData.nodes[0]?.email, [structuredData.nodes])
  const endEmail = useMemo(() => structuredData.nodes[1]?.email, [structuredData.nodes])
  const currentUserEmail = session?.user?.email

  // Check premium status - optimized with proper dependency
  useEffect(() => {
    if (!currentUserEmail) return

    let isMounted = true
    setPremiumLoading(true)

    checkUserPremiumStatus(currentUserEmail)
      .then((status) => {
        if (isMounted) {
          setIsPremium(status)
          console.log("Premium status:", status)
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.error("Error checking premium status:", error)
          setIsPremium(false)
        }
      })
      .finally(() => {
        if (isMounted) {
          setPremiumLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [currentUserEmail])

  // Memoized fetch function for paths
  const fetchPaths = useCallback(async () => {
    if (!startEmail || !endEmail) return

    setPathsLoading(true)
    setPathsError(null)

    try {
      console.log("Fetching paths for:", startEmail, "->", endEmail)
      const results = await getPathRanking(startEmail, endEmail)
      console.log("Paths fetched:", results)
      setPathsData(results.paths)
    } catch (error) {
      console.error("Error fetching paths:", error)
      setPathsError(error)
    } finally {
      setPathsLoading(false)
    }
  }, [startEmail, endEmail])

  // Fetch paths data - only when emails change
  useEffect(() => {
    if (startEmail && endEmail) {
      fetchPaths()
    }
  }, [fetchPaths])

  // Fetch suggested profiles - optimized with cleanup
  useEffect(() => {
    if (!currentUserEmail) return

    let isMounted = true

    const fetchSuggested = async () => {
      setSuggestedLoading(true)
      setSuggestedError(null)

      try {
        const result = await fetchReachableNodes(currentUserEmail)
        if (isMounted) {
          setSuggestedData(result)
          console.log("Suggested profiles loaded:", result.data?.length || 0)
        }
      } catch (error) {
        if (isMounted) {
          setSuggestedError(error)
          console.error("Error fetching suggested profiles:", error)
        }
      } finally {
        if (isMounted) {
          setSuggestedLoading(false)
        }
      }
    }

    fetchSuggested()

    return () => {
      isMounted = false
    }
  }, [currentUserEmail])

  // Memoize sorted suggestions to prevent unnecessary re-sorting
  const sortedSuggestions = useMemo(() => {
    return [...(suggestedData?.data || [])].sort((a, b) => (b.totalConnections || 0) - (a.totalConnections || 0))
  }, [suggestedData?.data])

  const displayedSuggestions = useMemo(() => {
    return showAllSuggested ? sortedSuggestions : sortedSuggestions.slice(0, 3)
  }, [showAllSuggested, sortedSuggestions])

  // Optimized path calculations
  const isComplete = !pathsLoading
  const validPaths = useMemo(() => {
    return pathsData?.filter((path) => path && path.nodes && path.nodes.length > 0) || []
  }, [pathsData])

  const noPathsFound = isComplete && validPaths.length === 0

  // Memoize path categorization by intermediate node count
  const categorizedPaths = useMemo(() => {
    const categories = {
      through1: [] as any[],
      through2: [] as any[],
      through3: [] as any[],
    }

    validPaths.forEach((path) => {
      const intermediateCount = getIntermediateNodeCount(path)
      switch (intermediateCount) {
        case 1:
          categories.through1.push(path)
          break
        case 2:
          categories.through2.push(path)
          break
        case 3:
          categories.through3.push(path)
          break
        default:
          // Handle paths with more than 3 intermediate nodes
          if (intermediateCount > 3) {
            categories.through3.push(path)
          }
          break
      }
    })

    return categories
  }, [validPaths])

  // Optimized unique users calculation
  const getUniqueUsersFromRemainingPaths = useCallback(() => {
    const displayLimit = isPremium ? 10 : 4
    if (!pathsData || pathsData.length <= displayLimit) return 0

    const displayedIntermediateNodes = new Set<string>()
    const displayedPaths = validPaths.slice(0, displayLimit)

    displayedPaths.forEach((path) => {
      const cleanedNodes = cleanPathNodes(path.nodes || [])
      if (cleanedNodes.length > 2) {
        const middleNodes = cleanedNodes.slice(1, -1)
        middleNodes.forEach((node) => {
          if (node.email) {
            displayedIntermediateNodes.add(node.email)
          }
        })
      }
    })

    const remainingPaths = pathsData.slice(displayLimit).filter((path) => path && path.nodes)
    const uniqueUsers = new Set<string>()

    remainingPaths.forEach((path) => {
      const cleanedNodes = cleanPathNodes(path.nodes || [])
      if (cleanedNodes.length > 2) {
        const middleNodes = cleanedNodes.slice(1, -1)
        middleNodes.forEach((node) => {
          if (node.email && !displayedIntermediateNodes.has(node.email)) {
            uniqueUsers.add(node.email)
          }
        })
      }
    })

    return uniqueUsers.size
  }, [pathsData, validPaths, isPremium])

  const handleConnectProfile = useCallback((profile: SuggestedProfile) => {
    toast.success(`Connection request sent to ${profile.name}`)
  }, [])

  // OPTIMIZED: Fixed the main performance issue
  const handleFindPath = useCallback(async (profile: SuggestedProfile) => {
    if (!session?.user?.email) {
      toast.error("Please sign in to find a path.")
      return
    }

    // Prevent multiple simultaneous requests
    if (loadingProfileId === profile.id) {
      return
    }

    setLoadingProfileId(profile.id)

    try {
      console.log("Finding path from", session.user.email, "to", profile.email)
      // Single API call with proper error handling
      const response = await getPathRanking(session.user.email, profile.email, 0)
      console.log("Path response:", response)

      const enrichedResponse = {
        ...response,
        startEmail: session.user.email,
        endEmail: profile.email,
      }

      // Update Redux state
      dispatch(setResponseData(enrichedResponse))

      // Navigate after state update
      router.push("/?tab=results&expand=true")
      toast.success("Path data loaded successfully!")
    } catch (error) {
      console.error("Error finding path:", error)
      if (error) {
        toast.error("User not found. Please check the email address.")
      } else {
        toast.error("Error finding path. Please try again or check your connection.")
      }
    } finally {
      setLoadingProfileId(null)
    }
  },
  [session?.user?.email, dispatch, router, loadingProfileId],
  )

  const handleSeeMore = useCallback(() => {
    if (isPremium) {
      toast.success("Loading more paths...")
    } else {
      setShowPremiumModal(true)
    }
  }, [isPremium])

  const handleClickOnProfile = useCallback(
    (id: number) => {
      router.push(`/userProfile/${id}`)
    },
    [router],
  )

  // Memoize display calculations
  const displayLimit = isPremium ? 10 : 4
  const displayedPaths = useMemo(() => validPaths.slice(0, displayLimit), [validPaths, displayLimit])
  const remainingPathsCount = Math.max(0, validPaths.length - displayLimit)
  const uniqueUsersInRemaining = getUniqueUsersFromRemainingPaths()

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
                <span className="text-sm">View up to 10 connection paths</span>
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
              <Link href="/premium" passHref>
                <Button
                  asChild
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                  onClick={() => {
                    setShowPremiumModal(false);
                    toast.success("Redirecting to premium upgrade...");
                  }}
                >
                  <a>Upgrade Now</a>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )

  const TutorialSection = () => {
    return (
      <Card className="mb-6 border-2 border-dashed border-blue-300 dark:border-blue-600 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-md">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  New to Paths?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Learn how to interpret and use connection paths effectively with our quick tutorial.
                </p>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-3 py-2 shadow-md hover:shadow-lg transition-all duration-200"
              onClick={() => {
                setShowTutorialModal(true)
                toast.success("Starting tutorial...")
              }}
            >
              <div className="flex space-x-3 items-center justify-center">
                <Book/>
                Start Tutorial
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SuggestionsSection = () => {
    if (!session?.user?.email) {
      return null
    }

    return (
      <div className="mt-2 space-y-6 block">
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
                          {profile.userDetails?.bio?.slice(0, 50)}
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
                            disabled={loadingProfileId === profile.id}
                          >
                            {loadingProfileId === profile.id ? (
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
        {/* Tutorial Section - Always visible when no paths found */}
        <TutorialSection />
        <TutorialModal isOpen={showTutorialModal} onClose={() => setShowTutorialModal(false)} />
        {suggestedLoading ? (
          <div className="flex items-center justify-center p-2 bg-white dark:bg-black">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-white" />
            <span className="ml-2 text-sm text-blue-700 dark:text-white">Loading suggestions...</span>
          </div>
        ) : (
          displayedSuggestions.length > 0 && <SuggestionsSection />
        )}
      </>
    )
  }

  return (
    <>
      <Toaster position="top-center" />
      <PremiumModal />
      <TutorialModal isOpen={showTutorialModal} onClose={() => setShowTutorialModal(false)} />

      {/* Premium Status Indicator */}
      {premiumLoading ? (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-700 dark:text-blue-300">Checking premium status...</span>
          </div>
        </div>
      ) : isPremium ? (
        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Premium Active - Showing up to 10 paths
            </span>
          </div>
        </div>
      ) : null}

      {/* Tutorial Section - Now prominently displayed */}
      <TutorialSection />

      {/* Main Results Section with Tabs */}
      <div className="space-y-4 ">
        {pathsLoading ? (
          // Show loading cards
          Array.from({ length: Math.min(displayLimit, 3) }).map((_, index) => (
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
        ) : validPaths.length > 0 ? (
          <Tabs defaultValue="through-1" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="through-1" className="flex items-center gap-1">
                1st
                <Badge variant="secondary">{categorizedPaths.through1.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="through-2" className="flex items-center gap-1">
                2nd
                <Badge variant="secondary">{categorizedPaths.through2.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="through-3" className="flex items-center gap-1">
                3rd
                <Badge variant="secondary">{categorizedPaths.through3.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="through-1" className="space-y-4">
              {categorizedPaths.through1.slice(0, displayLimit).map((pathData, index) => (
                <div key={`path-1-${index}`}>
                  <ResultCard index={index} path={pathData} />
                </div>
              ))}
              {categorizedPaths.through1.length === 0 && (
                <Card className="bg-background/50 dark:bg-slate-900">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">No paths through 1 node found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Looking for paths with 1 intermediate connection (3 total nodes)
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="through-2" className="space-y-4">
              {categorizedPaths.through2.slice(0, displayLimit).map((pathData, index) => (
                <div key={`path-2-${index}`}>
                  <ResultCard index={index} path={pathData} />
                </div>
              ))}
              {categorizedPaths.through2.length === 0 && (
                <Card className="bg-background/50 dark:bg-slate-900">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">No paths through 2 nodes found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Looking for paths with 2 intermediate connections (4 total nodes)
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="through-3" className="space-y-4">
              {categorizedPaths.through3.slice(0, displayLimit).map((pathData, index) => (
                <div key={`path-3-${index}`}>
                  <ResultCard index={index} path={pathData} />
                </div>
              ))}
              {categorizedPaths.through3.length === 0 && (
                <Card className="bg-background/50 dark:bg-slate-900">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">No paths through 3 nodes found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Looking for paths with 3 intermediate connections (5 total nodes)
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : null}

        {/* Path Statistics */}
        {!pathsLoading && validPaths.length > 0 && (
          <Card className="bg-gradient-to-r pb-24 dark:bg-black">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Showing: <span className="text-blue-600 dark:text-blue-400 font-bold">{displayedPaths.length}</span>{" "}
                    of <span className="text-blue-600 dark:text-blue-400 font-bold">{validPaths.length}</span> paths
                    found
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>1-Node: {categorizedPaths.through1.length}</span>
                    <span>2-Node: {categorizedPaths.through2.length}</span>
                    <span>3-Node: {categorizedPaths.through3.length}</span>
                  </div>
                  {!isPremium && remainingPathsCount > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {uniqueUsersInRemaining} unique users in {remainingPathsCount} additional paths
                    </p>
                  )}
                </div>
                {!isPremium && remainingPathsCount > 0 && (
                  <Button
                    onClick={handleSeeMore}
                    variant="outline"
                    className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950 bg-transparent"
                  >
                    <Lock className="w-4 h-4" />
                    See More ({remainingPathsCount})
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <SuggestionsSection />
    </>
  )
}
