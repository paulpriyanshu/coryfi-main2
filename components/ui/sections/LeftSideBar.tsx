'use client'

import React, { useState, useCallback, useEffect, useRef } from "react"
import useSWR from 'swr'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getUnconnectedUsers } from "@/app/api/actions/media"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface User {
  id: string
  email: string
  name: string
  userdp: string
}

interface LeftSidebarProps {
  userEmail: string
}

const USERS_PER_PAGE = 5

export default function LeftSidebar({ userEmail }: LeftSidebarProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Fetcher function for SWR
  const fetcher = useCallback(async ([key, email, page]: [string, string, number]) => {
    if (!email) return []
    return await getUnconnectedUsers(email, page, USERS_PER_PAGE)
  }, [])

  // SWR for the current page
  const { data: currentPageUsers, isLoading, error } = useSWR(
    userEmail ? ['unconnectedUsers', userEmail, currentPage] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onSuccess: (data) => {
        if (currentPage === 1) {
          // First page - replace all users
          setAllUsers(data || [])
        } else {
          // Subsequent pages - append to existing users
          setAllUsers(prev => {
            const newUsers = data || []
            // Filter out duplicates based on user ID
            const existingIds = new Set(prev.map(user => user.id))
            const uniqueNewUsers = newUsers.filter(user => !existingIds.has(user.id))
            return [...prev, ...uniqueNewUsers]
          })
        }
        
        // Check if there are more users to load
        // If we got less than USERS_PER_PAGE, no more pages
        setHasMore((data || []).length === USERS_PER_PAGE)
        setIsLoadingMore(false)
      },
      onError: () => {
        setIsLoadingMore(false)
      }
    }
  )

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoading) return
    
    setIsLoadingMore(true)
    setCurrentPage(prev => prev + 1)
  }, [isLoadingMore, hasMore, isLoading])

  // Infinite scroll handler
  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
    
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50 // Reduced threshold
      
      if (isNearBottom && hasMore && !isLoadingMore && !isLoading) {
        loadMore()
      }
    }

    scrollElement.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [hasMore, isLoadingMore, isLoading, loadMore])

  // Alternative: Intersection Observer approach (more reliable)
  const lastUserRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!lastUserRef.current || isLoading || isLoadingMore || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(lastUserRef.current)

    return () => observer.disconnect()
  }, [loadMore, isLoading, isLoadingMore, hasMore, allUsers.length])

  const displayUsers = allUsers

  return (
    <Card className="bg-white shadow-lg sticky top-4 dark:bg-black dark:border border">
      <CardContent className="p-6">
        <div className="flex justify-center h-full w-full font-bold text-slate-800 text-lg m-2 dark:text-white">
          People You May Know
        </div>
        
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
                Failed to load users
              </div>
            ) : displayUsers.length === 0 ? (
              <div className="text-center text-gray-500 p-4">
                No users found
              </div>
            ) : (
              displayUsers.map((person, index) => (
                <div 
                  key={person.id} 
                  className="flex items-center justify-between mb-5 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  ref={index === displayUsers.length - 1 ? lastUserRef : null}
                >
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={person.userdp || "/placeholder.svg"} alt={person.name} />
                      <AvatarFallback>{person.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium text-sm text-black dark:text-white">
                      {person.name}
                    </p>
                  </div>
                  <Link href={`/userProfile/${person.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-black dark:bg-white border-black"
                    >
                      View
                    </Button>
                  </Link>
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
              <div className="text-center text-gray-500 py-4 text-sm">
                No more users to load
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Show More Button - navigates to full users page */}
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.push('/users')}>
            View All Users
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
