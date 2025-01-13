import { useState, useRef, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { MessageCircle, ThumbsUp, Share } from 'lucide-react'

function CommentItem({ comment, postId, onAddReply }) {
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
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
        <div className="mt-2 flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Write a reply..."
            className="flex-grow"
          />
          <Button 
            onClick={() => {
              // Handle reply submission
              setIsReplying(false)
            }} 
            size="sm"
            variant="ghost"
          >
            Post
          </Button>
          <Button 
            onClick={() => setIsReplying(false)} 
            size="sm"
            variant="ghost"
          >
            Cancel
          </Button>
        </div>
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

function CommentsModal({ isOpen, onClose, comments, postId, onAddReply, userId, newComment, setNewComment, handleAddNewComment }) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow p-4">
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              postId={postId} 
              onAddReply={onAddReply}
            />
          ))}
        </ScrollArea>
        <div className="border-t p-4">
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
      </SheetContent>
    </Sheet>
  )
}

export default function MobilePostModal({
  post,
  userId,
  isOpen,
  onClose,
  localComments,
  newComment,
  setNewComment,
  handleAddNewComment,
  handleAddNewReply,
  isLiked,
  handleLikeToggle,
  isSaved,
  setIsSaved,
  likesCount,
  handleShare
}) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const sheetRef = useRef(null)

  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0]
      const startY = touch.clientY
      
      const handleTouchMove = (e) => {
        const touch = e.touches[0]
        const currentY = touch.clientY
        
        if (currentY - startY > 100) {
          onClose()
          document.removeEventListener('touchmove', handleTouchMove)
        }
      }
      
      document.addEventListener('touchmove', handleTouchMove)
    }

    const sheetElement = sheetRef.current
    if (sheetElement) {
      sheetElement.addEventListener('touchstart', handleTouchStart)
    }

    return () => {
      if (sheetElement) {
        sheetElement.removeEventListener('touchstart', handleTouchStart)
      }
    }
  }, [onClose])

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] p-0" ref={sheetRef}>
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.user?.userdp} alt={post.user?.name} />
                  <AvatarFallback>{post.user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold">{post.user?.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
              </Button>
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(90vh-60px)]">
            {post.imageUrl?.length > 0 && (
              <Carousel className="w-full">
                <CarouselContent>
                  {post.imageUrl.map((url, index) => (
                    <CarouselItem key={index}>
                      <div className="flex items-center justify-center h-full">
                        <img
                          src={url}
                          alt={`Post image ${index + 1}`}
                          className="max-h-[50vh] max-w-full object-contain"
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
            )}

            <div className="p-4 space-y-4">
              {post.content && (
                <p className="text-sm">{post.content}</p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleLikeToggle}
                  >
                    <ThumbsUp className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsCommentsOpen(true)}>
                    <MessageCircle className="w-6 h-6" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => handleShare(e, post.id)}>
                    <Share className="w-6 h-6" />
                  </Button>
                </div>
              </div>
              <p className="text-sm font-semibold">{likesCount} likes</p>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <CommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        comments={localComments}
        postId={post.id}
        onAddReply={handleAddNewReply}
        userId={userId}
        newComment={newComment}
        setNewComment={setNewComment}
        handleAddNewComment={handleAddNewComment}
      />
    </>
  )
}

