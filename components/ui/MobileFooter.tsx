"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Home, PlusSquare, Network, Store,ShoppingBag } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import DraftAlert from "./DraftAlert"
import { useAppSelector } from "@/app/libs/store/hooks"
import Link from "next/link"
import CartButton from "./sections/cart-button"
import { fetchUserData, fetchUserId } from "@/app/api/actions/media"

const hiddenRoutes = ["/c"]

export default function MobileFooter({session}) {
  const [activePage, setActivePage] = useState("network")
  const [hasDraft, setHasDraft] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [userId,setUserId]=useState(null)


  const pathname = usePathname()
  const isMobileChatOpen = useAppSelector((state) => state.chat.isMobileChatOpen)

  const shouldHideFooter = hiddenRoutes.some((route) => pathname.startsWith(route)) || isMobileChatOpen
  useEffect(()=>{
    async function fetchId(){
      if(session?.user?.email){
        const user=await fetchUserId(session?.user?.email)
        setUserId(user.id)
      }
      
    }
     fetchId()
  },[session?.user?.email])
  useEffect(() => {
    const draft = localStorage.getItem("postDraft")
    setHasDraft(!!draft)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      } else if (currentScrollY > 50 && currentScrollY > lastScrollY) {
        setIsVisible(false)
      }
      setLastScrollY(currentScrollY)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

 

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newRipple = {
      id: Date.now(),
      x,
      y,
    }

    setRipples((prev) => [...prev, newRipple])

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id))
    }, 800)
  }

  function NavButton({
    icon,
    label,
    isActive,
    onClick,
    href,
    hasNotification = false,
  }: {
    icon: React.ReactNode
    label: string
    isActive: boolean
    onClick: () => void
    href: string
    hasNotification?: boolean
  }) {
    return (
      <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="relative">
        <Link href={href}>
          <button
            onClick={(e) => {
              createRipple(e)
              onClick()
            }}
            className={cn(
              "relative overflow-hidden transition-all duration-300 flex items-center justify-center p-2 rounded-xl min-w-[44px]",
              isActive
                ? "bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30"
                : "hover:bg-white/10 hover:backdrop-blur-sm",
            )}
          >
            {/* Ripple effects */}
            {ripples.map((ripple) => (
              <motion.div
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute bg-white/30 rounded-full pointer-events-none"
                style={{
                  left: ripple.x - 8,
                  top: ripple.y - 8,
                  width: 16,
                  height: 16,
                }}
              />
            ))}

            <div
              className={cn(
                "relative transition-all duration-300 flex items-center justify-center",
                isActive ? "text-blue-400 scale-110" : "text-gray-500 dark:text-gray-400",
              )}
            >
              {icon}
              {hasNotification && (
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-black"
                />
              )}
            </div>

            <span className="sr-only">{label}</span>

            {/* Active indicator */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -bottom-1 w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </AnimatePresence>
          </button>
        </Link>
      </motion.div>
    )
  }

  function CreateButton() {
    return (
      <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9, rotate: -5 }} className="relative">
        <motion.button
          onClick={(e) => {
            createRipple(e)
          }}
          className="relative overflow-hidden bg-gradient-to-br  text-black dark:text-white rounded-full p-2.5 shadow-xl shadow-blue-600/20 border border-white/20"
          whileHover={{
            boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.3), 0 10px 10px -5px rgba(139, 92, 246, 0.1)",
          }}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 opacity-0"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Ripple effects */}
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute bg-white/40 rounded-full pointer-events-none"
              style={{
                left: ripple.x - 8,
                top: ripple.y - 8,
                width: 16,
                height: 16,
              }}
            />
          ))}

          <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }} className="relative z-10">
            <PlusSquare className="h-5 w-5" />
          </motion.div>
          <span className="sr-only">Create</span>
        </motion.button>

        {/* Floating particles effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i * Math.PI) / 3) * 30,
                y: Math.sin((i * Math.PI) / 3) * 30,
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.1,
              }}
              style={{
                left: "50%",
                top: "50%",
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    )
  }

  // If the footer should be hidden, return null after all hooks have been defined
  if (shouldHideFooter) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
            opacity: { duration: 0.2 },
          }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          {/* Backdrop blur with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/90 to-white/80 dark:from-black/95 dark:via-black/90 dark:to-black/80 backdrop-blur-xl" />

          {/* Top border gradient */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-800" />

          <footer className="relative">
            <nav className="flex justify-around items-center px-6 py-1 max-w-md mx-auto">
              <NavButton
                icon={<Home className="w-5 h-5" />}
                label="Home"
                isActive={activePage === "home"}
                onClick={() => setActivePage("home")}
                href="/feed"
              />

              <NavButton
                icon={<Network className="w-5 h-5" />}
                label="Network"
                isActive={activePage === "network"}
                onClick={() => setActivePage("network")}
                href="/"
                hasNotification={true}
              />
              <Link href={"/create/m"} passHref>
              <CreateButton/>
              </Link>
              

              <NavButton
                icon={<Store className="w-5 h-5" />}
                label="Explore"
                isActive={activePage === "explore"}
                onClick={() => setActivePage("explore")}
                href="/explore"
              />
              <CartButton userId={userId}/>
              {/* <NavButton
                icon={<ShoppingBag className="w-5 h-5" />}
                label="Cart"
                isActive={activePage === "profile"}
                onClick={() => setActivePage("profile")}
                href="/cart"
                hasNotification={false}
              /> */}
            </nav>
          </footer>
          <DraftAlert isOpen={hasDraft} onClose={() => setHasDraft(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
