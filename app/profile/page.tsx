'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserPlus, MessageCircle, ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PostModal from '@/components/ui/sections/PostModal'
import toast, { Toaster } from 'react-hot-toast'
import { fetchPosts, fetchUserData, fetchUserId } from '@/app/api/actions/media'

export default function Page() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const [selectedPost, setSelectedPost] = useState(null)
  const [userId, setUserId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (session?.user?.email) {
          const userData = await fetchUserId(session.user.email);

          const id = Number(userData.id);
          setUserId(id)
          const userPosts = await fetchPosts(id);
          // console.log("userPosts", userPosts)
          const userDetails = await fetchUserData(id);
          setUser(userDetails);
          // console.log("uyseDEtials",userDetails)
          setPosts(userPosts.posts);
        } else {
          throw new Error("User session not found");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPosts();
  }, [session]);
 

  const handlePostClick = (post) => {
    const enhancedPost = {
      ...post,
      comments: post.comments || [],
    }
    setSelectedPost(enhancedPost)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">User not found</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Toaster position="top-center" reverseOrder={false} />
      <Link href="/" className="flex items-center text-black hover:underline mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Network
      </Link>

      <Card className="w-full overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-blue-300 to-blue-800">
          {user.banner && (
            <Image src={user.banner} alt="Profile banner" layout="fill" objectFit="cover" />
          )}
        </div>
        <CardHeader className="relative pb-0">
          <Avatar className="w-24 h-24 absolute -top-12 ring-4 ring-background">
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} alt={user.name} />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="mt-12 flex justify-between items-end">
            <div>
              <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
              {user?.userDetails?.content && (
                <p className="text-xl text-muted-foreground">
                  {user?.userDetails?.content}
                </p>
              )}
              {user?.userDetails?.bio && (
                <p className="text-sm text-muted-foreground mt-2">
                  {user?.userDetails?.bio}
                </p>
              )}
              <div className="flex items-center text-muted-foreground mt-2">
                {user?.userDetails?.city && (
                  <div className="flex items-center mr-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{user?.userDetails?.city}</span>
                  </div>
                )}
                {user?.connections !== undefined && (
                  <div className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-1" />
                    <span>{user?.connections} connections</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
            
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Posts</h2>
            {posts && posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post, index) => (
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
                      {post?.content && <p className="mb-4 line-clamp-3">{post.content}</p>}
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
            ) : (
              <p>No posts available.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedPost && (
        <PostModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
          userId={Number(userId)}
        />
      )}
    </div>
  )
}

