"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { fetchImages } from "@/app/api/actions/media"
import { Toaster } from "react-hot-toast"
import PostCreator from "@/components/PostCreator" // Assuming this component exists
import PostList from "@/components/PostList"
import ScrollToTopButton from "@/components/ScrollToTopButton" // Assuming this component exists

interface Post {
  id: string
  src: string
  alt: string
  description: string
  likes: number
  comments: number
  user: {
    name: string
    avatar: string
  }
}

interface EnhancedInfiniteScrollNetworkProps {
  initialPosts: any[] // Use a more specific type if available, or Post[] from actions/media
  session: any
  userId: { id: number } | null
}

export default function EnhancedInfiniteScrollNetwork({ initialPosts, session, userId }: EnhancedInfiniteScrollNetworkProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [page, setPage] = useState(1) // initialPosts is considered page 1
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loader = useRef<HTMLDivElement>(null)

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    const nextPage = page + 1
    const newPosts = await fetchImages(nextPage)

    if (newPosts.length === 0) {
      setHasMore(false)
    } else {
      setPosts((prevPosts) => [...prevPosts, ...newPosts])
      setPage(nextPage)
    }
    setLoading(false)
  }, [page, loading, hasMore])

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
  }, [loadMorePosts, hasMore, loading])

  // Function to handle new post creation
  const handleNewPost = async () => {
    // Here, trigger any server-side updates like saving the post to a database
    // revalidatePath("/feed") // Adjust this based on your actual route for posts
    // Note: Revalidating the path might reset the scroll position in an infinite scroll
    // A more advanced approach would be to update the client-side PostList state directly
    // or use a mechanism like optimistic updates.
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="hidden md:block">
        {/* Pass userId correctly from the parent component */}
        <PostCreator userId={userId?.id} />
      </div>
      {/* Pass all necessary props to PostList for infinite scrolling */}
      <PostList initialPosts={initialPosts} session={session} userId={userId} />
      <ScrollToTopButton />
    </>
  )
}
