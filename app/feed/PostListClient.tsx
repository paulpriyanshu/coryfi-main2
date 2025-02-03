// "use client"

// import { useState } from "react"
// import PostList from "@/components/PostList"

// export default function PostListClient({ initialPosts, session, userId }) {
//   const [newPost, setNewPost] = useState(null)

//   const handleNewPost = (post) => {
//     setNewPost(post) // Update state to reflect the new post instantly
//   }

//   return (
//     <PostList newPost={newPost} initialPosts={initialPosts} session={session} userId={userId} onNewPost={handleNewPost} />
//   )
// }