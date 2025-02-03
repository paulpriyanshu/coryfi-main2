"use client"

import { useState } from "react"
import Posts from "./Posts"

interface PostWrapperProps {
  post: any
  session: any
  userId: { id: string }
}

export default function PostWrapper({ post, session, userId }: PostWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <Posts post={post} session={session} userId={userId} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
  )
}

