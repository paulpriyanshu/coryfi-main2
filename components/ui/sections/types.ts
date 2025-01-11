export interface User {
    name: string
    avatar: string
  }
  
  export interface Reply {
    id: number
    user: User
    content: string
    timestamp: string
  }
  
  export interface Comment {
    id: number
    user: User
    content: string
    timestamp: string
    replies: Reply[]
  }
  
  export interface Post {
    id: number
    content: string
    imageUrl: string[]
    videoUrl?: string[]
    likes: number[]
    comments: Comment[]
    user: User
    createdAt: string
  }
  
  export interface PostModalProps {
    isOpen: boolean
    onClose: () => void
    post: Post
    onAddComment: (postId: number, comment: string) => void
    onAddReply: (postId: number, commentId: number, reply: string) => void
    userId: number
  }
  
  