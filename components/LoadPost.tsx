import { fetchImages } from "@/app/api/actions/media"
import { useEffect, useState } from "react"

export default function LoadPosts() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetchImages().then(setPosts)
  }, [])

  if (posts.length === 0) {
    return null // or you could return a "No posts available" message here
  }

  return posts
}

