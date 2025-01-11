import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { Send, ChevronDown, ChevronUp } from 'lucide-react'

const ReplyInput = ({ postId, parentId, onAddReply, onCancel }) => {
  const [newReply, setNewReply] = useState('')

  const handleReplySubmit = async () => {
    if (newReply.trim()) {
      await onAddReply(postId, parentId, newReply.trim())
      setNewReply('')
      onCancel()
    }
  }

  return (
    <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
      <Input
        type="text"
        placeholder="Write a reply..."
        value={newReply}
        onChange={(e) => setNewReply(e.target.value)}
        className="flex-grow"
      />
      <div className="flex space-x-2">
        <Button 
          onClick={handleReplySubmit} 
          size="sm"
          type="button"
        >
          <Send className="h-4 w-4 mr-2" />
          Reply
        </Button>
        <Button 
          onClick={onCancel} 
          size="sm"
          variant="outline"
          type="button"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

const CommentItem = ({ comment, postId, onAddReply }) => {
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const hasReplies = comment.replies && comment.replies.length > 0

  const handleAddReply = async (postId, parentId, content) => {
    await onAddReply(postId, parentId, content)
    setIsReplying(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-2">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage src={comment?.user?.avatar} alt={comment?.user?.name} />
          <AvatarFallback>{comment?.user?.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-grow min-w-0"> 
          <p className="text-sm font-semibold">{comment?.user?.name}</p>
          <p className="text-sm break-words">{comment.content}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <button
              className="text-xs hover:underline"
              onClick={() => setIsReplying(!isReplying)}
            >
              Reply
            </button>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
            {hasReplies && (
              <button
                className="text-xs hover:underline flex items-center gap-1"
                onClick={() => setShowReplies(!showReplies)}
              >
                {comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}
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
        <ReplyInput 
          postId={postId} 
          parentId={comment.id} 
          onAddReply={handleAddReply}
          onCancel={() => setIsReplying(false)}
        />
      )}

      {hasReplies && showReplies && (
        <div className="ml-2 space-y-4 border-l border-border pl-4">
          {comment.replies?.map((reply) => (
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

export const CommentSection = ({ post, userId, onAddReply, maxHeight = "400px" }) => (
  <div className="rounded-md border bg-background p-4">
    <div className="space-y-4 overflow-y-auto custom-scrollbar" style={{ maxHeight }}>
      {post?.comments?.map((comment) => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          postId={post.id} 
          onAddReply={onAddReply}
        />
      ))}
    </div>
  </div>
)

// Add this to your global CSS file:
/*
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 20px;
  border: transparent;
}
*/