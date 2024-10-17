"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Mail, MessageSquare, Award, User, Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface DM {
  id: number;
  name: string;
  message: string;
}

interface Mail {
  id: number;
  subject: string;
  sender: string;
}

interface Reach {
  id: number;
  name: string;
}

interface Video {
  id: number;
  title: string;
  author: string;
  likes: number;
  comments: number;
  views: string;
  src: string;
}

interface Recognition {
  id: number;
  name: string;
  date: string;
}

interface CardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

interface VideoPlayerProps {
  video: Video;
}

export default function Page() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      <div className="flex overflow-hidden">
        <div className="max-w-full w-full mx-auto flex">
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6 ">
              <Card title="DMs" icon={<MessageSquare />}>
                <DMList />
              </Card>
              <Card title="Mails" icon={<Mail />}>
                <MailList />
              </Card>
              <Card title="New Reaches" icon={<User />}>
                <ReachesList />
              </Card>
            </div>
          </div>

          <div className='w-full  m-5 overflow-auto flex justify-center'>
            <div className="w-full p-6 overflow-y-auto">
              <div className="space-y-6">
                <Card title="Videos">
                  <VideoFeed />
                </Card>
              </div>
            </div>
          </div>

          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              <Card title="Your Recognition" icon={<Award />}>
                <RecognitionList />
              </Card>
              <Card title="Profile">
                <Profile />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Card({ title, icon, children }: CardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h3>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

function DMList() {
  const dms: DM[] = [
    { id: 1, name: 'John Doe', message: 'Hey, how are you?' },
    { id: 2, name: 'Jane Smith', message: 'Can we meet tomorrow?' },
  ]
  return (
    <ul className="divide-y divide-gray-200">
      {dms.map((dm) => (
        <li key={dm.id} className="py-4">
          <div className="flex space-x-3">
            <img className="h-6 w-6 rounded-full" src="/placeholder.svg?height=24&width=24" alt="" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{dm.name}</h3>
              </div>
              <p className="text-sm text-gray-500">{dm.message}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function MailList() {
  const mails: Mail[] = [
    { id: 1, subject: 'New project proposal', sender: 'Alice Johnson' },
    { id: 2, subject: 'Meeting minutes', sender: 'Bob Williams' },
  ]
  return (
    <ul className="divide-y divide-gray-200">
      {mails.map((mail) => (
        <li key={mail.id} className="py-4">
          <div className="flex space-x-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{mail.subject}</h3>
              </div>
              <p className="text-sm text-gray-500">{mail.sender}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function ReachesList() {
  const reaches: Reach[] = [
    { id: 1, name: 'Emma Thompson' },
    { id: 2, name: 'Michael Brown' },
    { id: 3, name: 'Garvit Singh' },
    { id: 4, name:'Parth Sharma' }
  ]
  return (
    <ul className="divide-y divide-gray-200">
      {reaches.map((reach) => (
        <li key={reach.id} className="py-4">
          <div className="flex items-center space-x-3">
            <img className="h-6 w-6 rounded-full" src="/placeholder.svg?height=24&width=24" alt="" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{reach.name}</p>
            </div>
            <button className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Connect
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function VideoFeed() {
  const [videos, setVideos] = useState<Video[]>([
    { id: 1, title: 'Amazing Sunset', author: 'NatureLover', likes: 1200, comments: 89, views: '10K', src: 'https://example.com/video1.mp4' },
    { id: 2, title: 'Cooking Italian Pasta', author: 'ChefMaster', likes: 3500, comments: 156, views: '50K', src: 'https://example.com/video2.mp4' },
    { id: 3, title: 'Cute Puppies Playing', author: 'PetLover', likes: 8900, comments: 412, views: '100K', src: 'https://example.com/video3.mp4' },
  ])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const loader = useRef<HTMLDivElement>(null)

  const handleObserver = (entities: IntersectionObserverEntry[]) => {
    const target = entities[0]
    if (target.isIntersecting) {
      setPage((prev) => prev + 1)
    }
  }

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0
    }
    const observer = new IntersectionObserver(handleObserver, option)
    if (loader.current) observer.observe(loader.current)
  }, [])

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true)
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newVideos: Video[] = [
        { id: videos.length + 1, title: 'New Video ' + (videos.length + 1), author: 'User' + (videos.length + 1), likes: Math.floor(Math.random() * 1000), comments: Math.floor(Math.random() * 100), views: Math.floor(Math.random() * 100) + 'K', src: 'https://example.com/video' + (videos.length + 1) + '.mp4' },
        { id: videos.length + 2, title: 'New Video ' + (videos.length + 2), author: 'User' + (videos.length + 2), likes: Math.floor(Math.random() * 1000), comments: Math.floor(Math.random() * 100), views: Math.floor(Math.random() * 100) + 'K', src: 'https://example.com/video' + (videos.length + 2) + '.mp4' },
      ]
      setVideos(prev => [...prev, ...newVideos])
      setLoading(false)
    }
    fetchVideos()
  }, [page])

  return (
    <div className="space-y-6">
      {videos.map((video) => (
        <VideoPlayer key={video.id} video={video} />
      ))}
      {loading && <p className="text-center">Loading more videos...</p>}
      <div ref={loader} />
    </div>
  )
}

function VideoPlayer({ video }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current?.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full"
          src={video.src}
          poster="/placeholder.svg?height=400&width=600"
          loop
          muted={isMuted}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            className="bg-black bg-opacity-50 text-white rounded-full p-4 hover:bg-opacity-75 transition-opacity"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
        </div>
        <button
          className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-opacity"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">{video.title}</h3>
        <p className="text-sm text-gray-500">{video.author}</p>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <span>{video.views} views</span>
          <span className="mx-2">•</span>
          <span>{video.likes} likes</span>
          <span className="mx-2">•</span>
          <span>{video.comments} comments</span>
        </div>
      </div>
    </div>
  )
}

function RecognitionList() {
  const recognitions: Recognition[] = [
    { id: 1, name: 'Raaj Shekhar', date: '2023-06-15' },
    { id: 2, name: 'Garvit Singh', date: '2023-05-01' },
  ]
  return (
    <ul className="divide-y divide-gray-200">
      {recognitions.map((recognition) => (
        <li key={recognition.id} className="py-4">
          <div className="flex space-x-3">
            <img className=" rounded-full h-10 w-10 text-yellow-400" alt='profile' />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{recognition.name}</h3>
              </div>
              <p className="text-sm text-gray-500">{recognition.date}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Profile() {
  return (
    <div className="flex items-center space-x-4">
      <img className="h-12 w-12 rounded-full" src="/placeholder.svg?height=48&width=48" alt="Profile" />
      <div>
        <h3 className="text-lg font-medium">Jane Doe</h3>
        <p className="text-sm text-gray-500">Software Engineer</p>
      </div>
    </div>
  )
}