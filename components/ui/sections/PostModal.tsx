'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/Input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, ThumbsUp, Share } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { fetchComments, handleAddComment, handleReplyToComment } from './utils'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { likePost, dislikePost } from '@/app/api/actions/media'
import { toast, Toaster } from 'react-hot-toast'
import MobilePostModal from './mobile-post-modal'
import { useMediaQuery } from './hooks/use-media-query'
// import { sanitizeHtml } from './utils/sanitizeHtml'
import DOMPurify from 'dompurify';


function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

function ReplyInput({ postId, parentId, onAddReply, onCancel }) {
  const [newReply, setNewReply] = useState('')

  const handleReplySubmit = async () => {
    if (newReply.trim()) {
      await onAddReply(postId, parentId, newReply.trim())
      setNewReply('')
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
      <Button 
        onClick={handleReplySubmit} 
        size="sm"
        variant="ghost"
      >
        Post
      </Button>
      <Button 
        onClick={onCancel} 
        size="sm"
        variant="ghost"
      >
        Cancel
      </Button>
    </div>
  )
}

function CommentItem({ comment, postId, onAddReply }) {
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  console.log("comment",comment)
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <Avatar className="w-6 h-6">
          <AvatarImage src={comment?.user?.userdp} alt={comment?.user?.name} />
          <AvatarFallback>{comment?.user?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-grow min-w-0">
          <span className="text-sm font-semibold">{comment?.user?.name}</span>
          <span className="text-sm ml-2">{comment.content}</span>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <button
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={() => setIsReplying(!isReplying)}
            >
              Reply
            </button>
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
            {hasReplies && (
              <button
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                onClick={() => setShowReplies(!showReplies)}
              >
                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
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
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              postId={postId} 
              onAddReply={onAddReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PostModal({ post, userId, isOpen, onClose }) {
  const { data: session, status } = useSession()
  const [localComments, setLocalComments] = useState(post.comments || [])
  const [newComment, setNewComment] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [likesCount, setLikesCount] = useState(post?.likes?.length)
  
  const isMobile = useMediaQuery("(max-width: 640px)")



  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      setUserEmail(String(session.user.email))
      setIsLiked(post?.likes?.includes(session.user.email))
      console.log("post",post)
    }
  }, [session, status, post.likes]);

  const handleLikeToggle = async () => {
    if (!userEmail) return;

    try {
      if (isLiked) {
        await dislikePost(post.id, userEmail)
        setIsLiked(false)
        setLikesCount(prev => prev - 1)
      } else {
        await likePost(post.id, userEmail)
        setIsLiked(true)
        setLikesCount(prev => prev + 1)
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  useEffect(() => {
    const loadComments = async () => {
      if (isOpen) {
        const comments = await fetchComments(post.id)
        setLocalComments(comments)
      }
    }
    loadComments()
  }, [isOpen, post.id])

  const handleAddNewComment = async () => {
    if (!newComment.trim() || !userId) return

    const comment = await handleAddComment(post.id, userId, newComment)
    if (comment) {
      setLocalComments(prev => [...prev, comment])
      setNewComment('')
    }
  }

  const handleAddNewReply = async (postId, parentId, content) => {
    const newReply = await handleReplyToComment(postId, userId, content, parentId)
    if (newReply) {
      setLocalComments(prev => updateCommentsWithNewReply(prev, parentId, newReply))
    }
  }

  const updateCommentsWithNewReply = (comments, parentId, newReply) => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        }
      } else if (comment.replies?.length > 0) {
        return {
          ...comment,
          replies: updateCommentsWithNewReply(comment.replies, parentId, newReply)
        }
      }
      return comment
    })
  }

  const handleShare = async (e, postId) => {
    e.stopPropagation(); // Prevent post modal from opening
    const url = `https://connect.coryfi.com/p/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard', {
        duration: 3000,
        position: 'top-center',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link', {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  // const post.content = sanitizeHtml(post.content)

  return (
    <>
      <Toaster />
      {isMobile ? (
        <MobilePostModal
          post={{...post, content: post.content}}
          userId={userId}
          isOpen={isOpen}
          onClose={onClose}
          localComments={localComments}
          newComment={newComment}
          setNewComment={setNewComment}
          handleAddNewComment={handleAddNewComment}
          handleAddNewReply={handleAddNewReply}
          isLiked={isLiked}
          handleLikeToggle={handleLikeToggle}
          isSaved={isSaved}
          setIsSaved={setIsSaved}
          likesCount={likesCount}
          handleShare={handleShare}
        />
      ) : (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px] md:max-w-[890px] lg:max-w-[940px] p-0">
            <DialogTitle className="sr-only">Post Details</DialogTitle>
            <DialogDescription className="sr-only">View and interact with this post</DialogDescription>
            <div className="flex flex-col md:flex-row w-full h-[80vh]">
              {post.imageUrl?.length > 0 && (
                <div className="md:flex-1 bg-black flex items-center justify-center relative">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {post.imageUrl.map((url, index) => (
                        <CarouselItem key={index}>
                          <div className="flex items-center justify-center h-full">
                            <img
                              src={url || "/placeholder.svg"}
                              alt={`Post image ${index + 1}`}
                              className="max-h-[80vh] max-w-full object-contain"
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
              <div className={`flex flex-col h-full ${post.imageUrl?.length > 0 ? 'md:w-[350px]' : 'w-full'}`}>
                <DialogHeader className="p-4 border-b shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={post.user?.userdp} alt={post.user?.name} />
                        <AvatarFallback>{post.user?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{post.user?.name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}/>
                  </div>
                  {post.content && (
                    <div 
                      className="mt-2 px-4 text-sm prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  )}
                </DialogHeader>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {localComments.map((comment) => (
                      <CommentItem 
                        key={comment.id} 
                        comment={comment} 
                        postId={post.id} 
                        onAddReply={handleAddNewReply}
                      />
                    ))}
                  </div>
                </ScrollArea>

                <div className="border-t p-4 space-y-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleLikeToggle}
                      >
                        <ThumbsUp className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="w-6 h-6" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => handleShare(e, post.id)}>
                        <Share className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{likesCount} likes</p>

                  {userId ? (
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Add a comment..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddNewComment()}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleAddNewComment}
                      >
                        Post
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center">
                      Please sign in to comment
                    </p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
