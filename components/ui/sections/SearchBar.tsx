"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  UserPlus,
  MessageCircle,
  ArrowLeft,
  MapPin,
  Heart,
  MessageSquare,
  Share,
  MoreHorizontal,
  Calendar,
  Users,
  Camera,
  Edit3,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import PostModal from "@/components/ui/sections/PostModal"
import { Toaster } from "react-hot-toast"
import { fetchPosts, fetchUserData, fetchUserId } from "@/app/api/actions/media"

export default function ModernProfile() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const [selectedPost, setSelectedPost] = useState(null)
  const [userId, setUserId] = useState(null)
  const [activeTab, setActiveTab] = useState("posts")
  const router = useRouter()

  useEffect(() => {
    const fetchUserPosts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        if (session?.user?.email) {
          const userData = await fetchUserId(session.user.email)
          const id = Number(userData.id)
          setUserId(id)
          const userPosts = await fetchPosts(id)
          const userDetails = await fetchUserData(id)
          setUser(userDetails)
          setPosts(userPosts.posts)
        } else {
          throw new Error("User session not found")
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load user data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserPosts()
  }, [session])

  const handlePostClick = (post) => {
    const enhancedPost = {
      ...post,
      comments: post.comments || [],
    }
    setSelectedPost(enhancedPost)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex justify-center items-center h-screen">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin animation-delay-150"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-red-200 dark:border-red-800">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 text-lg font-medium">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">User not found</p>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    { label: "Posts", value: posts?.length || 0, icon: Edit3 },
    { label: "Connections", value: user?.connections || 0, icon: Users },
    { label: "Joined", value: "Mar 2024", icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Navigation */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Network</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <div className="relative mb-8">
          <Card className="overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
            {/* Banner */}
            <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 overflow-hidden">
              {user.banner && (
                <Image src={user.banner || "/placeholder.svg"} alt="Profile banner" fill className="object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

              {/* Floating Action Buttons */}
              <div className="absolute top-6 right-6 flex gap-3">
                <Button size="sm" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white">
                  <Camera className="h-4 w-4" />
                </Button>
                <Button size="sm" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardContent className="relative px-6 md:px-8 pb-8">
              {/* Avatar */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-20">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                  <div className="relative">
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 ring-6 ring-white dark:ring-slate-800 shadow-2xl">
                      <AvatarImage
                        src={user.userdp || `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`}
                        alt={user.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-800 shadow-lg"></div>
                  </div>

                  <div className="flex-1 mt-4 md:mt-0 md:mb-4">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
                      {user.name}
                    </h1>

                    {user?.userDetails?.content && (
                      <p className="text-xl text-slate-600 dark:text-slate-300 font-medium mb-2">
                        {user?.userDetails?.content}
                      </p>
                    )}

                    {user?.userDetails?.bio && (
                      <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-2xl leading-relaxed">
                        {user?.userDetails?.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400">
                      {user?.userDetails?.city && (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">{user?.userDetails?.city}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 md:mt-0">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 bg-transparent"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <div className="mb-8">
          <div className="flex gap-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-1 rounded-2xl border border-white/20 w-fit">
            {["posts", "about", "media"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 capitalize ${
                  activeTab === tab
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-lg"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {activeTab === "posts" && (
          <div className="space-y-6">
            {posts && posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                  <Card
                    key={index}
                    className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:scale-[1.02] transform"
                    onClick={() => handlePostClick(post)}
                  >
                    <CardContent className="p-0">
                      {post?.imageUrl && post.imageUrl.length > 0 && (
                        <div className="relative overflow-hidden">
                          <img
                            src={post.imageUrl[0] || "/placeholder.svg"}
                            alt="Post image"
                            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          {/* Overlay Actions */}
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white"
                              >
                                <Heart className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white"
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="p-6">
                        {post?.content && (
                          <div
                            className="text-slate-700 dark:text-slate-300 prose prose-sm max-w-none mb-4 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                          />
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              <span className="font-medium">{post.likes.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span className="font-medium">{post.comments?.length || 0}</span>
                            </div>
                          </div>
                          <div className="text-slate-400 text-xs">2 days ago</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center">
                  <Edit3 className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No posts yet</h3>
                <p className="text-slate-500 dark:text-slate-400">Share your first post to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">About</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Bio</h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {user?.userDetails?.bio || "No bio available."}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Location</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    {user?.userDetails?.city || "Location not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Media Tab */}
        {activeTab === "media" && (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Media</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {posts
                  .filter((post) => post.imageUrl && post.imageUrl.length > 0)
                  .map((post, index) => (
                    <div key={index} className="aspect-square rounded-xl overflow-hidden group cursor-pointer">
                      <img
                        src={post.imageUrl[0] || "/placeholder.svg"}
                        alt="Media"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
