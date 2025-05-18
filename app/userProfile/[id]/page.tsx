import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserPlus, MessageCircle, ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { fetchPosts, fetchUserData } from '@/app/api/actions/media'
import { check_connection } from "@/app/api/actions/network"
import { getServerSession } from "next-auth/next"
import { ClientWrapper } from './client-wrapper'
import {PostsList} from './posts-list'

// Server Component
async function UserProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession()
  const userId = Number(params.id)
  
  // Parallel data fetching
  const [userData, userPosts] = await Promise.all([
    fetchUserData(userId),
    fetchPosts(userId)
  ])

  let isConnected = false
  if (session?.user?.email && userData.email) {
    isConnected = await check_connection(session.user.email, userData.email)
  }

  if (!userData) {
    return <div className="flex justify-center items-center h-screen dark:text-white dark:bg-black">User not found</div>
  }
 

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Link href="/" className="flex items-center text-black hover:underline mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Network
      </Link>

      <Card className="w-full overflow-hidden dark:bg-black">
        <div className="relative h-48 bg-gradient-to-r from-blue-300 to-black-800">
          {userData.banner && (
            <Image 
              src={userData.banner} 
              alt="Profile banner" 
              fill
              className="object-cover"
              priority
            />
          )}
        </div>
        <CardHeader className="relative pb-0">
          <Avatar className="w-24 h-24 absolute -top-12 ring-4 ring-background">
            <AvatarImage src={userData.userdp} alt={userData.name} />
            <AvatarFallback>{userData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="mt-12 flex justify-between items-end">
            <div>
              <CardTitle className="text-3xl font-bold">{userData.name}</CardTitle>
              {userData.currentPosition && userData.company && (
                <p className="text-xl text-muted-foreground">
                  {userData.currentPosition} at {userData.company}
                </p>
              )}
              <div className="flex items-center text-muted-foreground mt-2">
                {userData.location && (
                  <div className="flex items-center mr-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{userData.location}</span>
                  </div>
                )}
                {userData.connections !== undefined && (
                  <div className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-1" />
                    <span>{userData.connections} connections</span>
                  </div>
                )}
              </div>
            </div>

            <ClientWrapper
              userId={userId}
              userEmail={userData.email}
              isConnected={isConnected}
              userData={userData}
              session={session}
            />
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Posts</h2>
            <Suspense fallback={<div>Loading posts...</div>}>
              <PostsList initialPosts={userPosts.posts} userId={userId} />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserProfilePage