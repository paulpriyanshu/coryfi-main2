'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import PostModal from '@/components/ui/sections/PostModal'

export function PostsList({ initialPosts, userId }) {
  const [selectedPost, setSelectedPost] = useState(null)

  const handlePostClick = (post) => {
    const enhancedPost = {
      ...post,
      comments: post.comments || [],
    }
    setSelectedPost(enhancedPost)
  }

  if (!initialPosts || initialPosts.length === 0) {
    return <p>No posts available.</p>
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialPosts.map((post, index) => (
          <Card key={index} className="overflow-hidden cursor-pointer" onClick={() => handlePostClick(post)}>
            <CardContent className="p-4">
              {post?.imageUrl && post.imageUrl.length > 0 && (
                <div className="mb-4">
                  <img
                    src={post.imageUrl[0]} 
                    alt="Post image" 
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>  
              )}
              {post?.content && (
                <div 
                  className="mt-2 px-4 text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              )}
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div>
                  <span className="mr-4">{post.likes.length} likes</span>
                  <span>{post.comments?.length || 0} comments</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPost && (
        <PostModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
          userId={userId}
        />
      )}
    </>
  )
}