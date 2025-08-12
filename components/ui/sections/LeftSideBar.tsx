"use client"
import toast from "react-hot-toast"
import { useState, useCallback, useEffect, useRef } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getUnconnectedUsers } from "@/app/api/actions/media"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UserPlus } from "lucide-react"
import { RatingModal } from "./RatingModal"
import { connect_users } from "@/app/api/actions/network"

interface LeftSidebarProps {
  userEmail: string
  userName: string
}

const USERS_PER_PAGE = 5

export default function LeftSidebar({ userEmail, userName }: LeftSidebarProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

  // Fetcher function for SWR with better error handling
  const fetcher = useCallback(async ([key, email, page]: [string, string, number]) => {
    if (!email) {
      console.log("No email provided")
      return []
    }

    try {
      // console.log('Fetching users:', { email, page, key })
      const result = await getUnconnectedUsers(email, page, USERS_PER_PAGE)
      // console.log('Fetched users:', result?.length || 0)
      return result || []
    } catch (error) {
      console.error("Error in fetcher:", error)
      // Re-throw to let SWR handle the error
      throw error
    }
  }, [])

  // SWR for the current page with better configuration
  const {
    data: currentPageUsers,
    isLoading,
    error,
    mutate,
  } = useSWR(userEmail ? ["unconnectedUsers", userEmail, currentPage] : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: true, // Allow revalidation if data is stale
    dedupingInterval: 0, // Disable deduping for debugging
    refreshInterval: 0,
    onSuccess: (data) => {
      // console.log('SWR onSuccess:', { currentPage, dataLength: data?.length })

      if (currentPage === 1) {
        // First page - replace all users
        setAllUsers(data || [])
      } else {
        // Subsequent pages - append to existing users
        setAllUsers((prev) => {
          const newUsers = data || []
          // Filter out duplicates based on user ID
          const existingIds = new Set(prev.map((user) => user.id))
          const uniqueNewUsers = newUsers.filter((user) => !existingIds.has(user.id))
          return [...prev, ...uniqueNewUsers]
        })
      }

      // Check if there are more users to load
      setHasMore((data || []).length === USERS_PER_PAGE)
      setIsLoadingMore(false)
    },
    onError: (error) => {
      console.error("SWR error:", error)
      setIsLoadingMore(false)
    },
  })

  // Reset state when userEmail changes
  useEffect(() => {
    if (userEmail) {
      setCurrentPage(1)
      setAllUsers([])
      setHasMore(true)
      setIsLoadingMore(false)
    }
  }, [userEmail])

  // Force refresh function
  const forceRefresh = useCallback(() => {
    setCurrentPage(1)
    setAllUsers([])
    setHasMore(true)
    setIsLoadingMore(false)
    mutate() // Force SWR to refetch
  }, [mutate])

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoading) return

    setIsLoadingMore(true)
    setCurrentPage((prev) => prev + 1)
  }, [isLoadingMore, hasMore, isLoading])

  // Infinite scroll handler
  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement

    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50

      if (isNearBottom && hasMore && !isLoadingMore && !isLoading) {
        loadMore()
      }
    }

    scrollElement.addEventListener("scroll", handleScroll, { passive: true })

    return () => scrollElement.removeEventListener("scroll", handleScroll)
  }, [hasMore, isLoadingMore, isLoading, loadMore])

  // Intersection Observer approach
  const lastUserRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lastUserRef.current || isLoading || isLoadingMore || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(lastUserRef.current)

    return () => observer.disconnect()
  }, [loadMore, isLoading, isLoadingMore, hasMore, allUsers.length])

  const displayUsers = allUsers

  // Debug logging
  // useEffect(() => {
  //   console.log('Component state:', {
  //     userEmail,
  //     isLoading,
  //     error: error?.message,
  //     currentPage,
  //     allUsersLength: allUsers.length,
  //     hasMore,
  //     isLoadingMore
  //   })
  // }, [userEmail, isLoading, error, currentPage, allUsers.length, hasMore, isLoadingMore])

  const handleConnectClick = (person: any) => {
    if (!userEmail) {
      toast.error("Please sign in to connect with other users")
      return
    }
    setSelectedUser(person)
    setIsRatingModalOpen(true)
  }

  const handleRatingSubmit = async (rating: number) => {
    if (!userEmail || !selectedUser) {
      toast.error("Unable to establish connection. Please try again.")
      return
    }

    const connectPromise = connect_users(userEmail, userName, selectedUser.email, rating)

    toast.promise(connectPromise, {
      loading: "Connecting...",
      success: (data) => {
        setIsRatingModalOpen(false)
        setSelectedUser(null)
        forceRefresh() // Refresh the user list to remove connected user
        return `Request sent to ${selectedUser.name}!`
      },
      error: (err) => {
        return "Unable to establish connection. Please try again."
      },
    })
  }

  return (
    <>
      <Card className="bg-white shadow-lg sticky top-4 dark:bg-black dark:border border">
        <CardContent className="p-6">
          <div className="flex justify-center h-full w-full font-bold text-slate-800 text-lg m-2 dark:text-white">
            People You May Know
          </div>

          {/* Debug button - remove in production */}
          {process.env.NODE_ENV === "development" && (
            <Button onClick={forceRefresh} variant="outline" size="sm" className="mb-2 bg-transparent">
              Refresh Data
            </Button>
          )}

          <div>
            <ScrollArea ref={scrollAreaRef} className="h-[calc(100vh-350px)]" type="always">
              {isLoading && currentPage === 1 ? (
                // Loading skeleton for initial load
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between mb-5 p-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                    <Skeleton className="h-8 w-[60px]" />
                  </div>
                ))
              ) : error ? (
                <div className="text-center text-red-500 p-4">
                  <p>Failed to load users</p>
                  {process.env.NODE_ENV === "development" && <p className="text-xs mt-2">{error.message}</p>}
                  <Button onClick={forceRefresh} variant="outline" size="sm" className="mt-2 bg-transparent">
                    Try Again
                  </Button>
                </div>
              ) : displayUsers.length === 0 && !isLoading ? (
                <div className="text-center text-gray-500 p-4">
                  <p>No users found</p>
                  {process.env.NODE_ENV === "development" && (
                    <div className="text-xs mt-2">
                      <p>Email: {userEmail}</p>
                      <p>Page: {currentPage}</p>
                    </div>
                  )}
                  <Button onClick={forceRefresh} variant="outline" size="sm" className="mt-2 bg-transparent">
                    Refresh
                  </Button>
                </div>
              ) : (
                displayUsers.map((person, index) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between mb-5 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    ref={index === displayUsers.length - 1 ? lastUserRef : null}
                  >
                    {/* Left side: Avatar + Name */}
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={person.userdp || "/placeholder.svg"} alt={person.name} />
                        <AvatarFallback>{person.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-sm text-black dark:text-white">{person.name}</p>
                    </div>

                    {/* Right side: Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-black dark:bg-white border-black dark:hover:bg-slate-900 bg-transparent"
                        onClick={() => handleConnectClick(person)}
                      >
                        <UserPlus />
                      </Button>
                      <Link href={`/userProfile/${person.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-black dark:bg-white border-black bg-transparent"
                        >
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}

              {/* Loading indicator at bottom during infinite scroll */}
              {isLoadingMore && (
                <div className="flex justify-center py-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white"></div>
                    <span>Loading more users...</span>
                  </div>
                </div>
              )}

              {/* End of list indicator */}
              {!hasMore && displayUsers.length > 0 && (
                <div className="text-center text-gray-500 py-4 text-sm">No more users to load</div>
              )}
            </ScrollArea>
          </div>

          {/* Show More Button - navigates to full users page */}
          <div className="flex justify-center mt-4">
            <Button onClick={() => router.push("/users")}>View All Users</Button>
          </div>
        </CardContent>
      </Card>

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => {
          setIsRatingModalOpen(false)
          setSelectedUser(null)
        }}
        onSubmit={handleRatingSubmit}
      />
    </>
  )
}
