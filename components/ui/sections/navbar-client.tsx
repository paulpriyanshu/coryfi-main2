"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { signOut, signIn } from "next-auth/react"
import { Menu, Settings, LogOut, Search, User, Package, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { SelectDemo } from "./SelectPage"
import { DashboardIcon } from "@radix-ui/react-icons"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import ThemeSwitcher from "./ThemeSwitcher"

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
        isActive ? "text-white bg-slate-800" : "text-gray-500 hover:text-black hover:bg-slate-700"
      } transition-all duration-200 ease-in-out`}
    >
      {icon}
      <span className="sr-only">{tooltip}</span>
      {isActive && (
        <motion.span
          layoutId="activeIndicator"
          className="absolute bottom-0 left-0 w-full h-0.5 bg-black"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  )
}

export function NavbarClient({ session, userId, userDp, navItems, dashboardLink, businessId, children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [mode, setMode] = useState("normal")

  // Check if current path is a dashboard route
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/")

  const handleClick = async () => {
    await signIn("google")
  }

  const handleLogout = async () => {
    await signOut()
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setActiveTab(pathname)
  }, [pathname])

  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 w-full transition-all duration-200 
          ${isScrolled 
            ? "bg-white/80 backdrop-blur-md shadow-md dark:bg-black/50 dark:backdrop-blur-md dark:shadow-md" 
            : "bg-white dark:bg-black/40 dark:backdrop-blur-md"
          }`}
            >
      {/* <ThemeSwitcher/> */}
      <div className="container mx-auto px-4">
        <div className="flex h-12 md:h-16 items-center justify-between">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="mr-2">
                  
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col overflow-y-auto">
                <div className="flex-grow">
                  <nav className="flex flex-col space-y-4 mt-4">
                    {navItems.map((item) => (
                      <motion.div key={item.tooltip} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href={item.href}
                          className="flex items-center text-lg font-bold space-x-2 text-black dark:text-white hover:dark:text-slate-900 hover:text-black"
                          onClick={() => document.querySelector("[data-state=open]")?.click()}
                        >
                          {item.icon} 
                          <span>{item.tooltip}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </nav>

                  {/* <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Mode Selection</h3>
                    <RadioGroup value={mode} onValueChange={setMode} className="grid gap-4">
                      {[
                        { value: "normal", label: "Normal", icon: Sun },
                        { value: "professional", label: "Professional", icon: Laptop },
                        { value: "business", label: "Business", icon: Moon },
                      ].map(({ value, label, icon: Icon }) => (
                        <Label
                          key={value}
                          htmlFor={value}
                          className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary ${
                            mode === value ? "border-primary" : ""
                          }`}
                        >
                          <RadioGroupItem value={value} id={value} className="sr-only" />
                          <Icon className="mb-3 h-6 w-6" />
                          <span>{label}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div> */}
                  <Button
                    variant="outline"
                    className="w-full mt-8"
                    onClick={() => {
                      router.push("/settings/profile")
                      document.querySelector("[data-state=open]")?.click()
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                    
                </div>
                
                <Button
                  variant="outline"
                  className="w-full mt-auto mb-4"
                  onClick={() => {
                    handleLogout()
                    document.querySelector("[data-state=open]")?.click()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
                

              </SheetContent>
            </Sheet>
            {children && children[0]}

            {/* Only render SelectDemo if it's a dashboard route */}
            {isDashboardRoute && <SelectDemo businessId={businessId} />}
          </div>

          <nav className="hidden md:flex items-center justify-center space-x-4">
            <AnimatePresence>
              {navItems.map((item) => (
                <motion.div
                  key={item.tooltip}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <NavItem
                    icon={item.icon}
                    href={item.href}
                    isActive={activeTab === item.href}
                    tooltip={item.tooltip}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </nav>

          <div className="flex items-center space-x-1">
            <div className="md:hidden">
              <Link href="/users" className="mr-0 flex items-center gap-2 underline text-gray-800 hover:text-gray-600">
                <Search className="h-5 w-5 dark:text-white" />
                <span className="sr-only">Search</span>
              </Link>
            </div>
            {children && children.slice(1)}
            {session ? (
              <DropdownMenu >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-px rounded-full h-8 w-8">
                    <Avatar className="h-8 w-8 border border-slate-200">
                      <AvatarImage src={userDp || session?.user?.image} alt="User" />
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile" passHref>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href={`/orders/${userId}`} passHref>
                    <DropdownMenuItem>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Your Orders</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/premium" passHref>
                    <DropdownMenuItem>
                      <Crown className="mr-2 h-4 w-4 text-orange-400 dark:text-orange-400" />
                      <span>Premium</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href={dashboardLink} passHref>
                    <DropdownMenuItem>
                      <DashboardIcon className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                  

                  <Link href="/settings/profile" passHref>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <ThemeSwitcher/>
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleClick} className="bg-blue-600 text-white font-bold hover:bg-blue-400">
                Signup
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
