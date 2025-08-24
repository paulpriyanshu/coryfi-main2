"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Posts from "@/components/ui/sections/Posts"
import ModernUserCarousel from "./ui/sections/ModernUserCarousel" // Assuming this component exists
import { fetchImages } from "@/app/api/actions/media" // Import the server action

// Define the Post interface matching the expected structure in components/ui/sections/Posts.tsx
interface Post {
  id: string
  content: string
  imageUrl?: string[]
  videoUrl?: string[]
  likes: string[]
  comments: {
    id: string
    userId: string
    content: string
    createdAt: string
  }[]
  createdAt: string
  user: {
    id: string
    name: string
    userdp: string
  }
}

interface PostListProps {
  initialPosts: Post[]
  session: any
  userId: { id: number } | null
}

export default function PostList({ initialPosts, session, userId }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [page, setPage] = useState(1) // initialPosts is considered page 1
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loader = useRef<HTMLDivElement>(null)

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    const nextPage = page + 1
    const newPosts = await fetchImages(nextPage) // Call the server action

    if (newPosts.length === 0) {
      setHasMore(false)
    } else {
      setPosts((prevPosts) => [...prevPosts, ...newPosts])
      setPage(nextPage)
    }
    setLoading(false)
  }, [page, loading, hasMore]) // Dependencies for useCallback

  useEffect(() => {
    const options = {
      root: null, // Use the viewport as the root
      rootMargin: "200px", // Load when 200px from the bottom of the viewport
      threshold: 1.0, // Trigger when 100% of the target is visible
    }

    const observer = new IntersectionObserver((entries) => {
      const target = entries[0]
      if (target.isIntersecting && hasMore && !loading) {
        loadMorePosts()
      }
    }, options)

    const currentLoader = loader.current
    if (currentLoader) {
      observer.observe(currentLoader)
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader)
      }
    }
  }, [loadMorePosts, hasMore, loading]) // Dependencies for useEffect

  return (
    <div>
      {/* Conditionally render ModernUserCarousel on mobile */}
      {<div className="md:hidden">
        <ModernUserCarousel userEmail={session?.user?.email ? session?.user?.email : null} />
      </div>}
      {/* Map over the 'posts' state for infinite scrolling */}
      {posts?.map((post) => (
        <div key={post.id}>
          <Posts post={post} session={session} userId={userId} />
        </div>
      ))}

      {/* Loader div for IntersectionObserver */}
      <div ref={loader} className="flex justify-center p-4">
        {loading && hasMore && (
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Loading more posts...</span>
          </div>
        )}
        {!hasMore && !loading && posts.length > 0 && ( // Only show "end" if there are posts
          <p className="text-gray-500 dark:text-gray-400">You&apos;ve reached the end!</p>
        )}
        {!loading && posts.length === 0 && ( // Show message if no posts at all
          <p className="text-gray-500 dark:text-gray-400">No posts available.</p>
        )}
      </div>
    </div>
  )
}
