"use client"

import { useRef, useEffect, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Compass, ZoomIn, ZoomOut } from "lucide-react"

interface User {
  id: number
  name: string
  avatar: string
  distance: number
}

interface EnhancedRadarProps {
  users: User[]
  radius: number
  onUserClick: (user: User) => void
}

export default function EnhancedRadar({ users, radius, onUserClick }: EnhancedRadarProps) {
  const radarRef = useRef<HTMLDivElement>(null)
  const [ringSize, setRingSize] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const expandInterval = setInterval(() => {
      setRingSize((prev) => (prev >= 100 ? 0 : prev + 1))
    }, 30)

    return () => {
      clearInterval(expandInterval)
    }
  }, [])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const newZoom = Math.max(1, Math.min(5, zoom + e.deltaY * -0.001))
    setZoom(newZoom)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      setPan({ x: pan.x + dx, y: pan.y + dy })
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(5, prev + 0.5))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(1, prev - 0.5))
  }

  const getNodeSize = (distance: number) => {
    const maxSize = 48
    const minSize = 24
    return Math.max(minSize, maxSize - (distance / radius) * (maxSize - minSize))
  }

  return (
    <Card className="col-span-1 shadow-lg bg-gradient-to-br from-black to-indigo-50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-black flex items-center gap-2">
          <Compass className="w-6 h-6" />
          Coryfi Users Nearby
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="relative aspect-square w-full max-w-md mx-auto overflow-hidden"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            ref={radarRef}
            className="absolute rounded-full bg-gradient-to-br from-black to-indigo-100 origin-center"
            style={{
              width: `${100 * zoom}%`,
              height: `${100 * zoom}%`,
              left: `${50 - 50 * zoom + pan.x}%`,
              top: `${50 - 50 * zoom + pan.y}%`,
              transition: 'width 0.3s, height 0.3s, left 0.3s, top 0.3s',
            }}
          >
            {/* Radar circles */}
            {/* <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-3/4 rounded-full border border-black/50"></div>
              <div className="w-1/2 h-1/2 rounded-full border border-black/50"></div>
              <div className="w-1/4 h-1/4 rounded-full border border-black/50"></div>
            </div> */}

            {/* Expanding ring effect */}
            <div
              className="absolute rounded-full border-2 border-black/50"
              style={{
                width: `${ringSize}%`,
                height: `${ringSize}%`,
                left: `${50 - ringSize / 2}%`,
                top: `${50 - ringSize / 2}%`,
                transition: 'all 0.03s linear',
              }}
            ></div>

            {/* Center point */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-full animate-ping"></div>
              <div className="w-3 h-3 bg-black rounded-full absolute"></div>
            </div>

            {/* Radius display */}
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <span className="text-sm font-medium text-black bg-white/80 px-2 py-1 rounded-full shadow-sm">
                Radius: {radius}ft
              </span>
            </div>

            {/* User avatars */}
            {users.map((user) => (
              <Button
                key={user.id}
                className="absolute p-0 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 ease-in-out overflow-hidden transform hover:scale-110 hover:z-10"
                style={{
                  left: `${50 + (Math.cos(user.id) * user.distance * 32) / radius}%`,
                  top: `${50 + (Math.sin(user.id) * user.distance * 32) / radius}%`,
                  width: `${getNodeSize(user.distance)}px`,
                  height: `${getNodeSize(user.distance)}px`,
                }}
                onClick={() => onUserClick(user)}
              >
                <Avatar className="w-full h-full">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full animate-ping bg-black opacity-75"></div>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Zoom controls */}
        <div className="flex justify-center mt-4 gap-2">
          <Button onClick={handleZoomOut} variant="outline" size="icon">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button onClick={handleZoomIn} variant="outline" size="icon">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}