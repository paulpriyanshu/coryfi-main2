"use client"

import React, { useState, useEffect } from "react"
import { Home, PlusSquare, Zap, User, Network, Store, MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import CreatePostModal from "./CreatePostModal"
import DraftAlert from "./DraftAlert"
import { useAppSelector } from "@/app/libs/store/hooks"
import Link from "next/link"

const hiddenRoutes=["/c"]

export default function MobileFooter() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activePage, setActivePage] = useState("network")
  const [hasDraft, setHasDraft] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const isMobileChatOpen = useAppSelector((state) => state.chat.isMobileChatOpen)
  
  const shouldHideFooter = hiddenRoutes.some((route) =>
    pathname.startsWith(route)
  ) || isMobileChatOpen;

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

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    if (hasDraft) {
      setHasDraft(true)
    }
  }



function NavButton({ icon, label, isActive, onClick, href }) {
  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Link href={href}>
        <button
          onClick={onClick}
          className={cn(
            "relative transition-colors flex items-center justify-center",
            isActive ? "bg-slate-800 rounded-full p-2" : "text-gray-600"
          )}
        >
          <div
            className={cn(
              "w-5 h-5 flex items-center justify-center",
              isActive ? "text-white" : "text-gray-600"
            )}
          >
            {icon}
          </div>
          <span className="sr-only">{label}</span>
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute bottom-0 left-1/2 w-1 h-1 bg-black rounded-full"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              style={{ x: "-50%" }}
            />
          )}
        </button>
      </Link>
    </motion.div>
  );
}

  function CreateButton({ onClick }) {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="bg-gradient-to-r from-black to-cyan-600 text-white rounded-full p-3 shadow-lg"
      >
        <PlusSquare className="h-5 w-5" />
        <span className="sr-only">Create</span>
      </motion.button>
    )
  }

  // If the footer should be hidden, return null after all hooks have been defined
  if (shouldHideFooter) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-10 dark:bg-black"
        >
          <footer className="bg-white dark:bg-black">
            <nav className="flex justify-around items-center h-11 pb-2 pt-2">
              <NavButton
                icon={<Home className="dark:text-white"/>}
                label="Home"
                isActive={activePage === "home"}
                onClick={() => setActivePage("home")}
                href="/feed"
              />
              <NavButton
                icon={<Network className="dark:text-white"/>}
                label="Network"
                isActive={activePage === "network"}
                onClick={() => setActivePage("network")}
                href="/"
              />
              <CreateButton onClick={() => setIsCreateModalOpen(true)} />
              <NavButton
                icon={<Store className="dark:text-white"/>}
                label="Explore"
                isActive={activePage === "explore"}
                onClick={() => setActivePage("explore")}
                href="/explore"
              />
              <NavButton
                icon={<MessageCircle className="dark:text-white"/>}
                label="Profile"
                isActive={activePage === "profile"}
                onClick={() => setActivePage("profile")}
                href={`/?tab=chats&expand=true`}
              />
            </nav>
          </footer>
          <CreatePostModal isOpen={isCreateModalOpen} onClose={handleCloseModal} />
          <DraftAlert isOpen={hasDraft} onClose={() => setHasDraft(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}