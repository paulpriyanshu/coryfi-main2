"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from 'next/navigation'
import Image from "next/image"

type Category = {
  id: number
  name: string
  image: string
  description: string
  itemCount: number
}

export function CategoryCarouselClient({
  enhancedCategories,
  productSectionId,
}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slidesPerView, setSlidesPerView] = useState(3)
  const [totalSlides, setTotalSlides] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  
  // Add router and searchParams
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategorySelect = (categoryId) => {
    // Find the category by ID
    const selectedCategory = enhancedCategories.find(c => c.id === categoryId)
    
    if (selectedCategory) {
      // Create new URLSearchParams object based on current params
      const params = new URLSearchParams(searchParams.toString())
      
      // Set the category parameter
      params.set('category', selectedCategory.name)
      
      // Update the URL with the new search parameters
      router.push(`?${params.toString()}`)
      
      // Scroll to product section smoothly if ID is provided
      if (productSectionId) {
        setTimeout(() => {
          const productSection = document.getElementById(productSectionId)
          if (productSection) {
            productSection.scrollIntoView({ behavior: 'smooth' })
          }
        }, 200)
      }
    }
  }

  useEffect(() => {
    const updateSlidesView = () => {
      // Always show 3 slides per view on larger screens
      if (window.innerWidth >= 640) {
        setSlidesPerView(3)
      } else {
        setSlidesPerView(1)
      }
    }

    updateSlidesView()
    window.addEventListener("resize", updateSlidesView)
    return () => window.removeEventListener("resize", updateSlidesView)
  }, [])

  useEffect(() => {
    if (enhancedCategories.length > 0) {
      setTotalSlides(Math.max(1, Math.ceil(enhancedCategories.length / slidesPerView)))
    }
  }, [enhancedCategories.length, slidesPerView])

  // Autoplay functionality
  useEffect(() => {
    const startAutoplay = () => {
      if (totalSlides <= 1) return

      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides)
      }, 5000)
    }

    startAutoplay()

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [totalSlides])

  // Progress bar animation
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = "0%"
      progressRef.current.style.transition = "none"

      setTimeout(() => {
        progressRef.current.style.width = "100%"
        progressRef.current.style.transition = "width 5000ms linear"
      }, 50)
    }
  }, [currentSlide])

  // Check for selected category in URL and scroll into view on initial load
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam && productSectionId) {
      const productSection = document.getElementById(productSectionId)
      if (productSection) {
        productSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [searchParams, productSectionId])

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      setCurrentSlide(0)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    } else {
      setCurrentSlide(totalSlides - 1)
    }
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Touch and mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2
    const slideWidth = carouselRef.current.offsetWidth

    if (Math.abs(walk) > slideWidth / 4) {
      if (walk > 0) {
        prevSlide()
      } else {
        nextSlide()
      }
      setIsDragging(false)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2
    const slideWidth = carouselRef.current.offsetWidth

    if (Math.abs(walk) > slideWidth / 4) {
      if (walk > 0) {
        prevSlide()
      } else {
        nextSlide()
      }
      setIsDragging(false)
    }
  }

  return (
    <div className="relative px-1 py-6 md:py-8">
      <div
        className="overflow-hidden rounded-xl cursor-grab"
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <div
          className={cn("flex transition-transform duration-500", isDragging ? "ease-out" : "ease-out")}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {enhancedCategories.length > 0 &&
            Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0 flex gap-4 md:gap-6">
                {enhancedCategories
                  .slice(slideIndex * slidesPerView, slideIndex * slidesPerView + slidesPerView)
                  .map((category) => (
                    <div key={category.id} onClick={() => handleCategorySelect(category.id)}>
                        <CategoryCard key={category.id} category={category} />
                    </div>
                  ))}
              </div>
            ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-muted mt-4 rounded-full overflow-hidden">
        <div ref={progressRef} className="h-full bg-primary rounded-full w-0" />
      </div>

      {/* Navigation controls */}
      <div className="flex  items-center justify-between mt-4">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "transition-all duration-300",
                currentSlide === index ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentSlide === index ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
              />
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="h-8 w-8 rounded-full border border-border/50"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="h-8 w-8 rounded-full border border-border/50"
            disabled={currentSlide === totalSlides - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Client component for interactive category card
function CategoryCard({ category }: { category: Category }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="w-full aspect-[4/4] md:aspect-[5/3] relative group cursor-pointer overflow-hidden rounded-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 33vw"
          priority
        />
      </div>

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-500",
          isHovered ? "opacity-95" : "opacity-80",
        )}
      />

      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-end p-4 md:p-6 transition-all duration-500",
          isHovered ? "translate-y-0" : "translate-y-2",
        )}
      >
        <div className="space-y-2">
          <span className="inline-block px-2 py-0.5 bg-primary/20 backdrop-blur-sm text-primary text-xs rounded-full">
            {category.itemCount} items
          </span>

          <h3
            className={cn(
              "text-white text-xl md:text-2xl font-bold transition-all duration-500",
              isHovered ? "translate-y-0" : "translate-y-0",
            )}
          >
            {category.name}
          </h3>

          <p
            className={cn(
              "text-white/80 text-sm transition-all duration-500",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            {category.description}
          </p>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "mt-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white transition-all gap-1",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
          >
            Explore
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Interactive overlay effect */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent opacity-0 transition-opacity duration-500",
          isHovered ? "opacity-40" : "opacity-0",
        )}
      />
    </div>
  )
}