import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Sample data
const samplePosts = [
  {
    id: 1,
    name: "User One",
    postedTime: "3h ago",
    content: "This is a sample post content for post 1. It can contain text, images, or other media.",
  },
  {
    id: 2,
    name: "User Two",
    postedTime: "1h ago",
    content: "This is a sample post content for post 2. It can contain text, images, or other media.",
  },
  {
    id: 3,
    name: "User Three",
    postedTime: "30m ago",
    content: "This is a sample post content for post 3. It can contain text, images, or other media.",
  },
  {
    id: 4,
    name: "User Three",
    postedTime: "30m ago",
    content: "This is a sample post content for post 4. It can contain text, images, or other media.",
  },
  {
    id: 5,
    name: "User Three",
    postedTime: "30m ago",
    content: "This is a sample post content for post 3. It can contain text, images, or other media.",
  },
  // Add more sample posts as needed
]

export default function PostsList() {
  return (

      <Card className="flex flex-col h-3/5 w-full overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle>Posts</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {samplePosts.map(post => (
              <li key={post.id} className="p-4">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {post.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="sr-only">Posted</span> {post.postedTime}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 break-words">
                      {post.content}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

  )
}
