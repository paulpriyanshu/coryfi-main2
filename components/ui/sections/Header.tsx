"use client"
import Link from "next/link"
import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Home, Compass, User, Zap, Users, Menu, Settings, LogOut, Sun, Moon, Laptop, Network, Search, Store} from "lucide-react"
import Image from "next/image"
import { useSession, signOut, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { SelectDemo } from "./SelectPage"
import Notifications from "./Notifications"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/Label"
import { fetchUserId } from "@/app/api/actions/media"
import { DashboardIcon } from "@radix-ui/react-icons"
import { getBusiness, getBusinessPage, verifyMerchant } from "@/app/api/business/business"

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
        isActive ? "text-white bg-slate-800" : "text-gray-500 hover:text-black hover:bg-slate-300"
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

export default function Component() {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("")
  const { data: session } = useSession()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mode, setMode] = useState("normal")
  const [userDp, setUserDp] = useState("")
  const [userId, setUserId] = useState(null)
  const [isMerchant, setIsMerchant] = useState(false)
  const [businessId, setBusinessId] = useState("")
  const [pageId, setPageId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  
  // Check if current path is a dashboard route
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/")
  
  const handleClick = async() => {
    await signIn("google")
  }

  const handleLogout = async() => {
    await signOut()
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setActiveTab(pathname)
  }, [pathname])
  
  useEffect(() => {
    if (session?.user?.email) {
      fetchUserDetails();
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.email]);
  
  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const user = await fetchUserId(session?.user?.email);
      if (user) {
        setUserId(user.id);
        setUserDp(user.userdp);
        await verifyUserMerchant(user.id);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyUserMerchant = async (userId) => {
    try {
      const verify = await verifyMerchant(userId);
      console.log("verified", verify);
    
      if (verify && verify.data && verify.data.Merchant_Id) {
        await fetchBusinessData(verify.data.Merchant_Id);
        
      } else {
        // Ensure we mark as not a merchant if verification fails
        setIsMerchant(false);
      }
    } catch (error) {
      console.error("Error verifying merchant:", error);
      setIsMerchant(false);
    }
  };
  
  const fetchBusinessData = async (merchantId) => {
    try {
      const business_data = await getBusiness(merchantId);
      console.log("businessdata", business_data);
      if (business_data && business_data.business && business_data.business.Business_Id) {
        setIsMerchant(true);
        setBusinessId(business_data.business.Business_Id);
        await fetchBusinessPageData(business_data.business.Business_Id);
      }
    } catch (error) {
      console.error("Error fetching business data:", error);
    }
  };
  
  const fetchBusinessPageData = async (businessId) => {
    try {
      const business_pageData = await getBusinessPage(businessId);
      console.log("page layout", business_pageData);
    
      if (business_pageData?.pageData?.pageId) {
        setPageId(business_pageData.pageData.pageId);
      }
    } catch (error) {
      console.error("Error fetching business page data:", error);
    }
  };

  const handleDashboardClick = (e) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    
    // No need to preventDefault if we're letting the normal Link behavior work
  };

  const getDashboardLink = () => {
    if (isLoading) {
      // Return a loading state or current path to prevent navigation while loading
      return pathname;
    }
    
    if (isMerchant && businessId && pageId) {
      return `/dashboard/${businessId}/${pageId}`;
    } else {
      return `/becomeMerchant/${userId}`;
    }
  };
  
  const navItems = [
    { icon: <Home className="h-5 w-5" />, href: "/feed", tooltip: "Home" },
    { icon: <Network className="h-5 w-5" />, href: "/", tooltip: "Network" },
    { icon: <Store className="h-5 w-5" />, href: "/explore", tooltip: "Explore" },
    

  ]

  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md' : 'bg-white'}`}
    >
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
              <SheetContent 
                side="left" 
                className="w-[300px] sm:w-[400px] flex flex-col overflow-y-auto"
              >
                <div className="flex-grow">
                  <nav className="flex flex-col space-y-4 mt-4">
                    {navItems.map((item) => (
                      <motion.div
                        key={item.tooltip}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center text-lg font-bold space-x-2 text-black hover:text-black"
                          onClick={() => document.querySelector("[data-state=open]")?.click()}
                        >
                          {item.icon}
                          <span>{item.tooltip}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                  <div className="mt-8">
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
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-8"
                    onClick={() => {
                      router.push('/settings/profile');
                      document.querySelector("[data-state=open]")?.click();
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
                    handleLogout();
                    document.querySelector("[data-state=open]")?.click();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center justify-start md:ml-10">
              <Image
                src="/logo.png"
                alt="Company Logo"
                width={120}
                height={40}
                className="w-auto h-8 md:h-10"
              />
            </Link>
            
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
              <Link
                href="/search"
                className="mr-0 flex items-center gap-2 underline text-gray-800 hover:text-gray-600"
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Link>
            </div>
            <Notifications/>
            {session ? (
              <DropdownMenu>
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
                  <Link 
                    href={getDashboardLink()} 
                    passHref
                    onClick={handleDashboardClick}
                  >
                    <DropdownMenuItem className={isLoading ? "opacity-70 cursor-not-allowed" : ""}>
                      <DashboardIcon className="mr-2 h-4 w-4" />
                      <span>{isLoading ? "Loading..." : "Dashboard"}</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setMode("normal")}>
                    Normal Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setMode("professional")}>
                    Professional Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setMode("business")}>
                    Business Mode
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <Link href="/settings/profile" passHref>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleClick}
                className="bg-blue-600 text-white font-bold hover:bg-blue-400"
              >
                Signup
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}