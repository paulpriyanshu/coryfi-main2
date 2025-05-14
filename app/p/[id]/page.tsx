"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { MessageCircle, ThumbsUp, Share, ChevronDown } from "lucide-react"
import { useSession } from "next-auth/react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { likePost, dislikePost, fetchOnlyPost, fetchUserId } from "@/app/api/actions/media"
import { toast, Toaster } from "react-hot-toast"
import { useMediaQuery } from "@/components/ui/sections/hooks/use-media-query"
import { useParams } from "next/navigation"
import { fetchComments, handleAddComment, handleReplyToComment } from "@/components/ui/sections/utils"

function ReplyInput({ postId, parentId, onAddReply, onCancel }) {
  const [newReply, setNewReply] = useState("")

  const handleReplySubmit = async () => {
    if (newReply.trim()) {
      await onAddReply(postId, parentId, newReply.trim())
      setNewReply("")
      onCancel()
    }
  }

  return (
    <div className="mt-2 flex items-center space-x-2">
      <Input
        type="text"
        placeholder="Write a reply..."
        value={newReply}
        onChange={(e) => setNewReply(e.target.value)}
        className="flex-grow"
      />
      <Button onClick={handleReplySubmit} size="sm" variant="ghost">
        Post
      </Button>
      <Button onClick={onCancel} size="sm" variant="ghost">
        Cancel
      </Button>
    </div>
  )
}

function CommentItem({ comment, postId, onAddReply }) {
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <Avatar className="w-6 h-6">
          <AvatarImage src={comment?.user?.userdp || "/placeholder.svg"} alt={comment?.user?.name} />
          <AvatarFallback>{comment?.user?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-grow min-w-0">
          <span className="text-sm font-semibold">{comment?.user?.name}</span>
          <span className="text-sm ml-2">{comment.content}</span>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
            <button className="text-gray-500 hover:text-gray-700" onClick={() => setIsReplying(!isReplying)}>
              Reply
            </button>
            <span className="text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
            {hasReplies && (
              <button
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                onClick={() => setShowReplies(!showReplies)}
              >
                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>
        </div>
      </div>

      {isReplying && (
        <ReplyInput
          postId={postId}
          parentId={comment.id}
          onAddReply={onAddReply}
          onCancel={() => setIsReplying(false)}
        />
      )}

      {hasReplies && showReplies && (
        <div className="ml-8 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} onAddReply={onAddReply} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Page({ isOpen = true, onClose }) {
  const { data: session, status } = useSession()
  const [post, setPost] = useState(null)
  const [localComments, setLocalComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [isSessionReady, setIsSessionReady] = useState(false)
  const [userId, setUserId] = useState(null)
  const [likesCount, setLikesCount] = useState(0)
  const [expandedView, setExpandedView] = useState(false)
  const commentsRef = useRef(null)
  const params = useParams()
  const id = params.id
  const isMobile = useMediaQuery("(max-width: 640px)")

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      setUserEmail(String(session.user.email))
      setIsSessionReady(true)
    }
  }, [session, status])

  useEffect(() => {
    const fetchPostData = async () => {
      const userData = await fetchUserId(userEmail)
      const postData = await fetchOnlyPost(Number(id))
      setUserId(userData?.id)
      setPost(postData)
      setIsLiked(postData?.likes?.includes(userEmail))
      setLikesCount(postData?.likes?.length || 0)
    }
    fetchPostData()
  }, [userEmail, id])

  useEffect(() => {
    const loadComments = async () => {
      if (isOpen && post?.id) {
        const comments = await fetchComments(post.id)
        setLocalComments(comments)
      }
    }
    loadComments()
  }, [isOpen, post?.id])

  const handleLikeToggle = async () => {
    if (!userEmail) return
    try {
      if (isLiked) {
        await dislikePost(post?.id, userEmail)
        setIsLiked(false)
        setLikesCount((prev) => prev - 1)
      } else {
        await likePost(post?.id, userEmail)
        setIsLiked(true)
        setLikesCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleAddNewComment = async () => {
    if (!newComment.trim() || !userId) return
    const comment = await handleAddComment(post?.id, userId, newComment)
    if (comment) {
      setLocalComments((prev) => [...prev, comment])
      setNewComment("")
    }
  }

  const handleAddNewReply = async (postId, parentId, content) => {
    const newReply = await handleReplyToComment(postId, userId, content, parentId)
    if (newReply) {
      setLocalComments((prev) => updateCommentsWithNewReply(prev, parentId, newReply))
    }
  }

  const updateCommentsWithNewReply = (comments, parentId, newReply) => {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        }
      } else if (comment.replies?.length > 0) {
        return {
          ...comment,
          replies: updateCommentsWithNewReply(comment.replies, parentId, newReply),
        }
      }
      return comment
    })
  }

  const handleShare = async (e, postId) => {
    e.stopPropagation()
    const url = `https://connect.coryfi.com/p/${postId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard", {
        duration: 3000,
        position: "top-center",
      })
    } catch (error) {
      console.error("Failed to copy:", error)
      toast.error("Failed to copy link", {
        duration: 3000,
        position: "top-center",
      })
    }
  }

  const scrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: "smooth" })
    }
    setExpandedView(true)
  }

  const toggleExpandedView = () => {
    setExpandedView(!expandedView)
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Toaster />

      <Card className="w-full max-w-4xl overflow-hidden">
        <div className="flex flex-col md:flex-row w-full h-full">
          {post?.imageUrl?.length > 0 && (
            <div
              className={`md:w-1/2 bg-black flex items-center justify-center ${expandedView ? "h-[20vh]" : "h-[30vh]"} md:h-auto transition-all duration-300`}
            >
              <Carousel className="w-full">
                <CarouselContent>
                  {post.imageUrl.map((url, index) => (
                    <CarouselItem key={index}>
                      <div className="flex items-center justify-center h-full">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Post image ${index + 1}`}
                          className={`${expandedView ? "max-h-[20vh]" : "max-h-[30vh]"} md:max-h-[90vh] w-full object-contain transition-all duration-300`}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {post.imageUrl.length > 1 && (
                  <>
                    <CarouselPrevious className="absolute left-2" />
                    <CarouselNext className="absolute right-2" />
                  </>
                )}
              </Carousel>
            </div>
          )}
          <div className={`flex flex-col h-full ${post?.imageUrl?.length > 0 ? "md:w-1/2" : "w-full"}`}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post?.user?.userdp || "/placeholder.svg"} alt={post?.user?.name} />
                    <AvatarFallback>{post?.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{post?.user?.name}</span>
                    <span className="text-xs text-gray-500">{new Date(post?.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {post?.content && (
                <div
                  className="mt-2 px-4 text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              )}
            </div>

            {isMobile && (
              <div className="flex justify-center py-2 border-b sticky top-0 bg-white z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs flex items-center gap-1 text-gray-500"
                  onClick={toggleExpandedView}
                >
                  {expandedView ? (
                    <>
                      Collapse comments <ChevronDown className="h-3 w-3 transform rotate-180" />
                    </>
                  ) : (
                    <>
                      View all comments <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            )}

            <div
              ref={commentsRef}
              className="overflow-y-auto flex-grow"
              style={{ maxHeight: isMobile ? (expandedView ? "none" : "40vh") : "none" }}
            >
              <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                {localComments.length > 0 ? (
                  localComments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} postId={post?.id} onAddReply={handleAddNewReply} />
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>

            <div className="border-t p-4 space-y-4 mt-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                  <Button variant="ghost" size="sm" className="h-9 px-2 md:px-3" onClick={handleLikeToggle}>
                    <ThumbsUp className={`w-5 h-5 md:w-6 md:h-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2 md:px-3"
                    onClick={() => {
                      setExpandedView(true)
                      setTimeout(() => {
                        if (commentsRef.current) {
                          commentsRef.current.scrollIntoView({ behavior: "smooth" })
                        }
                      }, 100)
                    }}
                  >
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2 md:px-3"
                    onClick={(e) => handleShare(e, post?.id)}
                  >
                    <Share className="w-5 h-5 md:w-6 md:h-6" />
                  </Button>
                </div>
                <p className="text-sm font-semibold">{likesCount} likes</p>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder={userId ? "Add a comment..." : "Please sign in to comment"}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && userId && handleAddNewComment()}
                  className="text-sm"
                  disabled={!userId}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddNewComment}
                  className="whitespace-nowrap"
                  disabled={!userId}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
