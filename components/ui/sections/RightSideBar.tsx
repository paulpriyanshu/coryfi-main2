'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MoonIcon, Settings, LogOut, Menu } from "lucide-react"
import Image from "next/image"
import { signOut } from 'next-auth/react'

export default function RightSideBar() {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement | null>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4  z-40"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <div ref={sidebarRef} className={`fixed top-0 right-0 w-64 h-screen bg-background border-l transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">User Name</h2>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-grow h-[calc(100vh-180px)]">
          <div className="p-4">
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Recently Viewed</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-md overflow-hidden">
                  <Image src="/placeholder.svg?height=40&width=40" alt="Post 1" layout="fill" objectFit="cover" />
                </div>
                <span className="text-sm">Post Title 1</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-md overflow-hidden">
                  <Image src="/placeholder.svg?height=40&width=40" alt="Post 2" layout="fill" objectFit="cover" />
                </div>
                <span className="text-sm">Post Title 2</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-md overflow-hidden">
                  <Image src="/placeholder.svg?height=40&width=40" alt="Page" layout="fill" objectFit="cover" />
                </div>
                <span className="text-sm">Page Title</span>
              </li>
              <li className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-sm">Account Name</span>
              </li>
            </ul>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t absolute bottom-0 w-full bg-background">
          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <MoonIcon className="mr-2 h-4 w-4" />
              Mode
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100">
              <LogOut className="mr-2 h-4 w-4" onClick={()=>signOut()}/>
              Logout
            </Button>
          </nav>
        </div>
      </div>
    </>
  )
}