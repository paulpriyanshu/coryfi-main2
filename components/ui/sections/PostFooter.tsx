"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface PostFooterProps {
  post: {
    id: number
  }
  userId: number | null
  onAddComment: (postId: number, content: string) => Promise<void>
}

export function PostFooter({ post, userId, onAddComment }: PostFooterProps) {
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!comment.trim() || !userId || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onAddComment(post.id, comment)
      setComment('')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!userId) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            Please sign in to comment
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[80px] resize-none"
      />
      <div className="flex justify-center w-full">
        <Button
          onClick={handleSubmit}
          disabled={!comment.trim() || isSubmitting}
           className='w-full m-4'
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </div>
  )
}

