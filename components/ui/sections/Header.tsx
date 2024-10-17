"use client"

import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Home, Compass, Bell, User, Zap, Users, Menu } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItemProps {
  icon: React.ReactNode
  href: string
  isActive: boolean
  tooltip: string
}

const NavItem: React.FC<NavItemProps> = ({ icon, href, isActive, tooltip }) => {
  return (
    <Link
      href={href}
      className={`relative inline-flex items-center justify-center w-12 h-12 rounded-full ${
        isActive ? "text-blue-600 bg-blue-100" : "text-gray-500 hover:text-blue-700 hover:bg-blue-50"
      }`}
    >
      {icon}
      <span className="sr-only">{tooltip}</span>
      {isActive && (
        <span className="absolute bottom-0 left-1/2 w-1/2 h-0.5 bg-blue-600 transform -translate-x-1/2" />
      )}
    </Link>
  )
}

export default function Component() {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("")
  const { data: session} = useSession()
  const router = useRouter()

  const handleClick = () => {
    router.push('/signup')
  }

  useEffect(() => {
    switch (pathname) {
      case "/feed":
        setActiveTab("Home")
        break
      case "/explore":
        setActiveTab("Explore")
        break
      case "/":
        setActiveTab("Dashboard")
        break
      case "/notifications":
        setActiveTab("Notifications")
        break
      case "/flash":
        setActiveTab("Flash")
        break
      case "/nearby":
        setActiveTab("Nearby")
        break
      case "/profile":
        setActiveTab("Profile")
        break
      default:
        setActiveTab("")
    }
  }, [pathname])
  
  const navItems = [
    { icon: <Home className="h-5 w-5" />, href: "/feed", tooltip: "Home" },
    { icon: <Compass className="h-5 w-5" />, href: "/explore", tooltip: "Explore" },
    { icon: <Zap className="h-5 w-5" />, href: "/flash", tooltip: "Flash" },
    { icon: <Users className="h-5 w-5" />, href: "/nearby", tooltip: "Nearby" },
  ]

  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b sticky top-0 z-10 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
           <img src="logo.png" className="w-36" alt="corify" />
          </div>
          <nav className="hidden md:flex items-center justify-center flex-1 space-x-4">
            {navItems.map((item) => (
              <NavItem
                key={item.tooltip}
                icon={item.icon}
                href={item.href}
                isActive={activeTab === item.tooltip}
                tooltip={item.tooltip}
              />
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <NavItem
              icon={<Bell className="h-5 w-5" />}
              href="/notifications"
              isActive={activeTab === "Notifications"}
              tooltip="Notifications"
            />
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-10 w-10 text-slate-500 border border-slate-300 p-1 rounded-full" />
                    <span className="sr-only">User Profile</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {/* Add more menu items here if needed */}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleClick}
                className="bg-blue-600 text-white font-bold hover:bg-blue-500"
              >
                Signup
              </Button>
            )}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {navItems.map((item) => (
                    <DropdownMenuItem key={item.tooltip} asChild>
                      <Link href={item.href} className="flex items-center">
                        {item.icon}
                        <span className="ml-2">{item.tooltip}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  {session && (
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}