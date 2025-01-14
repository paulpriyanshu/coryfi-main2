"use client"

import React, { useState, useEffect} from 'react'
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Users } from "lucide-react"
import Radar from '@/components/ui/Radar'

interface User {
  id: number
  name: string
  distance: number
  avatar: string
  bio: string
  network: number
  interests: string[]
}

// Enhanced mock data for nearby users with sample images and additional information
const mockUsers: User[] = [
  { id: 1, name: "Alice", distance: 5, avatar: "https://i.pravatar.cc/150?img=1", bio: "Tech enthusiast and coffee lover", network: 120, interests: ["AI", "Web Dev", "Hiking"] },
  { id: 2, name: "Bob", distance: 8, avatar: "https://i.pravatar.cc/150?img=2", bio: "Startup founder, always looking for new ideas", network: 250, interests: ["Entrepreneurship", "IoT", "Yoga"] },
  { id: 3, name: "Charlie", distance: 12, avatar: "https://i.pravatar.cc/150?img=3", bio: "Data scientist by day, gamer by night", network: 80, interests: ["Machine Learning", "Gaming", "Cooking"] },
  { id: 4, name: "David", distance: 15, avatar: "https://i.pravatar.cc/150?img=4", bio: "UX designer with a passion for accessibility", network: 180, interests: ["UX/UI", "Accessibility", "Photography"] },
  { id: 5, name: "Eve", distance: 18, avatar: "https://i.pravatar.cc/150?img=5", bio: "Blockchain developer and crypto enthusiast", network: 150, interests: ["Blockchain", "Crypto", "Traveling"] },
  { id: 6, name: "Frank", distance: 22, avatar: "https://i.pravatar.cc/150?img=6", bio: "Full-stack developer and open-source contributor", network: 200, interests: ["Open Source", "JavaScript", "Cycling"] },
  { id: 7, name: "Grace", distance: 7, avatar: "https://i.pravatar.cc/150?img=7", bio: "AI researcher focusing on natural language processing", network: 100, interests: ["NLP", "Deep Learning", "Languages"] },
  { id: 8, name: "Henry", distance: 10, avatar: "https://i.pravatar.cc/150?img=8", bio: "DevOps engineer and cloud computing expert", network: 130, interests: ["Cloud", "DevOps", "Surfing"] },
  { id: 9, name: "Ivy", distance: 13, avatar: "https://i.pravatar.cc/150?img=9", bio: "Mobile app developer and UI/UX enthusiast", network: 90, interests: ["Mobile Dev", "UI/UX", "Fitness"] },
  { id: 10, name: "Jack", distance: 16, avatar: "https://i.pravatar.cc/150?img=10", bio: "Cybersecurity specialist and ethical hacker", network: 170, interests: ["Cybersecurity", "Ethical Hacking", "Chess"] },
]

export default function NearbyUsersPage() {
  const [radius, setRadius] = useState(5)
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  // const radarRef = useRef<HTMLDivElement>(null)
  // const [radarSize, setRadarSize] = useState(0)

  useEffect(() => {
    const filteredUsers = mockUsers.filter(user => user.distance <= radius)
    setUsers(filteredUsers)
  }, [radius])

  useEffect(() => {
    const updateRadarSize = () => {
      // if (radarRef.current) {
      //   // const width = radarRef.current.offsetWidth
      //   // setRadarSize(width)
      // }
    }

    updateRadarSize()
    window.addEventListener('resize', updateRadarSize)
    return () => window.removeEventListener('resize', updateRadarSize)
  }, [])

  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0])
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // const getNodeSize = (distance: number) => {
  //   const baseSize = radarSize / 8
  //   const userCount = users.length
  //   const scaleFactor = 1 - (distance / radius) * 0.3
  //   const countAdjustment = Math.max(1 - userCount / 30, 0.6)
  //   return Math.max(baseSize * scaleFactor * countAdjustment, radarSize / 16)
  // }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">Nearby Coryfi Users</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Selected User Preview */}
        <Card className="col-span-1 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-black">Selected User</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-4 ring-4 ring-black">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{selectedUser.name}</h2>
                <p className="text-gray-600 mb-2">Distance: {selectedUser.distance}m</p>
                <p className="text-sm text-gray-500 text-center mb-4">{selectedUser.bio}</p>
                <div className="flex items-center mb-4">
                  <Users className="w-4 h-4 mr-2 text-black" />
                  <span className="text-sm text-gray-600">Network: {selectedUser.network}</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {selectedUser.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary">{interest}</Badge>
                  ))}
                </div>
                <Button className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>
            ) : (
              <p className="text-center text-gray-500">No user selected</p>
            )}
          </CardContent>
        </Card>

        {/* Center - Radar */}
        <Radar users={users} radius={radius} onUserClick={()=>handleUserClick}/>

        {/* Right Sidebar - Search and User List */}
        <Card className="col-span-1 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-black">Users in Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="radius-slider" className="block text-sm font-medium text-gray-700 mb-2">
                Radius: {radius}ft
              </label>
              <Slider
                id="radius-slider"
                min={1}
                max={50}
                step={1}
                value={[radius]}
                onValueChange={handleRadiusChange}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1ft</span>
                <span>25ft</span>
                <span>50ft</span>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <Button
                  key={user.id}
                  variant="outline"
                  className="w-full justify-start hover:bg-slate-500 transition-colors duration-200"
                  onClick={() => handleUserClick(user)}
                >
                  <Avatar className="w-8 h-8 mr-2">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow text-left">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500 truncate">{user.bio}</div>
                  </div>
                  <span className="text-sm text-gray-500">{user.distance}m</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}