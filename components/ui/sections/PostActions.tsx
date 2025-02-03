"use client"

import { useState } from "react"
import { MessageSquare, ThumbsUp, Share2 } from "lucide-react"
import { handleLike } from "@/app/feed/action"
import toast from "react-hot-toast"
import PostModal from "./PostModal"

interface PostActionsProps {
  post: {
    id: string
    likes: string[]
    comments: any[]
  }
  session: any
  userId: { id: string }
}

export default function PostActions({ post, session, userId }: PostActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(post.likes.includes(session?.user?.email))
  const [likeCount, setLikeCount] = useState(post.likes.length)

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    await handleLike(post.id, post, session)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `https://connect.coryfi.com/p/${post.id}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard", {
        duration: 2000,
        style: {
          background: "#4CAF50",
          color: "#fff",
        },
      })
    } catch (error) {
      console.error("Failed to copy:", error)
      toast.error("Failed to copy link", {
        duration: 2000,
        style: {
          background: "#EF4444",
          color: "#fff",
        },
      })
    }
  }

  return (
    <>
      <div className="flex justify-between">
        <button
          className={`flex items-center px-3 py-1 rounded-md hover:bg-gray-100 ${
            isLiked ? "text-blue-600" : "text-gray-600"
          }`}
          onClick={handleLikeClick}
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          {likeCount}
        </button>
        <button
          className="flex items-center px-3 py-1 rounded-md hover:bg-gray-100 text-gray-600"
          onClick={() => setIsModalOpen(true)}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {post.comments?.length || 0}
        </button>
        <button
          className="flex items-center px-3 py-1 rounded-md hover:bg-gray-100 text-gray-600"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </button>
      </div>

      {isModalOpen && (
        <PostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} post={post} userId={userId.id} />
      )}
    </>
  )
}

PostActions.ShowMoreButton = function ShowMoreButton() {
  const [showFullContent, setShowFullContent] = useState(false)

  return (
    <button
      className="text-blue-500 font-semibold hover:underline ml-2"
      onClick={(e) => {
        e.stopPropagation()
        setShowFullContent(!showFullContent)
      }}
    >
      {showFullContent ? "Show less" : "...more"}
    </button>
  )
}

