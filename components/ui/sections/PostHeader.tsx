import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
import { Post } from './types'

export const PostHeader = ({ post, onClose=()=>{}}) => (
  <div className="flex justify-between items-center mb-4 ">
    <div className="flex items-center space-x-2">
      <Avatar>
        <AvatarImage src={post.user?.avatar} alt={post.user?.name} />
        <AvatarFallback>{post.user?.name[0]}</AvatarFallback>
      </Avatar>
      <div>
        <h2 className="font-semibold">{post.user?.name}</h2>
        <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
      </div>
    </div>
    <Button
      variant="ghost"
      size="icon"
      className="w-10 h-10"
      onClick={onClose}
    >
      <X className="w-5 h-5" />
    </Button>
  </div>
)

