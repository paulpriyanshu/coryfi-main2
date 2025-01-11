'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useSession } from 'next-auth/react'
import { MediaCarousel } from './MediaCarousel'
import { PostHeader } from './PostHeader'
import { CommentSection } from './CommentSection'
import { PostFooter } from './PostFooter'
import { fetchComments, handleAddComment, handleReplyToComment } from './utils'
import { ScrollArea } from "@/components/ui/scroll-area"

// Media query hook
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [matches, query])

  return matches
}

// Mobile Post Modal Component
function MobilePostModal({ isOpen, onClose, post, userId }) {
  const { data: session } = useSession()
  const [localComments, setLocalComments] = useState([])

  useEffect(() => {
    const loadComments = async () => {
      if (isOpen) {
        const comments = await fetchComments(post.id)
        setLocalComments(comments)
      }
    }
    loadComments()
  }, [isOpen, post.id])

  const handleAddNewComment = async (postId, content) => {
    const newComment = await handleAddComment(postId, userId, content)
    if (newComment) {
      setLocalComments(prevComments => [...prevComments, newComment])
    }
  }

  const handleAddNewReply = async (postId, parentId, content) => {
    const newReply = await handleReplyToComment(postId, userId, content, parentId)
    if (newReply) {
      setLocalComments(prevComments => updateCommentsWithNewReply(prevComments, parentId, newReply))
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[100dvh] p-0 gap-0 max-w-md mx-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-background border-b">
          <PostHeader post={post} onClose={onClose} />
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 h-[calc(100dvh-4rem)]">
          <div className="flex flex-col">
            {/* Media Section */}
            <div className="relative aspect-square w-full bg-muted">
              <MediaCarousel post={post} />
            </div>

            {/* Post Content */}
            <div className="p-4 border-b">
              <p className="text-sm text-muted-foreground">{post.content}</p>
            </div>

            {/* Comment Input */}
            <div className="border-b">
              <PostFooter
                post={{...post, comments: localComments}}
                userId={userId}
                onAddComment={handleAddNewComment}
              />
            </div>

            {/* Comments Section */}
            <div className="flex-1">
              <CommentSection
                post={{...post, comments: localComments}}
                userId={userId}
                onAddReply={handleAddNewReply}
              />
            </div>
          </div>
        </ScrollArea>

      </DialogContent>
    </Dialog>
  )
}

// Desktop Post Modal Component
function DesktopPostModal({ isOpen, onClose, post, userId }) {
  const { data: session } = useSession()
  const [localComments, setLocalComments] = useState([])

  useEffect(() => {
    const loadComments = async () => {
      if (isOpen) {
        const comments = await fetchComments(post.id)
        setLocalComments(comments)
      }
    }
    loadComments()
  }, [isOpen, post.id])

  const handleAddNewComment = async (postId, content) => {
    const newComment = await handleAddComment(postId, userId, content)
    if (newComment) {
      setLocalComments(prevComments => [...prevComments, newComment])
    }
  }

  const handleAddNewReply = async (postId, parentId, content) => {
    const newReply = await handleReplyToComment(postId, userId, content, parentId)
    if (newReply) {
      setLocalComments(prevComments => updateCommentsWithNewReply(prevComments, parentId, newReply))
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] h-[95vh] max-h-[95vh] overflow-hidden p-0">
        <div className="flex h-full">
          {/* Left side - Media */}
          <div className="relative flex-grow bg-background flex items-center justify-center">
            <MediaCarousel post={post} />
          </div>

          {/* Right side - Comments and Footer */}
          <div className="w-full max-w-md flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto">
              {/* Scrollable content */}
              <div>
                {/* Header */}
                <div className="p-4 border-b sticky top-0 bg-white z-10">
                  <PostHeader post={post} onClose={onClose} />
                  <p className="text-sm text-gray-600">{post.content}</p>
                </div>

                {/* Comments */}
                <div className="flex-1">
                  <CommentSection
                    post={{...post, comments: localComments}}
                    userId={userId}
                    onAddReply={handleAddNewReply}
                  />
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="border-t sticky bottom-0 bg-white z-10">
              <PostFooter
                post={{...post, comments: localComments}}
                userId={userId}
                onAddComment={handleAddNewComment}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Responsive wrapper component
export function PostModal(props) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  return isMobile ? (
    <MobilePostModal {...props} />
  ) : (
    <DesktopPostModal {...props} />
  )
}

