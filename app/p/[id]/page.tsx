"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MediaCarousel } from '@/components/ui/sections/MediaCarousel'
import { PostHeader } from '@/components/ui/sections/PostHeader'
import { CommentSection } from '@/components/ui/sections/CommentSection'
import { PostFooter } from '@/components/ui/sections/PostFooter'
import { fetchComments, handleAddComment, handleReplyToComment } from '@/components/ui/sections/utils'
import { fetchOnlyPost, fetchUserId, likePost, dislikePost, getLikesCount } from '@/app/api/actions/media'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import toast, { Toaster } from 'react-hot-toast'

export default function PostPage() {
  const params = useParams()
  const id = Number(params.id)

  const { data: session } = useSession()
  const [post, setPost] = useState(null)
  const [localComments, setLocalComments] = useState([])
  const [userId, setUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        const user = await fetchUserId(session.user.email)
        setUserId(user.id)
      }
    }

    const loadPostAndComments = async () => {
      if (id) {
        setIsLoading(true)
        try {
          const [fetchedPost, comments, likes] = await Promise.all([
            fetchOnlyPost(id),
            fetchComments(id),
            getLikesCount(id)
          ])
          setPost(fetchedPost)
          setLocalComments(comments)
          setLikesCount(likes)
          setIsLiked(fetchedPost.likes?.includes(session?.user?.email))
        } catch (error) {
          console.error("Error fetching post data:", error)
          toast.error("Failed to load post data")
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchUserData()
    loadPostAndComments()
  }, [id, session])

  const handleAddNewComment = async (postId, content) => {
    if (!userId) return
    const newComment = await handleAddComment(postId, userId, content)
    if (newComment) {
      setLocalComments(prevComments => [newComment, ...prevComments])
      toast.success("Comment added successfully")
    }
  }

  const handleAddNewReply = async (postId, parentId, content) => {
    if (!userId) return
    const newReply = await handleReplyToComment(postId, userId, content, parentId)
    if (newReply) {
      setLocalComments(prevComments => updateCommentsWithNewReply(prevComments, parentId, newReply))
      toast.success("Reply added successfully")
    }
  }

  const handleLikeToggle = async () => {
    if (!session) {
      toast.error("Please sign in to like posts")
      return
    }

    if (!session?.user?.email || isLikeLoading) return

    setIsLikeLoading(true)
    try {
      if (isLiked) {
        await dislikePost(id, session.user.email)
        setLikesCount(prev => prev - 1)
        setIsLiked(false)
        toast.success("Post unliked")
      } else {
        await likePost(id, session.user.email)
        setLikesCount(prev => prev + 1)
        setIsLiked(true)
        toast.success("Post liked")
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      toast.error("Failed to update like status")
    } finally {
      setIsLikeLoading(false)
    }
  }

  const updateCommentsWithNewReply = (comments, parentId, newReply) => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        }
      } else if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentsWithNewReply(comment.replies, parentId, newReply)
        }
      }
      return comment
    })
  }

  
  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
  
  if (!post) return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="p-4">
        <p className="text-muted-foreground">Post not found</p>
      </Card>
    </div>
  )

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-8">
        <Card className="max-w-4xl mx-auto overflow-hidden bg-background">
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row min-h-screen lg:h-[80vh]">
              {/* Media Section */}
              <div className="w-full lg:w-1/2 h-[40vh] lg:h-full bg-muted">
                <MediaCarousel post={post} />
              </div>

              {/* Content Section */}
              <div className="w-full lg:w-1/2 flex flex-col h-auto lg:h-full">
                {/* Header Area */}
                <div className="flex-none p-3 sm:p-6">
                  <PostHeader post={post} />
                  <div className="flex items-center gap-2 mt-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button
                              variant={isLiked ? "default" : "outline"}
                              size="sm"
                              onClick={handleLikeToggle}
                              disabled={!session || isLikeLoading}
                              className="flex items-center gap-2"
                            >
                              <ThumbsUp 
                                className={`w-4 h-4 transition-all duration-200 ${
                                  isLiked ? "fill-current scale-110" : "scale-100"
                                }`} 
                              />
                              <span className="tabular-nums">{likesCount}</span>
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {!session && (
                          <TooltipContent>
                            <p>Sign in to like posts</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="mt-3 text-sm sm:text-base text-muted-foreground">{post.content}</p>
                </div>

                <Separator />

                {/* Comments Area */}
                <div className="flex-grow flex flex-col min-h-0 p-3 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-3">Comments</h2>
                  <ScrollArea className="flex-grow min-h-[200px] sm:min-h-[200px] -mx-2 px-2">
                    <div className="space-y-3 pr-2 sm:pr-4">
                      <CommentSection 
                        post={{...post, comments: localComments}} 
                        userId={userId} 
                        onAddReply={handleAddNewReply}
                      />
                    </div>
                  </ScrollArea>

                  {/* Comment Input */}
                  <div className="flex-none mt-2 mb-10">
                    <Separator className="mb-5" />
                    <PostFooter 
                      post={{...post, comments: localComments}} 
                      userId={userId} 
                      onAddComment={handleAddNewComment}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}