"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp } from "lucide-react"

export default function ScrollToTopButton() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!showScrollTop) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
      <Button
        className="w-10 h-10 opacity-80 rounded-full p-2 bg-gray-200 dark:bg-black/60 dark:text-white hover:bg-slate-500 text-black shadow-lg"
        onClick={scrollToTop}
        size="icon"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
    </div>
  )
}

