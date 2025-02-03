"use server"

import { revalidatePath } from "next/cache"
import { dislikePost, likePost, onLikePost, uploadPost } from "../api/actions/media"
import toast from "react-hot-toast"


export async function createPost(data: {
  userId: string
  name: string
  content: string
  imageUrl: string[]
}) {
  try {
    const newPost = await uploadPost(data.userId, data.name, data.content, data.imageUrl)

    // Revalidate the home page to show the new post
    revalidatePath("/")

    return { success: true, post: newPost }
  } catch (error) {
    console.error("Error creating post:", error)
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" }
  }
}

export const handleLike = async (postId, post, session) => {
    try {
      if (!session?.user?.email) {
        toast.error("Please log in to like posts", {
          duration: 2000,
          style: { background: "#EF4444", color: "#fff" },
        });
        return;
      }
  
      console.log("postsasd", post, session.user.email);
  
      const isLiked = post.likes?.includes(session.user.email); // Calling the check directly
  
      if (isLiked) {
        await dislikePost(post.id, session.user.email);
        // toast.success("Post disliked", { duration: 2000, style: { background: "#EF4444", color: "#fff" } })
      } else {
        console.log("this is ", post.id, session.user.email);
        await likePost(post.id, session.user.email);
        // toast.success("Post liked", { duration: 2000, style: { background: "#4CAF50", color: "#fff" } })
      }
  
      await onLikePost(session?.user?.name, post.id);
    } catch (error) {
      console.error("Error toggling like on post:", error);
      // toast.error("Failed to update like status", { duration: 2000, style: { background: "#EF4444", color: "#fff" } })
    }
  };

export  async function createPostAndRevalidate(userId, userName, content, imageUrls) {

  
    try {
      // Create the post
      const newPost = await uploadPost(userId, userName, content, imageUrls)
  
      // Trigger revalidation after post creation to fetch the updated list of posts
      revalidatePath("/feed")  // Adjust this path based on your actual route
  
      return newPost
    } catch (error) {
      console.error("Error creating post and revalidating:", error)
      throw new Error("Failed to create post and revalidate.")
    }
  }
