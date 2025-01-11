import { createComment, replyToComment, fetchCommentsWithReplies } from '@/app/api/actions/media'

export const handleAddComment = async (postId: number, userId: number, content: string) => {
  const result = await createComment(postId, userId, content)
  if (result.success) {
    return result.comment
  } else {
    console.error('Error adding comment:', result.error)
    return null
  }
}

export const handleReplyToComment = async (postId: number, userId: number, content: string, parentId: number) => {
  const result = await replyToComment(postId, userId, content, parentId)
  if (result.success) {
    return result.reply
  } else {
    console.error('Error adding reply:', result.error)
    return null
  }
}

export const fetchComments = async (postId: number) => {
  const result = await fetchCommentsWithReplies(postId)
  if (result.success) {
    return result.comments
  } else {
    console.error('Error fetching comments:', result.error)
    return []
  }
}

