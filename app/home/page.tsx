"use client"
import { Mail, MessageSquare, Calendar, Play, List } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from 'next-auth/react'
import MailSection from '@/components/ui/sections/MailSection'
import DMSection from '@/components/ui/sections/DMSections'
import MeetingSection from '@/components/ui/sections/MeetingSection'
import VideoPlayer from '@/components/ui/sections/VideoPlayer'
import ThreadList from '@/components/ui/sections/ThreadList'
import YourList from '@/components/ui/sections/YourList'

export default function Page() {
  const { data: session, status } = useSession()

  // Show a loading state while checking session status
  if (status === 'loading') {
    return <div>Loading...</div>
  }

  // If there is no session, display the login message
  if (!session) {
    return <div>Please login</div>
  }

  // If a session exists, render the dashboard
  return (
    <div className="p-8 bg-gray-100 h-full">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-4 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2" />
              Mails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MailSection />
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2" />
              DMs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DMSection />
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2" />
              Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MeetingSection />
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="mr-2" />
              Video Player
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VideoPlayer />
          </CardContent>
        </Card>
        
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Threads</CardTitle>
          </CardHeader>
          <CardContent>
            <ThreadList />
          </CardContent>
        </Card>
        
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <List className="mr-2" />
              Your List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <YourList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}