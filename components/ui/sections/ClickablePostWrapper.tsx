"use client"

import { useState, type ReactNode } from "react"
import PostModal from "./PostModal"

interface ClickablePostWrapperProps {
  children: ReactNode
  post: {
    id: string
    content: string
    imageUrl?: string[]
    videoUrl?: string[]
    likes: string[]
    comments: any[]
    user: {
      id: string
      name: string
      userdp: string
    }
  }
  userId: { id: string }
}

export default function   ClickablePostWrapper({ children, post, userId }: ClickablePostWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
   <div
  className="bg-white dark:bg-black border border-slate-100 dark:border-slate-900 border-y
             my-2 rounded-sm md:rounded-lg md:p-4 transition-colors duration-300"
  onClick={() => setIsModalOpen(true)}
>
      {children}
      {isModalOpen && (
        <PostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} post={post} userId={userId.id} />
      )}
    </div>
  )
}

