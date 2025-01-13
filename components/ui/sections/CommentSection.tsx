import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { ChevronDown, ChevronUp, Send } from 'lucide-react'

interface CommentItemProps {
  comment: any
  postId: number
  onAddReply: (parentId: number, content: string) => Promise<void>
}

export default function CommentItem ({ comment, postId, onAddReply }) {
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [newReply, setNewReply] = useState('')
  const hasReplies = comment?.replies && comment?.replies?.length > 0

  const handleAddReply = async () => {
    if (newReply.trim()) {
      await onAddReply(comment.id, newReply.trim())
      setNewReply('')
      setIsReplying(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-2">
        <Avatar className="w-6 h-6">
          <AvatarImage src={comment?.user?.avatar || "/placeholder.svg?height=24&width=24"} alt={comment?.user?.name} />
          <AvatarFallback>{comment?.user?.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-grow min-w-0"> 
          <p className="text-sm font-semibold">{comment?.user?.name}</p>
          <p className="text-sm break-words">{comment?.content}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <button
              className="text-xs hover:underline"
              onClick={() => setIsReplying(!isReplying)}
            >
              Reply
            </button>
            <span className="text-xs text-muted-foreground">
              {new Date(comment?.createdAt).toLocaleString()}
            </span>
            {hasReplies && (
              <button
                className="text-xs hover:underline flex items-center gap-1"
                onClick={() => setShowReplies(!showReplies)}
              >
                {comment?.replies?.length} {comment?.replies?.length === 1 ? 'reply' : 'replies'}
                {showReplies ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {isReplying && (
        <div className="mt-2 flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Write a reply..."
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            className="flex-grow"
          />
          <Button 
            onClick={handleAddReply} 
            size="sm"
            type="button"
          >
            <Send className="h-4 w-4 mr-2" />
            Reply
          </Button>
        </div>
      )}

      {hasReplies && showReplies && (
        <div className="ml-6 space-y-4 border-l border-border pl-4 mt-2">
          {comment?.replies?.map((reply) => (
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

