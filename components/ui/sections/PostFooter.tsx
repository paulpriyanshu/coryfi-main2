"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"




export default function PostFooter({ post, userId, onAddComment }) {
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
    <div className="h-full px-4 py-3 flex flex-col">
    <Textarea
      placeholder="Add a comment..."
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      className="min-h-[60px] max-h-[60px] resize-none mb-2"
    />
    <div className="flex justify-end mt-auto">
      <Button
        onClick={handleSubmit}
        disabled={!comment.trim() || isSubmitting}
        className="px-6"
      >
        {isSubmitting ? 'Posting...' : 'Post'}
      </Button>
    </div>
  </div>
  )
}

