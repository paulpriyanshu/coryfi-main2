import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
// import { Post } from '../types'


export default function PostHeader({ post, onClose }) {
  return (
    <div className="h-full px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={post.user?.avatar} alt={post.user?.name} />
          <AvatarFallback>{post.user?.name[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="font-semibold truncate">{post.user?.name}</h2>
          <p className="text-sm text-gray-500 truncate">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 w-10 h-10"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  )
}

