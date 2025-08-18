"use client"

import { useState, useEffect, useRef } from "react"
// import img from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface CarouselImage {
  id: number
  src: string
  alt: string
}

interface CarouselProps {
  images: CarouselImage[]
  autoplaySpeed?: number
}

export function Carousel({ images, autoplaySpeed = 3000 }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)

  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev + 1) % images?.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev - 1 + images?.length) % images?.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return
    setIsAnimating(true)
    setCurrentSlide(index)
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Handle autoplay
  useEffect(() => {
    if (isPaused) return

    const startAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }

      autoplayRef.current = setInterval(() => {
        nextSlide()
      }, autoplaySpeed)
    }

    startAutoplay()

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [autoplaySpeed, isPaused, currentSlide])

  // Progress bar animation
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = "0%"
      progressRef.current.style.transition = "none"

      setTimeout(() => {
        progressRef.current.style.width = "100%"
        progressRef.current.style.transition = `width ${autoplaySpeed}ms linear`
      }, 50)
    }
  }, [currentSlide, autoplaySpeed])

  return (
    <div
      className="relative w-full overflow-hidden bg-muted/30"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-[16/9] md:aspect-[16/9] w-full overflow-hidden">
        {images?.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-500",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0",
            )}
          >
            <Image
              src={image || "/placeholder.svg"}
               alt={`Image ${index + 1}`}
              className="object-cover w-full h-full"
              placeholder="blur"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-12 text-white z-20">
              <div className="max-w-6xl mx-auto">
                <h2
                  className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: "300ms" }}
                >
                  Discover Our Collection
                </h2>
                <p
                  className="text-sm md:text-base lg:text-lg max-w-md opacity-0 animate-fade-in-up"
                  style={{ animationDelay: "500ms" }}
                >
                  Explore our curated selection of premium home decor and furniture
                </p>
                <Button className="mt-4 md:mt-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
                  Shop Now
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
        <div className="hidden md:block">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 border border-border/50 shadow-md z-20 rounded-full h-10 w-10 flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90 border border-border/50 shadow-md z-20 rounded-full h-10 w-10 flex"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
    

      {/* Pagination dots */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {images?.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              currentSlide === index ? "bg-white w-6" : "bg-white/50 hover:bg-white/80",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-20">
        <div ref={progressRef} className="h-full bg-primary w-0" />
      </div>
    </div>
  )
}
