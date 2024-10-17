'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Bell, Search, Menu, X, Calendar, MapPin, Users, Play, Pause } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Event = {
  id: number
  title: string
  description: string
  image: string
  detailImage: string
  date: string
  location: string
  attendees: number
  size: 'small' | 'medium' | 'large'
  orientation: 'portrait' | 'landscape' | 'square'
  isLive: boolean
  videoPreview?: string
}

type User = {
  id: number
  name: string
  avatar: string
  isLive: boolean
}

const events: Event[] = [
  { id: 1, title: "Summer Music Festival", description: "Experience the rhythm of summer at our annual outdoor music extravaganza. Featuring an eclectic mix of genres and artists from around the globe, this festival promises unforgettable performances under the open sky. From indie rock to electronic dance, there's something for every music lover. Join us for three days of non-stop music, food, and fun!", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBmZXN0aXZhbHxlbnwwfHwwfHx8MA%3D%3D", detailImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBjb25jZXJ0fGVufDB8fDB8fHww", date: "2024-07-15", location: "Sunset Park", attendees: 5000, size: 'large', orientation: 'landscape', isLive: true, videoPreview: "https://static.videezy.com/system/resources/previews/000/005/529/original/Rocking_Out.mp4" },
  { id: 2, title: "Tech Conference 2024", description: "Dive into the future of technology at Tech Conference 2024. This year's focus is on AI, blockchain, and quantum computing. Join industry leaders, innovators, and tech enthusiasts for insightful talks, hands-on workshops, and networking opportunities that will shape the digital landscape. Don't miss out on the latest tech trends and groundbreaking innovations!", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVjaCUyMGNvbmZlcmVuY2V8ZW58MHx8MHx8fDA%3D", detailImage: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGVjaCUyMGNvbmZlcmVuY2V8ZW58MHx8MHx8fDA%3D", date: "2024-09-22", location: "Tech Hub Convention Center", attendees: 2000, size: 'medium', orientation: 'landscape', isLive: false },
  { id: 3, title: "Art Exhibition", description: "Immerse yourself in a world of creativity at our Contemporary Art Exhibition. Showcasing works from both established and emerging artists, this exhibition pushes the boundaries of traditional art forms. Experience thought-provoking installations, vibrant paintings, and innovative sculptures that challenge perceptions and inspire imagination.", image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXJ0JTIwZXhoaWJpdGlvbnxlbnwwfHwwfHx8MA%3D%3D", detailImage: "https://images.unsplash.com/photo-1531685250784-7569952593d2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXJ0JTIwZXhoaWJpdGlvbnxlbnwwfHwwfHx8MA%3D%3D", date: "2024-05-10", location: "Metropolitan Gallery", attendees: 500, size: 'small', orientation: 'square', isLive: true, videoPreview: "https://static.videezy.com/system/resources/previews/000/042/502/original/stockvideo_02636.mp4" },
  { id: 4, title: "Food & Wine Tasting", description: "Embark on a culinary journey at our exclusive Food & Wine Tasting event. Savor exquisite cuisines expertly paired with fine wines from renowned vineyards across the globe. Our expert sommeliers and chefs will guide you through a gastronomic experience that delights the senses and expands your palate. Discover new flavors and culinary traditions!", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZCUyMGFuZCUyMHdpbmV8ZW58MHx8MHx8fDA%3D", detailImage: "https://images.unsplash.com/photo-1515779122185-2390ccdf060b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Zm9vZCUyMGFuZCUyMHdpbmV8ZW58MHx8MHx8fDA%3D", date: "2024-06-30", location: "Gourmet Plaza", attendees: 300, size: 'medium', orientation: 'portrait', isLive: false },
  { id: 5, title: "City Marathon", description: "Lace up your running shoes for the annual City Marathon! Whether you're a seasoned runner or a first-timer, this event offers a chance to challenge yourself and experience the city from a unique perspective. The route takes you through iconic landmarks and cheering crowds, culminating in a triumphant finish line celebration. Join thousands of runners in this test of endurance and community spirit!", image: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFyYXRob258ZW58MHx8MHx8fDA%3D", detailImage: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFyYXRob258ZW58MHx8MHx8fDA%3D", date: "2024-04-05", location: "City Center", attendees: 10000, size: 'large', orientation: 'landscape', isLive: true, videoPreview: "https://static.videezy.com/system/resources/previews/000/038/604/original/Street_Marathon.mp4" },
  { id: 6, title: "Book Fair", description: "Calling all bookworms and literature enthusiasts! Our annual Book Fair is back, bigger and better than ever. Browse through thousands of titles, attend author meet-and-greets, and participate in engaging panel discussions. From fiction to non-fiction, children's books to academic texts, there's a world of words waiting to be discovered. Don't miss this celebration of literature and learning!", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym9vayUyMGZhaXJ8ZW58MHx8MHx8fDA%3D", detailImage: "https://images.unsplash.com/photo-1526243741027-444d633d7365?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym9va3N8ZW58MHx8MHx8fDA%3D", date: "2024-08-18", location: "Central Library", attendees: 1500, size: 'small', orientation: 'square', isLive: false },
  { id: 7, title: "Fashion Week", description: "Experience the glamour and innovation of the fashion world at our annual Fashion Week. Witness cutting-edge designs from both established and emerging designers on the runway. From haute couture to ready-to-wear collections, this event showcases the latest trends and pushes the boundaries of style. Join fashion enthusiasts, industry professionals, and celebrities for a week of unforgettable shows and events.", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFzaGlvbiUyMHNob3d8ZW58MHx8MHx8fDA%3D", detailImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGZhc2hpb24lMjBzaG93fGVufDB8fDB8fHww", date: "2024-10-01", location: "Fashion Avenue", attendees: 3000, size: 'medium', orientation: 'portrait', isLive: true, videoPreview: "https://static.videezy.com/system/resources/previews/000/042/547/original/stockvideo_02681.mp4" },
  { id: 8, title: "Science Fair", description: "Explore the wonders of science at our interactive Science Fair. From robotics to environmental studies, witness groundbreaking projects and experiments from young scientists. Engage with hands-on demonstrations, attend enlightening lectures, and be inspired by the next generation of innovators. This event is perfect for curious minds of all ages!", image: "https://images.unsplash.com/photo-1576319155264-99536e0be1ee?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2NpZW5jZSUyMGZhaXJ8ZW58MHx8MHx8fDA%3D", detailImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2NpZW5jZSUyMGZhaXJ8ZW58MHx8MHx8fDA%3D", date: "2024-11-15", location: "Science Center", attendees: 2500, size: 'small', orientation: 'landscape', isLive: false },
  { id: 9, title: "Film Festival", description: "Celebrate the art of cinema at our International Film Festival. Featuring a diverse selection of films from around the world, including premieres, retrospectives, and Q&A sessions with filmmakers. Immerse yourself in compelling narratives, groundbreaking documentaries, and innovative short films. This festival is a must-attend event for film enthusiasts and industry professionals alike.", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmlsbSUyMGZlc3RpdmFsfGVufDB8fDB8fHww", detailImage: "https://images.unsplash.com/photo-1485095329183-d0797cdc5676?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZmlsbSUyMGZlc3RpdmFsfGVufDB8fDB8fHww", date:  "2024-12-05", location: "Grand Cinema", attendees: 5000, size: 'large', orientation: 'portrait',   isLive: true, videoPreview:  "https://static.videezy.com/system/resources/previews/000/042/622/original/stockvideo_02756.mp4" },
]

const users: User[] = [
  { id: 1, name: "Alice Johnson", avatar: "/placeholder.svg?height=32&width=32", isLive: true },
  { id: 2, name: "Bob Smith", avatar: "/placeholder.svg?height=32&width=32", isLive: true },
  { id: 3, name: "Charlie Brown", avatar: "/placeholder.svg?height=32&width=32", isLive: false },
  { id: 4, name: "Diana Prince", avatar: "/placeholder.svg?height=32&width=32", isLive: true },
  { id: 5, name: "Ethan Hunt", avatar: "/placeholder.svg?height=32&width=32", isLive: false },
]

export default function Component() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isPlaying, setIsPlaying] = useState<{ [key: number]: boolean }>({})
  const [recentlyViewed, setRecentlyViewed] = useState<Event[]>([])
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement }>({})

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCardSize = (size: Event['size'], orientation: Event['orientation']) => {
    const baseClasses = "overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105"
    switch (size) {
      case 'small':
        return `${baseClasses} col-span-1 row-span-1`
      case 'medium':
        return orientation === 'portrait' 
          ? `${baseClasses} col-span-1 row-span-2`
          : `${baseClasses} col-span-2 row-span-1`
      case 'large':
        return orientation === 'portrait'
          ? `${baseClasses} col-span-2 row-span-3`
          : `${baseClasses} col-span-3 row-span-2`
      default:
        return baseClasses
    }
  }

  const handleMouseEnter = (eventId: number) => {
    if (videoRefs.current[eventId]) {
      videoRefs.current[eventId].play().catch(error => console.error("Error playing video:", error))
      setIsPlaying(prev => ({ ...prev, [eventId]: true }))
    }
  }

  const handleMouseLeave = (eventId: number) => {
    if (videoRefs.current[eventId]) {
      videoRefs.current[eventId].pause()
      videoRefs.current[eventId].currentTime = 0
      setIsPlaying(prev => ({ ...prev, [eventId]: false }))
    }
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setRecentlyViewed(prev => {
      const newRecentlyViewed = [event, ...prev.filter(e => e.id !== event.id)].slice(0, 5)
      return newRecentlyViewed
    })
  }

  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* Left Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-white p-4 hidden lg:block"
      >
        <h2 className="text-lg font-semibold mb-4">Recently Viewed</h2>
        <div className="space-y-2">
          {recentlyViewed.map(event => (
            <div key={event.id} className="flex items-center space-x-2 cursor-pointer" onClick={() => handleEventClick(event)}>
              <img src={event.image} alt={event.title} className="w-10 h-10 object-cover rounded-xl" />
              <div>
                <p className="font-medium text-sm">{event.title}</p>
                <p className="text-xs text-gray-500">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-4">
        

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-[120px]">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              layoutId={`card-${event.id}`}
              className={getCardSize(event.size, event.orientation)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="h-full cursor-pointer group rounded-xl overflow-hidden"
                onClick={() => handleEventClick(event)}
                onMouseEnter={() => handleMouseEnter(event.id)}
                onMouseLeave={() => handleMouseLeave(event.id)}
              >
                <CardContent className="p-0 h-full relative overflow-hidden">
                  {event.isLive && event.videoPreview ? (
                    <video
                      ref={el => { if (el) videoRefs.current[event.id] = el }}
                      src={event.videoPreview}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <h3 className="text-white font-semibold text-lg mb-1">{event.title}</h3>
                    <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">{event.date}</p>
                  </div>
                  {event.isLive && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      LIVE
                    </div>
                  )}
                  {event.isLive && event.videoPreview && (
                    <div className="absolute top-2 right-2 text-white">
                      {isPlaying[event.id] ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Right Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-white p-4 hidden lg:block"
      >
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <h2 className="text-lg font-semibold mb-4">Live Connections</h2>
        <div className="space-y-2 mb-6">
          {users.filter(user => user.isLive).map(user => (
            <div key={user.id} className="flex items-center space-x-2">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          ))}
        </div>
        <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
        <div className="space-y-2">
          {events.slice(0, 3).map(event => (
            <div key={event.id} className="flex items-center space-x-2 cursor-pointer" onClick={() => handleEventClick(event)}>
              <img src={event.image} alt={event.title} className="w-10 h-10 object-cover rounded-xl" />
              <div>
                <p className="font-medium text-sm">{event.title}</p>
                <p className="text-xs text-gray-500">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.aside>

      <AnimatePresence>
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden rounded-xl">
              <motion.div
                layoutId={`card-${selectedEvent.id}`}
                className="h-full flex flex-col bg-white rounded-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative h-1/3 overflow-hidden">
                  <img 
                    src={selectedEvent.detailImage} 
                    alt={selectedEvent.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-2 text-white hover:bg-black/20" 
                    onClick={() => setSelectedEvent(null)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <ScrollArea className="flex-grow p-6">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-purple-600 mb-2">{selectedEvent.title}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {selectedEvent.date}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {selectedEvent.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {selectedEvent.attendees} attendees
                    </div>
                  </div>
                  <DialogDescription className="text-base leading-relaxed mb-6">
                    {selectedEvent.description}
                  </DialogDescription>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    {selectedEvent.isLive ? "Join Live Event" : "Register for Event"}
                  </Button>
                </ScrollArea>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}