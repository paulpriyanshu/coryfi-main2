import { Toaster } from "react-hot-toast"
import PostCreator from "@/components/PostCreator"
import PostList from "@/components/PostList"
import ScrollToTopButton from "@/components/ScrollToTopButton"
import { revalidatePath } from "next/cache"
// import PostListClient from "./PostListClient"

export default function EnhancedInfiniteScrollNetwork({ initialPosts, session, userId }) {
  
  // Function to handle new post creation
  // const handleNewPost = async () => {
  //   // Here, trigger any server-side updates like saving the post to a database
  //   // Revalidate the path to ensure the latest posts are fetched again
  //   revalidatePath("/feed") // Adjust this based on your actual route for posts
  // }

  return (
    <>
      <Toaster position="top-center" />
      <div className="hidden md:block">
      <PostCreator  userId={userId.id} />


      </div>

      <PostList initialPosts={initialPosts} session={session} userId={userId} />

      <ScrollToTopButton />
    </>
  )
}